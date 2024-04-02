const {fileDBSelect} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Handles a database select request by:
     * - Logging the entry 
     * - Getting the FileDBConnection from the registry
     * - Returning 503 error if DB not available
     * - Returning 503 error if no entry.args.table provided 
     * - Calling fileDBSelect with db and table args
     * - Sending result as JSON response
     * - Calling next()
     */
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