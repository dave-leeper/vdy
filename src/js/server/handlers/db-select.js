const {fileDBSelect} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        
        if (!db) {
            const err = `503 Service Unavailable`
            logError(`${err}: DB`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!entry?.args?.table) {
            const err = `503 Service Unavailable`
            logError(`${err}: Missing entry.args.table.`)
            res.status(503).send(err)
            next && next(err)
            return
        }

        const result = await fileDBSelect(db, entry.args.table)
        res.send(JSON.stringify(result))
        next && next()
    }
}