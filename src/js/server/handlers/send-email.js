const Registry = require(`../utility/registry`)
const {sendEmail} = require('../utility/send-email')
const {fileDBQuery, fileDBCreate, fileDBChange} = require(`../database/file-db-old`)
const {getNewId} = require(`../utility/new-id`)
const {log, logError} = require('../utility/log')
let adminRecord = null

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const originalRequest = req.body
        let json

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
        if (!entry?.args?.formatter) {
            const err = `503 Service Unavailable`
            logError(`${err}: Missing entry.args.formatter.`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!originalRequest) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: No data found in request body.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }
        try {
            json = JSON.parse(originalRequest)
        } catch (e) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: Could not parse request.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }

        const formatter = require(entry.args.formatter)

        const formattedData = formatter(json)


        if (200 !== formattedData.status) {
            logError(`send-email: ${formattedData.status} ${formattedData.text}`)
            res.status(formattedData.status).send(formattedData.text)
            next && next(formattedData.text)
            return
        }
        if (null === adminRecord) {
            try {
                const queryResult = await fileDBQuery(db, ``, {tb: `admin`, })

                adminRecord = queryResult[0].result[0]
            } catch (e) {
                const err = `500 Internal server error`
                const result = { status: 500, err }
    
                logError(`${err}: Could not read admin record.`)
                res.status(result.status).send(err)
                next && next(err)
                return
            }
        }
        adminRecord.reservationRequestCounter++

        const subject = entry?.args?.subject || `EMAIL`
        const counter = adminRecord.reservationRequestCounter + 1000
        const fullSubject = `${subject} ${counter}`

        json.title = fullSubject
        try {
            const tableName = entry.args.table
            const newId = await getNewId(db, tableName)
            const newRecordId = `${tableName}:${newId}`
            const newRecord = { ...json, id: newRecordId }
            const createResult = await fileDBCreate(db, newRecordId, newRecord)                
        } catch (e) {
            const err = `500 Internal Server Error`

            logError(`${err}: Database operation failed.`)
            res.status(500).send(err)
            next && next(err)
            return
        }

        const emailResult = await sendEmail(formattedData.text, fullSubject, process.env.EMAIL_USER, process.env.EMAIL_USER, process.env.EMAIL_PASSWORD)

        if (200 !== emailResult.status) {
            logError(`send-email: Status: ${emailResult.status} ${emailResult.text}`)
            res.status(emailResult.status).send(emailResult.text)
            next && next(formattedData.text)
            return
        }
        try {
            await fileDBChange(db, adminRecord.id, adminRecord)
        } catch (e) {
            const err = `500 Internal server error`

            logError(`${err}: Could not update admin record.`)
            // At this point we've done everything the client asked us to do, so we'll be returning a SUCCESS status.
        }

        res.status(200).send(`Success.`)
        next && next()
    }
}
