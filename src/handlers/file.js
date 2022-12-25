var path = require('path');

module.exports = (name, args) => {
    return async (req, res, next) => {
        var options = { root: path.join(`.`, '/src') }
        res.sendFile(`${args.file}`, options, (err) => { if (err) { next && next(err) } else { next && next() } })
    }
}
