const Surreal = require(`surrealdb.js`)
const {surrealDBSignIn, surrealDBUse, surrealDBSelect} = require(`../database/surrealdb`)
const Registry = require(`../registry`)

module.exports = (name, args) => {
    return async (req, res, next) => {
        let db = Registry.get(`SurrealDBConnection`)
        
        if (!db) {
            db = new Surreal.default(`wss://localhost:8000/rpc`)
            // db = new Surreal.default(`wss://vdydb.fly.dev/rpc`)
            await surrealDBSignIn(db, `root`, `root`)
            await surrealDBUse(db, `test`, `test`)
            Registry.register(db, `SurrealDBConnection`)
        }
        
        const result = await surrealDBSelect(db, args.table);
        res.send(JSON.stringify(result))
        next && next()
    }
}
