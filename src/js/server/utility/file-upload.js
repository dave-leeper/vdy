const fs = require('fs')

module.exports.fileUpload = (req, tempDir) => {
    return new Promise((resolve, reject) => {
        const formidableOptions = { uploadDir: tempDir }
        const form = formidable(formidableOptions);

        form.parse(req, async (parseError, parseFields, parseFiles) =>{
            if (parseError) {
                const err = `400 Bad Request`

                console.error(err + `: Could not parse request.`)
                reject({ status: 400, err })
            }

            resolve({ status: 200, err: null, parseFields, parseFiles })
        })
    })
}
