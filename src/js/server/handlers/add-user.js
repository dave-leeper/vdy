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
     * Adds a new user to the database. 
     * 
     * Validates request data and authorization. Parses request body and files. 
     * Generates new ID, filename, and record. Writes user record to database. 
     * Moves user image file to final directory. Updates JWT with new token.
     * Sends response with updated JWT and new user record.
     */
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const authorizationHeader = req.get(`Authorization`)

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
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFields.userName) {
                const err = `400 Bad Request`

                logError(`${err}: User userName not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFields.password) {
                const err = `400 Bad Request`

                logError(`${err}: User password not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFields.roles) {
                const err = `400 Bad Request`

                logError(`${err}: User roles not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFields.title) {
                const err = `400 Bad Request`

                logError(`${err}: User title not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFields.firstName) {
                const err = `400 Bad Request`

                logError(`${err}: User firstName not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFields.lastName) {
                const err = `400 Bad Request`

                logError(`${err}: User lastName not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFiles.filename) {
                const err = `400 Bad Request`

                logError(`${err}: User filename not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFiles.filename.filepath) {
                const err = `400 Bad Request`

                logError(`${err}: User filename.filepath not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            try {
                fs.existsSync(parseFiles.filename.filepath)
            } catch (e) {
                const err = `500 Internal Server Error`

                logError(`${err}: User ${parseFiles.filename.filepath} not uploaded.`)
                res.status(500).send(err)
                next && next(err)
                return
            }
            if (!parseFiles.filename.originalFilename) {
                const err = `400 Bad Request`

                logError(`${err}: User filename.originalFilename not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }

            const newId = await getNewId(db, entry.args.table)
            const newFileExtension = path.extname(parseFiles.filename.originalFilename)
            const newRecordId = `${entry.args.table}:${newId}`
            const newFileName = `user${newId}${newFileExtension}`
            const newUserRecord = { userName: parseFields.userName, password: parseFields.password, roles: parseFields.roles, title: parseFields.title, name: { first: parseFields.firstName, last: parseFields.lastName }, image: newFileName }
            const createResult = await fileDBCreate(db, newRecordId, newUserRecord)

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