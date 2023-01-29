var path = require('path');

module.exports = (handlerName, handlerArgs) => {
    return async (req, res, next) => {
        var options = { root: path.join(`.`, '/src') }
        res.sendFile(`${handlerArgs.file}`, options, (err) => { if (err) { next && next(err) } else { next && next() } })
    }
}
