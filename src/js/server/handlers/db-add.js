const {fileDBCreate} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const {getNewId} = require(`../utility/new-id`)
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Adds a new record to the database.
     * 
     * Validates JWT token from Authorization header.
     * Runs request body through preprocessor if provided. 
     * Validates processed request body if validator provided.
     * Generates new unique ID for record.
     * Writes new record to database.
     * Runs response through postprocessor if provided.
     * Returns new JWT token and success response.
     */
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const authorizationHeader = req.get(`Authorization`)
        let originalRequest = req.body
        let processedRequest = originalRequest

        if (!db) {
            const err = `503 Service Unavailable`
            logError(`${err}: DB`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!entry?.args?.table) {
            const err = `503 Service Unavailable`
            logError(`${err}: Missing entry.args.table.`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!originalRequest) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: No data found in request body.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }

        const jwtValidationResult = await jwtValidation(authorizationHeader)

        if (200 !== jwtValidationResult.status) {
            res.status(jwtValidationResult.status).send(jwtValidationResult.err)
            next && next(jwtValidationResult.err)
            return
        }

        if (entry.args.preprocessor) {
            const { preprocessor } = require(entry.args.preprocessor)
            const preprocessorResult = await preprocessor(originalRequest)

            if (200 !== preprocessorResult.status) {
                res.status(preprocessorResult.status).send(preprocessorResult.err)
                next && next(preprocessorResult.err)
                return
            } else {
                processedRequest = preprocessorResult.processedRequest
            }
        }

        if (entry.args.validator) {
            const { validator } = require(entry.args.validator)
            const validatorResult = await validator(processedRequest)

            if (200 !== validatorResult.status) {
                res.status(validatorResult.status).send(validatorResult.err)
                next && next(validatorResult.err)
                return
            }
        }

        const newId = await getNewId(db, entry.args.table)
        const newRecordId = `${entry.args.table}:${newId}`

        await fileDBCreate(db, newRecordId, processedRequest)

        if (entry.args.postprocessor) {
            const { postprocessor } = require(entry.args.postprocessor)
            const postprocessorResult = await postprocessor(originalRequest, processedRequest, response)

            if (200 !== postprocessorResult.status) {
                res.status(postprocessorResult.status).send(postprocessorResult.err)
                next && next(postprocessorResult.err)
                return
            }
        }

        const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)

        if (200 !== jwtReplaceTokenResult.status) {
            res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
            next && next(jwtReplaceTokenResult.err)
            return
        }

        let response = { jwt: jwtReplaceTokenResult.jwt, payload: { response: `Operation completed.` } }

        res.status(200).send(JSON.stringify(response))
    }
}