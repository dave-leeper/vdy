const {fileDBSelect} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {log, logError} = require('../utility/log')
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)

module.exports = (entry) => {
    /**
     * Handler for GET database endpoint. 
     * 
     * Authenticates request, gets database collections from file DB, 
     * replaces JWT token, and returns response with new JWT token and database payload.
     */
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

        const admin = await fileDBSelect(db, `admin`)
        const analytics = await fileDBSelect(db, `analytics`)
        const news = await fileDBSelect(db, `news`)
        const photo = await fileDBSelect(db, `photo`)
        const quote = await fileDBSelect(db, `quote`)
        const reservation = await fileDBSelect(db, `reservation`)
        const review = await fileDBSelect(db, `review`)
        const text = await fileDBSelect(db, `text`)
        const user = await fileDBSelect(db, `user`)
        const database = { admin, analytics, news, photo, quote, reservation, review, text, user }
        const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)
        let response = { jwt: jwtReplaceTokenResult.jwt, payload: { status: 200, database } }

        res.send(JSON.stringify(response))
        next && next()
    }
}