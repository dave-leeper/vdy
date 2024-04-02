const crypto = require ("crypto")
const algorithm = `aes-256-cbc`

/**
 * 16 byte initialization vector encoded as hex string. Used for AES-256-CBC encryption.
 */
const init16BytesAsText = `6dd96795e9d74cd1ce8089b2b879ac32`
/**
 * 32 byte key encoded as hex string. Used for AES-256-CBC encryption.
 */
const key32BytesAsText = `391e3d8f980552daca613d336fc09f5acd26049d34cd60078523239e6890e0d8`
/**
 * Initializes a 16 byte buffer from the hex string init16BytesAsText.
 * Used as the initialization vector for AES-256-CBC encryption.
 */
const init16Bytes = Buffer.from(init16BytesAsText, 'hex')
/**
 * Initializes a 32 byte buffer from the hex string key32BytesAsText.
 * Used as the key for AES-256-CBC encryption.
 */
const key32Bytes = Buffer.from(key32BytesAsText, 'hex')

/**
 * Encrypts a message using AES 256-bit encryption.
 * 
 * @param {string} message - The message to encrypt.
 * @returns {string} The encrypted message in hexadecimal format.
 */
module.exports.encrypt = (message) => {
    const cipher = crypto.createCipheriv(algorithm, key32Bytes, init16Bytes)
    let encryptedData = cipher.update(message, `utf-8`, `hex`)

    encryptedData += cipher.final("hex")
    return encryptedData
}
/**
 * Decrypts an encrypted message using AES 256-bit decryption.
 * 
 * @param {string} encryptedData - The encrypted message to decrypt, as a hexadecimal string.
 * @returns {string} The decrypted message in UTF-8 format.
 */
module.exports.decrypt = (encryptedData) => {
    const decipher = crypto.createDecipheriv(algorithm, key32Bytes, init16Bytes)
    let decryptedData = decipher.update(encryptedData, `hex`, `utf-8`)

    decryptedData += decipher.final(`utf8`)
    return decryptedData
}
/**
 * Converts a Buffer to a hexadecimal string.
 * 
 * @param {Buffer} buf - The Buffer to convert.
 * @returns {string} The hexadecimal string representation of the Buffer.
 */
module.exports.bufferToString = (buf) => { return buf.toString('hex') }
/**
 * Converts a hexadecimal string to a Buffer.
 * 
 * @param {string} str - The hexadecimal string to convert. 
 * @returns {Buffer} The Buffer converted from the hexadecimal string.
 */
module.exports.stringToBuffer = (str) => { return Buffer.from(str, 'hex') }

