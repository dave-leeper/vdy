const {surrealDBChange, surrealDBSelect} = require(`../database/surrealdb`)
const Registry = require(`../registry`)
const {jwtValidation} = require(`./jwt-validation`)

module.exports = (name, args) => {
    return async (req, res, next) => {
        let db = Registry.get(`SurrealDBConnection`)
        const authorizationHeader = req.get(`Authorization`)
        const reply = req.body
        
        if (!db) {
            const err = `503 Service Unavailable`
            const result = { status: 503, err }

            console.error(err + `: Database not available.`)
            res.status(result.status).send(JSON.stringify(result))
            next && next(err)
            return
        }
        if (!authorizationHeader) {
            const err = `401 Unauthorized`
            const result = { status: 401, err }

            console.error(err + `: Authorization header not sent with request.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }
        if (!reply) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            console.error(err + `: No reply found in request body.`)
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

        const date = new Date();
        const today = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear()
        const replyData = {}
        
        replyData.reply = reply.reply
        replyData.date = today
        await surrealDBChange(db, reply.id, replyData)
        let x = await surrealDBSelect(db, reply.id)
    
        res.status(200).send(JSON.stringify(reply))
        next && next()
    }
}
