const {fileDBDelete} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const authorizationHeader = req.get(`Authorization`)
        const request = JSON.parse(req.body)

        if (!db) {
            const err = `503 Service Unavailable`
            logError(`${err}: DB`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!request) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: No data found in request body.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }

        if (!request.id) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: No id found in request body.`)
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

        await fileDBDelete(db, request.id)
        
        const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)

        if (200 !== jwtReplaceTokenResult.status) {
            res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
            next && next(jwtReplaceTokenResult.err)
            return
        }

        let response = { jwt: jwtReplaceTokenResult.jwt, payload: { response: `Operation completed.` }}
        res.status(200).send(JSON.stringify(response))
    }
}