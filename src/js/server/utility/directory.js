const fs = require(`fs`)

/**
 * Lists the files in the given directory.
 * 
 * Returns a Promise that resolves with an array of file names, or rejects
 * with an error if there was a problem reading the directory.
 */
module.exports.listDirectory = async (directory) => {
    return new Promise((resolve, reject) => {
        const callback = (err, files) => {
            if (err) { reject({ status: 500, err: `500 Internal Server Error` }) }
            resolve(files)
        }

        fs.readdir(directory, callback)
    })
}
/**
 * Checks if the given path is a directory.
 * 
 * Returns a Promise that resolves with a boolean indicating if the path is a directory, 
 * or rejects with an error if there was a problem checking the path.
 */
module.exports.isDirectory = async (path) => {
    return new Promise((resolve, reject) => {
        const callback = (err, stats) => {
            if (err) { reject({ status: 500, err: `500 Internal Server Error` }) }
            resolve(stats.isDirectory())
        }

        fs.stat(path, callback)
    })
}
/**
 * Checks if the given path is a file.
 * 
 * Returns a Promise that resolves with a boolean indicating if the path is a file,
 * or rejects with an error if there was a problem checking the path.
 */
module.exports.isFile = async (path) => {
    return new Promise((resolve, reject) => {
        const callback = (err, stats) => {
            if (err) { reject({ status: 500, err: `500 Internal Server Error` }) }
            resolve(stats.isFile())
        }

        fs.stat(path, callback)
    })
}