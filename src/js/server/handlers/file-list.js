const {log} = require(`../utility/log`)
const {getFileList} = require(`../utility/get-file-list`)

module.exports = (entry) => {
    return async (req, res, next) => {
        log(entry)

        const fileListFunc = async () => {
            let result = []

            for (let fromInfo of entry.args.from) {
                const list = await getFileList(fromInfo.path, fromInfo.suffix, fromInfo.recursive)

                result = result.concat(list)
            }
        
            res.status(200).send(JSON.stringify(result))
            next && next()
        }

        fileListFunc()
    }
}
