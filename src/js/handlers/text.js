module.exports = (name, args) => {
    return async (req, res, next) => {
        res.send(args.text)
        next && next()
    }
}
