const {fileDBChange} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const authorizationHeader = req.get(`Authorization`)
        let originalRequest = JSON.parse(req.body)

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
            logError(`Status ${jwtValidationResult.status}: No JWT found for user.`)
            res.status(jwtValidationResult.status).send(jwtValidationResult.err)
            next && next(jwtValidationResult.err)
            return
        }

        let processedRequest = originalRequest

        if (entry.args.preprocessor) {
            const {preprocessor} = require(entry.args.preprocessor)
            const preprocessorResult = await preprocessor(originalRequest)

            if (200 !== preprocessorResult.status) {
                logError(`Status ${preprocessorResult.status}: Preprocessing error.`)
                res.status(preprocessorResult.status).send(preprocessorResult.err)
                next && next(preprocessorResult.err)
                return
            } else {
                processedRequest = preprocessorResult.processedRequest
            } 
        }

        if (entry.args.validator) {
            const {validator} = require(entry.args.validator)
            const validatorResult = await validator(processedRequest)

            if (200 !== validatorResult.status) {
                logError(`Status ${validatorResult.status}: Validation error.`)
                res.status(validatorResult.status).send(validatorResult.err)
                next && next(validatorResult.err)
                return
            }    
        }

        const result = await fileDBChange(db, processedRequest.id, processedRequest)

        if (!result) {
            logError(`Status 500: Error updating database.`)
            res.status(500).send(`Failed to update database.`)
            next && next(`Failed to update database.`)
            return
        }

        if (entry.args.postprocessor) {
            const {postprocessor} = require(entry.args.postprocessor)
            const postprocessorResult = await postprocessor(originalRequest, processedRequest, response)

            if (200 !== postprocessorResult.status) {
                logError(`Status ${postprocessorResult.status}: Postprocessing error error.`)
                res.status(postprocessorResult.status).send(postprocessorResult.err)
                next && next(postprocessorResult.err)
                return
            } else {
                response = postprocessorResult.newResponse
            } 
        }

        const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)
        let response = { jwt: jwtReplaceTokenResult.jwt, payload: { response: `Operation completed.` }}

        if (200 !== jwtReplaceTokenResult.status) {
            logError(`Status ${jwtReplaceTokenResult.status}: Error refreshing JWT token.`)
            res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
            next && next(jwtReplaceTokenResult.err)
            return
        }

        res.status(200).send(JSON.stringify(response))
    }
}