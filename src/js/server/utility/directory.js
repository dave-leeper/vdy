const fs = require(`fs`)

module.exports.listDirectory = async (directory) => { 
    return new Promise( ( resolve, reject ) => {
        const callback = (err, files) => {
            if (err) { reject({ status: 500, err: `500 Internal Server Error`}) }
            resolve(files)
        }

        fs.readdir(directory, callback) 
    })
}
module.exports.isDirectory = async (path) => { 
    return new Promise( ( resolve, reject ) => {
        const callback = (err, stats) => {
            if (err) { reject({ status: 500, err: `500 Internal Server Error`}) }
            resolve(stats.isDirectory())
        }

        fs.stat(path, callback)
    })
}
module.exports.isFile = async (path) => { 
    return new Promise( ( resolve, reject ) => {
        const callback = (err, stats) => {
            if (err) { reject({ status: 500, err: `500 Internal Server Error`}) }
            resolve(stats.isFile())
        }

        fs.stat(path, callback)
    })
}