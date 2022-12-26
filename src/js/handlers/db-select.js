const Surreal = require(`surrealdb.js`)
const {surrealDBSignIn, surrealDBUse, surrealDBSelect} = require(`../database/surrealdb`)

module.exports = (name, args) => {
    return async (req, res, next) => {
        const db = new Surreal.default(`wss://vdydb.fly.dev/rpc`)

        await surrealDBSignIn(db, `root`, `root`)
        await surrealDBUse(db, `test`, `test`)
        const result = await surrealDBSelect(db, args.table);
        res.send(JSON.stringify(result))
        next && next()
    }
}
