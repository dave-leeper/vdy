const {fileDBCreate} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const {fileMove: fileMove} = require(`../utility/file-move`)
const {getNewId} = require(`../utility/new-id`)
const {formidable} = require('formidable')
const fs = require('fs')
const path = require('path');
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Handles adding a new photo record to the database. 
     * 
     * Validates JWT token from authorization header.
     * Parses request body for photo text and file.
     * Generates new ID for photo record.
     * Moves uploaded photo file to final directory.
     * Creates new photo record in database.
     * Replaces JWT token.
     * Returns response with new JWT token and created record.
     */
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const authorizationHeader = req.get(`Authorization`)

        if (!db) {
            const err = `503 Service Unavailable`
            logError(`${err}: File DB`)
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

        const jwtValidationResult = await jwtValidation(authorizationHeader)

        if (200 !== jwtValidationResult.status) {
            res.status(jwtValidationResult.status).send(jwtValidationResult.err)
            next && next(jwtValidationResult.err)
            return
        }

        const tempDir = `./src/images/temp`
        const finalDir = `./src/images`
        const formidableOptions = { uploadDir: tempDir }
        const form = formidable(formidableOptions)

        form.parse(req, async (parseError, parseFields, parseFiles) => {
            if (parseError) {
                const err = `400 Bad Request`

                logError(`${err}: Could not parse request.`)
                return { status: 400, err }
            }
            if (!parseFields.text) {
                const err = `400 Bad Request`

                logError(`${err}: Photo text not provided.`)
                return { status: 400, err }
            }
            if (!parseFiles.filename) {
                const err = `400 Bad Request`

                logError(`${err}: Photo filename not provided.`)
                return { status: 400, err }
            }
            if (!parseFiles.filename.filepath) {
                const err = `400 Bad Request`

                logError(`${err}: Photo filename.filepath not provided.`)
                return { status: 400, err }
            }
            try {
                fs.existsSync(parseFiles.filename.filepath)
            } catch (e) {
                const err = `500 Internal Server Error`

                logError(`${err}: Photo ${parseFiles.filename.filepath} not uploaded.`)
                return { status: 500, err }
            }
            if (!parseFiles.filename.originalFilename) {
                const err = `400 Bad Request`

                logError(`${err}: Photo filename.originalFilename not provided.`)
                return { status: 400, err }
            }

            const newId = await getNewId(db, entry.args.table)
            const newFileExtension = path.extname(parseFiles.filename.originalFilename)
            const newRecordId = `${entry.args.table}:${newId}`
            const newFileName = `photo${newId}${newFileExtension}`
            const newPhotoRecord = { text: parseFields.text, file: newFileName }
            const createResult = await fileDBCreate(db, newRecordId, newPhotoRecord)

            fileMove(parseFiles.filename.filepath, `${finalDir}/${newFileName}`, async () => {
                const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)

                if (200 !== jwtReplaceTokenResult.status) {
                    res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
                    next && next(jwtReplaceTokenResult.err)
                    return
                }

                let response = { jwt: jwtReplaceTokenResult.jwt, payload: { status: 200, newRecord: createResult } }

                res.status(200).send(JSON.stringify(response))
            })
        })
    }
}