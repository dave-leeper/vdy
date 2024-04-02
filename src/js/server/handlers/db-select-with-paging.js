const {fileDBSelect} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const DB = require(`../database/db`)
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Handles a database select request with pagination.
     * 
     * Retrieves data from the database for the given table. Applies pagination based on the 
     * provided pageSize and page query parameters.
     * 
     * Returns the paginated data and total page count in the response.
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

        const pageSize = req.query?.pagesize
        const page = req.query?.page
        let data = await fileDBSelect(db, entry.args.table)
        let pageCount = 0

        if (!isNaN(pageSize) && !isNaN(page) && 0 < pageSize && 0 <= page) {
            data = DB.paginate(data, pageSize, page)
            pageCount = DB.pageCount(data, pageSize)
        }

        const result = { data, pageCount }

        res.send(JSON.stringify(result))
        next && next()
    }
}