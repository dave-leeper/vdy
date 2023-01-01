const Registry = require(`../registry`)

module.exports = (name, args) => {
    return async (req, res, next) => {
        const db = Registry.get(`SurrealDBConnection`)
        const jwt = Registry.get(`JWT`)
        const name = req.body.name
        const password = req.body.password

        if (!db) {
            const err = `503 Service Unavailable`

            console.error(err + `: Database not available.`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!jwt) {
            const err = `503 Service Unavailable`

            console.error(err + `: Javascript Web Token service not available.`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!process.env.JWT_SECRET_KEY) {
            const err = `503 Service Unavailable`

            console.error(err + `: Javascript Web Token key not available.`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!name || !password) {
            const err = `401 Unauthorized`

            console.error(err + `: User name or password not supplied by login request.`)
            res.status(401).send(err)
            next && next(err)
            return
        }

        const query = `SELECT * FROM user:${name}`
        const queryResult = await db.query(query)

        if (0 === queryResult[0].result.length) {
            const err = `401 Unauthorized`

            console.error(err + `: User name "${name}" not found in database.`)
            res.status(401).send(err)
            next && next(err)
            return
        }
        if (queryResult[0].result[0].password !== password) {
            const err = `401 Unauthorized`

            console.error(err + `: User "${name}" provided the wrong password.`)
            res.status(401).send(err)
            next && next(err)
            return
        }

        const jwtSecretKey = process.env.JWT_SECRET_KEY
        const claims = { iss: `vdy`, roles: queryResult[0].result[0].roles }
        const token = jwt.sign(claims, jwtSecretKey)
        const roles = queryResult[0].result[0].roles
        const image = queryResult[0].result[0].image? queryResult[0].result[0].image : `generic-avatar`
        const registryEntry = { expires: new Date().addHours(1), name, roles, image }
        const clientResponse = { token, roles, image }

        console.log(JSON.stringify(clientResponse))

        Registry.register(registryEntry, token)
        res.send(JSON.stringify(clientResponse))
        next && next()
    }
}
