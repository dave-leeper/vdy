const {surrealDBSelect} = require(`../database/surrealdb`)
const Registry = require(`../registry`)

module.exports = (name, args) => {
    return async (req, res, next) => {
        let db = Registry.get(`SurrealDBConnection`)
        
        if (!db) {
            const err = `503 Service Unavailable: Surreal DB`
            console.error(err)
            res.status(503).send(err)
            next && next(err)
            return
        }
        
        const result = await surrealDBSelect(db, args.table);
        res.send(JSON.stringify(result))
        next && next()
    }
}
