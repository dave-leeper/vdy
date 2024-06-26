const Registry = require(`../utility/registry`)
const {fileDBQuery} = require(`../database/file-db-old`)
const {jwtCreate} = require(`../utility/jwt-create`)
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Login handler. Validates user credentials and returns a JWT token on success.
     * 
     * @param {Object} req - Express request object 
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const json = JSON.parse(req.body)
        const name = json.name
        const password = json.password

        if (!db) {
            const err = `503 Service Unavailable`

            logError(`${err}: Database not available.`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!name || !password) {
            const err = `401 Unauthorized`

            logError(`${err}: User name or password not supplied by login request.`)
            res.status(401).send(err)
            next && next(err)
            return
        }

        const queryOptions = { tb: `user` }
        const queryResult = await fileDBQuery(null, null, queryOptions)
        const recordsFound = queryResult[0]?.result?.length

        if (!recordsFound) {
            const err = `401 Unauthorized`

            logError(`${err}: User name "${name}" not found in database.`)
            res.status(401).send(err)
            next && next(err)
            return
        }

        let userFound = false

        for (let user of queryResult[0]?.result) {
            if (user.userName === name) {
                userFound = true
                break
            }
        }
        if (!userFound) {
            const err = `401 Unauthorized`

            logError(`${err}: User name "${name}" not found in database.`)
            res.status(401).send(err)
            next && next(err)
            return
        }

        if (queryResult[0].result[0].password !== password) {
            const err = `401 Unauthorized`

            logError(`${err}: User "${name}" provided the wrong password.`)
            res.status(401).send(err)
            next && next(err)
            return
        }

        const jwtCreateResult = await jwtCreate(name)

        if (200 !== jwtCreateResult.status) {
            res.status(jwtCreateResult.status).send(jwtCreateResult.err)
            next && next(jwtCreateResult.err)
            return
        }

        res.status(200).send(JSON.stringify(jwtCreateResult.clientResponse))
        next && next()
    }
}
