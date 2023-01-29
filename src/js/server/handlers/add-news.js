const {surrealDBQuery, surrealDBCreate} = require(`../database/surrealdb`)
const Registry = require(`../utility/registry`)
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const {moveFile} = require(`../utility/move-file`)
const {getNewId} = require(`../utility/new-id`)
const {formidable} = require('formidable')
const fs = require('fs')
const path = require('path');

module.exports = (handlerHame, handlerArgs) => {
    return async (req, res, next) => {
        const db = Registry.get(`SurrealDBConnection`)
        const authorizationHeader = req.get(`Authorization`)

        if (!db) {
            const err = `503 Service Unavailable`
            console.error(err + `: Surreal DB`)
            res.status(503).send(err)
            next && next(err)
            return
        }
        if (!handlerArgs || !handlerArgs.table) {
            const err = `503 Service Unavailable`
            console.error(err + `: Missing handlerArgs.table.`)
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
        const form = formidable(formidableOptions);

        form.parse(req, async (parseError, parseFields, parseFiles) => {
            if (parseError) {
                const err = `400 Bad Request`

                console.error(err + `: Could not parse request.`)
                return { status: 400, err }
            }
            if (!parseFields.text) {
                const err = `400 Bad Request`

                console.error(err + `: News text not provided.`)
                return { status: 400, err }
            }
            if (!parseFields.title) {
                const err = `400 Bad Request`

                console.error(err + `: News text not provided.`)
                return { status: 400, err }
            }
            if (!parseFiles.filename) {
                const err = `400 Bad Request`

                console.error(err + `: News filename not provided.`)
                return { status: 400, err }
            }
            if (!parseFiles.filename.filepath) {
                const err = `400 Bad Request`

                console.error(err + `: News filename.filepath not provided.`)
                return { status: 400, err }
            }
            try {
                fs.existsSync(parseFiles.filename.filepath)
            } catch(e) {
                const err = `500 Internal Server Error`

                console.error(err + `: Photo ${parseFiles.filename.filepath} not uploaded.`)
                return { status: 500, err }
            }
            if (!parseFiles.filename.originalFilename) {
                const err = `400 Bad Request`

                console.error(err + `: Photo filename.originalFilename not provided.`)
                return { status: 400, err }
            }

            const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)

            if (200 !== jwtReplaceTokenResult.status) {
                res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
                next && next(jwtReplaceTokenResult.err)
                return
            }
    
            const newId = await getNewId(db, handlerArgs.table)
            const newFileExtension = path.extname(parseFiles.filename.originalFilename)
            const newRecordId = `${handlerArgs.table}:${newId}`
            const newFileName = `news${newId}${newFileExtension}`
            const newPhotoRecord = { title: parseFields.title, text: parseFields.text, file: newFileName }
            const createResult = await surrealDBCreate(db, newRecordId, newPhotoRecord)
    
            moveFile(parseFiles.filename.filepath, `${finalDir}/${newFileName}`, () => {
                let response = { jwt: jwtReplaceTokenResult.jwt, payload: { status: 200, newRecord: createResult }}

                res.status(200).send(JSON.stringify(response))
            })
        })
    }
}