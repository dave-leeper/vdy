const {fileDBSelect} = require(`../../database/file-db-old`)
const Registry = require(`../../utility/registry`)
const {jwtValidation} = require(`../../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../../utility/jwt-replace-token`)
const {log, logError} = require('../../utility/log')

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const authorizationHeader = req.get(`Authorization`)

        if (!db) {
            const err = `503 Service Unavailable`
            logError(`${err}: DB`)
            res.status(503).send(err)
            next && next(err)
            return
        }

        const jwtValidationResult = await jwtValidation(authorizationHeader)

        if (200 !== jwtValidationResult.status) {
            res.status(jwtValidationResult.status).send(jwtValidationResult.err)
            next && next(jwtValidationResult.err)
            return
        }

        const result = await fileDBSelect(db, `analytics`)
        const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)
        const response = { jwt: jwtReplaceTokenResult.jwt, payload: { response: result }}

        if (200 !== jwtReplaceTokenResult.status) {
            res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
            next && next(jwtReplaceTokenResult.err)
            return
        }

        res.status(200).send(JSON.stringify(response))
    }
}