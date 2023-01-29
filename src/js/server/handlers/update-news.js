const {surrealDBChange, surrealDBSelect} = require(`../database/surrealdb`)
const Registry = require(`../utility/registry`)
const {jwtValidation} = require(`../utility/jwt-validation`)
const {jwtReplaceToken} = require(`../utility/jwt-replace-token`)
const {moveFile} = require(`../utility/move-file`)
const {formidable} = require('formidable')
const fs = require('fs')

module.exports = (handlerName, handlerArgs) => {
    return async (req, res, next) => {
        let db = Registry.get(`SurrealDBConnection`)
        const authorizationHeader = req.get(`Authorization`)
        const reply = req.body
        
        if (!db) {
            const err = `503 Service Unavailable`
            const result = { status: 503, err }

            console.error(err + `: Database not available.`)
            res.status(result.status).send(JSON.stringify(result))
            next && next(err)
            return
        }
        if (!authorizationHeader) {
            const err = `401 Unauthorized`
            const result = { status: 401, err }

            console.error(err + `: Authorization header not sent with request.`)
            res.status(result.status).send(err)
            next && next(err)
            return
        }
        if (!reply) {
            const err = `400 Bad Request`
            const result = { status: 400, err }

            console.error(err + `: No reply found in request body.`)
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
        let validationResult
        
        try { validationResult = await fileUpload(req, tempDir) }
        catch (e) {
            res.status(e.status).send(e.err)
            next && next(e.err)
            return
        }
        if (!validationResult.parseFields.text) {
            const err = `400 Bad Request`

            console.error(err + `: News text not provided.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }
        if (!validationResult.parseFiles.filename) {
            const err = `400 Bad Request`

            console.error(err + `: News filename not provided.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }
        if (!validationResult.parseFiles.filename.filepath) {
            const err = `400 Bad Request`

            console.error(err + `: News filename.filepath not provided.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }
        try {
            fs.existsSync(validationResult.parseFiles.filename.filepath)
        } catch(e) {
            const err = `500 Internal Server Error`

            console.error(err + `: News ${validationResult.parseFiles.filename.filepath} not uploaded.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }
        if (!validationResult.parseFiles.filename.originalFilename) {
            const err = `400 Bad Request`

            console.error(err + `: News filename.originalFilename not provided.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }
        if (!validationResult.parseFields.id) {
            const err = `400 Bad Request`

            console.error(err + `: News text not provided.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }
        if (!validationResult.parseFields.title) {
            const err = `400 Bad Request`

            console.error(err + `: Title not provided.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }

        let oldRecord = await surrealDBSelect(connection, thing)
        const finalDir = `./src/images`

        if (1 !== oldRecord.length) {
            const err = `400 Bad Request`

            console.error(err + `: No existing news record found for update.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }
        oldRecord = oldRecord[0]
        try { if (fs.existsSync(`${finalDir}/${oldRecord.file}`)) { fs.unlinkSync(`${finalDir}/${oldRecord.file}`) } }
        catch(e) {
            const err = `500 Internal Server Error`

            console.error(err + `: Could not delete ${finalDir}/${oldRecord.file}.`)
            res.status(validationResult.status).send(err)
            next && next(err)
            return
        }

        const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)

        if (200 !== jwtReplaceTokenResult.status) {
            res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
            next && next(jwtReplaceTokenResult.err)
            return
        }

        const newFileName = `news${validationResult.parseFields.id}${newFileExtension}`
        const updateData = { title: parseFields.title, text: parseFields.text, file: newFileName }
        const createResult = await await surrealDBChange(db, validationResult.parseFields.id, updateData)

        moveFile(parseFiles.filename.filepath, `${finalDir}/${newFileName}`, () => {
            let response = { jwt: jwtReplaceTokenResult.jwt, payload: { status: 200, newRecord: createResult }}

            res.status(200).send(JSON.stringify(response))
        })
        
        let response = { jwt: jwtReplaceTokenResult.jwt, payload: null }
        res.status(200).send(JSON.stringify(response))
        next && next()
    }
}
