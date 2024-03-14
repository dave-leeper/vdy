const {fileDBChange, fileDBSelect} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        logError(`update-reply A`)
        const db = Registry.get(`FileDBConnection`)
        const authorizationHeader = req.get(`Authorization`)
        const reply = JSON.parse(req.body)
        
        logError(`update-reply B ${db}`)
        if (!db) {
            logError(`update-reply B Error`)
            const err = `503 Service Unavailable`
            const result = { status: 503, err }

            logError(`${err}: Database not available.`)
            res.status(result.status).send(JSON.stringify(result))
            next && next(err)
            return
        }
        logError(`update-reply C ${authorizationHeader}`)
        if (!authorizationHeader) {
            logError(`update-reply C Error`)
            const err = `401 Unauthorized`
            const result = { status: 401, err }

            logError(`${err}: Authorization header not sent with request.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }
        logError(`update-reply D ${JSON.stringify(reply)}`)
        if (!reply) {
            logError(`update-reply D Error`)
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: No reply found in request body.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }
        if (!reply.id) {
            logError(`update-reply D2 Error`)
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: No reply.id found in request body.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }

        const jwtValidationResult = await jwtValidation(authorizationHeader)

        logError(`update-reply E ${JSON.stringify(jwtValidationResult)}`)
        if (200 !== jwtValidationResult.status) {
            logError(`update-reply E Error`)
            res.status(jwtValidationResult.status).send(jwtValidationResult.err)
            next && next(jwtValidationResult.err)
            return
        }

        logError(`update-reply F`)
        const date = new Date();
        const today = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear()
        let updateData = {}
        
        updateData.reply = reply.reply
        updateData.date = today


        logError(`update-reply G ${JSON.stringify(reply)} ${JSON.stringify(updateData)}`)
        await fileDBChange(db, reply.id, updateData)

        logError(`update-reply H ${JSON.stringify(jwtValidationResult)}`)
        const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)


        logError(`update-reply I ${JSON.stringify(jwtReplaceTokenResult)}`)
        if (200 !== jwtReplaceTokenResult.status) {
            logError(`update-reply I Error`)
            res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
            next && next(jwtReplaceTokenResult.err)
            return
        }

        logError(`update-reply G`)
        let response = { jwt: jwtReplaceTokenResult.jwt, payload: null }
        res.status(200).send(JSON.stringify(response))
        next && next()
    }
}
