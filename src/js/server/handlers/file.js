var path = require('path');
const {log} = require('../utility/log')

module.exports = (entry) => {
    /**
     * Handles file requests by serving the requested file from the src directory.
     * 
     * Logs the request entry, sets the root directory, and sends the file. If there is an error, calls next() to handle it.
     */
    return async (req, res, next) => {
        log(entry)

        const options = { root: path.join(`.`, '/src') }

        res.sendFile(`${entry.args.file}`, options, (err) => { if (err) { next && next(err) } else { next && next() } })
        return
    }
}
