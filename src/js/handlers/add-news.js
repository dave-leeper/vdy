const {surrealDBQuery, surrealDBCreate} = require(`../database/surrealdb`)
const Registry = require(`../registry`)
const {jwtValidation} = require(`./jwt-validation`)
const {jwtReplaceToken} = require(`./jwt-replace-token`)
const {formidable} = require('formidable')
const fs = require('fs')
const path = require('path');

function move(oldPath, newPath, callback) {
    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy()
            } else {
                callback(err)
            }
            return
        }
        callback()
    })

    function copy() {
        var readStream = fs.createReadStream(oldPath)
        var writeStream = fs.createWriteStream(newPath)

        readStream.on('error', callback)
        writeStream.on('error', callback)

        readStream.on('close', function () {
            fs.unlink(oldPath, callback)
        });

        readStream.pipe(writeStream)
    }
}

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

        const jwtReplaceTokenResult = await jwtReplaceToken(jwtValidationResult.jwtRegistryInfo)

        if (200 !== jwtReplaceTokenResult.status) {
            res.status(jwtReplaceTokenResult.status).send(jwtReplaceTokenResult.err)
            next && next(jwtReplaceTokenResult.err)
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

                console.error(err + `: Photo text not provided.`)
                return { status: 400, err }
            }
            if (!parseFields.title) {
                const err = `400 Bad Request`

                console.error(err + `: Photo title not provided.`)
                return { status: 400, err }
            }
            if (!parseFiles.filename) {
                const err = `400 Bad Request`

                console.error(err + `: Photo filename not provided.`)
                return { status: 400, err }
            }
            if (!parseFiles.filename.filepath) {
                const err = `400 Bad Request`

                console.error(err + `: Photo filename.filepath not provided.`)
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

            const countResult = await surrealDBQuery(db, `SELECT * FROM type::table($tb)`, { tb: handlerArgs.table })
            const recordCount = countResult[0].result.length
            const newFileExtension = path.extname(parseFiles.filename.originalFilename)
            const newRecordId = `${handlerArgs.table}:${recordCount}`
            const newFileName = `news${recordCount}${newFileExtension}`
            const newPhotoRecord = { text: parseFields.text, file: newFileName }
            const createResult = await surrealDBCreate(db, newRecordId, newPhotoRecord)
    
            move(parseFiles.filename.filepath, `${finalDir}/${newFileName}`, () => {
                let response = { jwt: jwtReplaceTokenResult.jwt, payload: { status: 200, newRecord: createResult }}

                res.status(200).send(JSON.stringify(response))
            })
        })
    }
}