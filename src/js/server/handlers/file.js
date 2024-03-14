var path = require('path');
const {log} = require('../utility/log')

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        const options = { root: path.join(`.`, '/src') }

        res.sendFile(`${entry.args.file}`, options, (err) => { if (err) { next && next(err) } else { next && next() }})
        return
    }
}
