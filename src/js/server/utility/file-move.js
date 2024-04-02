const fs = require('fs')

/**
 * Moves a file from one path to another. 
 * Handles cross-device moves by falling back to copying and deleting.
 * 
 * @param {string} oldPath - The existing path to move the file from 
 * @param {string} newPath - The new path to move the file to
 * @param {Function} callback - Callback function to handle errors
 */
module.exports.fileMove = (oldPath, newPath, callback) => {
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

    /**
     * Copies the file from oldPath to newPath using streams. 
     * Handles errors and cleans up old file after copy.
    */
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