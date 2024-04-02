const {fileDBCreate} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {fileMove: fileMove} = require(`../utility/file-move`)
const {getNewId} = require(`../utility/new-id`)
const {formidable} = require('formidable')
const fs = require('fs')
const path = require('path')
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Add a new reservation record to the database.
     * 
     * 1. Parse the request body as JSON.
     * 2. Get a new unique ID for the reservation record. 
     * 3. Construct the new record object with the ID.
     * 4. Call fileDBCreate() to insert the record into the database.
     * 5. Return 200 OK with the new record in the response.
     * 6. Catch any errors, log them, and send 500 error response.
    */
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)

        if (!db) {
            const err = `503 Service Unavailable`
            logError(`${err}: File DB`)
            res.status(503).send(err)
            next && next(err)
            return
        }

        const tableName = `reservation`
        const json = JSON.parse(req.body)

        try {
            const newId = await getNewId(db, tableName)
            const newRecordId = `${tableName}:${newId}`
            const newRecord = { ...json, id: newRecordId }
            const createResult = await fileDBCreate(db, newRecordId, newRecord)
            let response = { payload: { status: 200, newRecord } }

            res.status(200).send(JSON.stringify(response))
        } catch (e) {
            const err = `500 Internal Server Error`

            logError(`${err}: Database operation failed.`)
            res.status(500).send(err)
            next && next(err)
            return
        }
    }
}