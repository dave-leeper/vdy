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
     * Handles adding a new quote to the database.
     * 
     * 1. Gets the FileDBConnection from the registry.
     * 2. Parses the quote data from the request body. 
     * 3. Gets a new unique ID for the quote record.
     * 4. Creates the new quote record object.
     * 5. Writes the new record to the database.
     * 6. Sends response with the new record.
     * 7. Handles any errors by sending 500 response.
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

        const tableName = `quote`
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