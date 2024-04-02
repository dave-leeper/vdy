const { listDirectory, isDirectory } = require(`./directory`)
const {logError} = require('./log')

/**
 * Recursively gets a list of files with a given suffix in a directory.
 * 
 * @param {string} path - The path to the directory
 * @param {string} suffix - The file suffix to match 
 * @param {boolean} recursive - Whether to recursively search subdirectories
 * @returns {Promise<string[]>} A promise resolving to an array of matching file paths
 */
module.exports.getFileList = async (path, suffix, recursive) => {
    return new Promise(async (resolve, reject) => {
        /**
         * Recursively gets a list of files with a given suffix in a directory.
         * 
         * @param {string} path - The path to the directory
         * @param {string} suffix - The file suffix to match
         * @param {boolean} recursive - Whether to recursively search subdirectories
         * @returns {Promise<string[]>} A promise resolving to an array of matching file paths
         */
        const getList = async (path, suffix, recursive) => {
            const files = await listDirectory(path)
            let result = []

            for (let file of files) {
                const fullPath = `${path}/${file}`
                const isDir = await isDirectory(fullPath)

                if (isDir) {
                    if (recursive) {
                        const subDirResults = await getList(fullPath, suffix, recursive)

                        result = result.concat(subDirResults)
                    }
                } else {
                    if (!file.endsWith(suffix)) { continue }
                    result.push(fullPath)
                }
            }
            return result
        }

        try {
            const fileList = await getList(path, suffix, recursive)

            resolve(fileList)
        } catch (e) {
            const err = `Error retriveing file list. Path: ${path} Suffix: ${suffix} Recursive: ${recursive} Error: ${JSON.stringify(e)}`

            logError(err)
            reject(err)
        }

    })
}