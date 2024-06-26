const {fileDBChange, fileDBSelect} = require(`../database/file-db-old`)
const Registry = require(`../utility/registry`)
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const {fileMove} = require(`../utility/file-move`)
const {formidable} = require('formidable')
const fs = require('fs')
const path = require('path');
const {log, logError} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Handler for updating a photo record. 
     * 
     * Validates request and parses form data. 
     * Deletes old photo file if exists. 
     * Updates database with new photo info. 
     * Moves new photo file to final directory.
     * Replaces JWT token.
     * Returns 200 OK with updated record data.
    */
    return async (req, res, next) => {
        log(entry)

        const db = Registry.get(`FileDBConnection`)
        const authorizationHeader = req.get(`Authorization`)
        const reply = req.body

        if (!db) {
            const err = `503 Service Unavailable`
            const result = { status: 503, err }

            logError(`${err}: Database not available.`)
            res.status(result.status).send(JSON.stringify(result))
            next && next(err)
            return
        }
        if (!authorizationHeader) {
            const err = `401 Unauthorized`
            const result = { status: 401, err }

            logError(`${err}: Authorization header not sent with request.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }
        if (!reply) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            logError(`${err}: No reply found in request body.`)
            res.status(result.status).send(err)
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
            if (!parseFields.text) {
                const err = `400 Bad Request`

                logError(`${err}: Photo text not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFiles.filename) {
                const err = `400 Bad Request`

                logError(`${err}: Photo filename not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFiles.filename.filepath) {
                const err = `400 Bad Request`

                logError(`${err}: Photo filename.filepath not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            try {
                fs.existsSync(parseFiles.filename.filepath)
            } catch (e) {
                const err = `500 Internal Server Error`

                logError(`${err}: Photo ${parseFiles.filename.filepath} not uploaded.`)
                res.status(500).send(err)
                next && next(err)
                return
            }
            if (!parseFiles.filename.originalFilename) {
                const err = `400 Bad Request`

                logError(`${err}: Photo filename.originalFilename not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            if (!parseFields.id) {
                const err = `400 Bad Request`

                logError(`${err}: Photo id not provided.`)
                res.status(400).send(err)
                next && next(err)
                return
            }

            let oldRecord = await fileDBSelect(db, parseFields.id)
            const finalDir = `./src/images`

            if (1 !== oldRecord.length) {
                const err = `400 Bad Request`

                logError(`${err}: No existing photo record found for update.`)
                res.status(400).send(err)
                next && next(err)
                return
            }
            oldRecord = oldRecord[0]
            try { if (fs.existsSync(`${finalDir}/${oldRecord.file}`)) { fs.unlinkSync(`${finalDir}/${oldRecord.file}`) } }
            catch (e) {
                const err = `500 Internal Server Error`

                logError(`${err}: Could not delete ${finalDir}/${oldRecord.file}.`)
                res.status(500).send(err)
                next && next(err)
                return
            }

            const fileNumber = parseInt(parseFields.id.split(`:`)[1])
            const newFileExtension = path.extname(parseFiles.filename.originalFilename)
            const newFileName = `photo${fileNumber}${newFileExtension}`
            const updateData = { title: parseFields.title, text: parseFields.text, file: newFileName, id: parseFields.id }
            const createResult = await fileDBChange(db, parseFields.id, updateData)


            fileMove(parseFiles.filename.filepath, `${finalDir}/${newFileName}`, async () => {
                const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)

                if (200 !== jwtReplaceTokenResult.status) {
                    res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
                    next && next(jwtReplaceTokenResult.err)
                    return
                }

                let response = { jwt: jwtReplaceTokenResult.jwt, payload: { status: 200, newRecord: updateData } }

                res.status(200).send(JSON.stringify(response))
                next && next()
            })
        })
    }
}
