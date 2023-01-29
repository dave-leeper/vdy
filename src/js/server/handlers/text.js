module.exports = (handlerName, handlerArgs) => {
    return async (req, res, next) => {
        res.send(handlerArgs.text)
        next && next()
    }
}
