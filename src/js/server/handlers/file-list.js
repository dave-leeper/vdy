const {log} = require(`../utility/log`)
const {getFileList} = require(`../utility/get-file-list`)

module.exports = (entry) => {
    /**
     * Handles a file list request.
     * 
     * Logs the request entry point. Gets the file list by calling getFileList() on each "from" path provided. 
     * Concatenates all results into one array. Sends the array back in the response. Calls next() if provided.
     */
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
