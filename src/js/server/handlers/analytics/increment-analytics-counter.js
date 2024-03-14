const {fileDBChange, fileDBSelect} = require(`../../database/file-db-old`)
const Registry = require(`../../utility/registry`)
const {log, logError} = require('../../utility/log')

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const requestBody = req.body
        
        if (!db) {
            const err = `503 Service Unavailable`
            const result = { status: 503, err }

            logError(`${err}: Database not available.`)
            res.status(result.status).send(JSON.stringify(result))
            next && next(err)
            return
        }
        if (!requestBody) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: No reply found in request body.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }

        const recordId = `analytics:0`
        const fieldId = entry.args.metric
        let updateData = {}
        let analytics = await fileDBSelect(db, recordId)
        
        analytics = analytics[0]
        if (!analytics[fieldId]) { updateData[fieldId] = 1 }
        else { updateData[fieldId] = analytics[fieldId] + 1 }
        await fileDBChange(db, recordId, updateData)

        res.status(200).send(`OK`)

        next && next()
    }
}
