const crypto = require ("crypto")
const algorithm = `aes-256-cbc`

const init16BytesAsText = `6dd96795e9d74cd1ce8089b2b879ac32`
const key32BytesAsText = `391e3d8f980552daca613d336fc09f5acd26049d34cd60078523239e6890e0d8`
const init16Bytes = Buffer.from(init16BytesAsText, 'hex')
const key32Bytes = Buffer.from(key32BytesAsText, 'hex')

module.exports.encrypt = (message) => {
    const cipher = crypto.createCipheriv(algorithm, key32Bytes, init16Bytes)
    let encryptedData = cipher.update(message, `utf-8`, `hex`)

    encryptedData += cipher.final("hex")
    return encryptedData
}
module.exports.decrypt = (encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, key32Bytes, init16Bytes)
    let decryptedData = decipher.update(encryptedData, `hex`, `utf-8`)

    decryptedData += decipher.final(`utf8`)
    return decryptedData
}
module.exports.bufferToString = (buf) => { return buf.toString('hex') }
module.exports.stringToBuffer = (str) => { return Buffer.from(str, 'hex') }

