const DB = require('./db')
const fs = require('fs')
const {logError, logInfo} = require('../utility/log')
const {cleanStringify} = require('../utility/json-utils')
const databaseDirectory = `./database/`

module.exports = class FileDB extends DB {
    database = databaseDirectory
	tables = new Map()
    async writeTable(tableName, table) {
        try {
            fs.writeFileSync(`${databaseDirectory}${tableName}`, JSON.stringify(table))
            return true
        } catch(e) {
			logError(`GitDB.writeTable: Error commiting changes to ${tableName}. ${e}`)
            return false
        }
    }
	async isConnected() { return true }
    async use(namespace, database) {
		try {
            const finalDatabase = (database)? database : databaseDirectory
			const files = await fs.promises.readdir(finalDatabase)

			files.forEach((filename) => {
				const text = fs.readFileSync(`${database}${filename}`, 'utf8')
	
				this.tables.set(filename, JSON.parse(text))
			})
            this.database = finalDatabase
		} catch (e) {
			logError(`Error reading database. ${JSON.stringify(e)}`)
            return -1
		}
		return this.tables.size
	}
    async close() { return true }
	static async testFileDB(){
		const db = new FileDB()
		
		logInfo(`Test use.`)
		await db.connect()
		let useStatus = await db.use(null, `./src/js/server/database/testing/`)
		logInfo(`useStatus: ${useStatus}`)
	
		logInfo(`Test Creating records.`)
		let createStatus = await db.create(`admin`, {
			id: 0,
			lastBackupDate: `A`,
			encryptedGitHubKey: `B`
		})
		logInfo(`createStatus: ${createStatus}`)
		createStatus = await db.create(`admin`, {
			id: 1,
			lastBackupDate: `Y`,
			encryptedGitHubKey: `Z`
		})
		logInfo(`createStatus: ${createStatus}`)
	
		logInfo(`Test Selecting records.`)
		let selectStatus = await db.select(`admin`, `[id..eq..0]`)
		logInfo(`selectStatus: ${cleanStringify(selectStatus)}`)
		selectStatus = await db.select(`admin`, `[]`)
		logInfo(`selectStatus: ${cleanStringify(selectStatus)}`)
		selectStatus = await db.select(`admin`)
		logInfo(`selectStatus: ${cleanStringify(selectStatus)}`)
	
		logInfo(`Test Updating records.`)
		let changeStatus = await db.update(`admin`, { lastBackupDate: `ZZZ` }, `[id..eq..0]`)
		logInfo(`selectStatus: ${changeStatus}`)
		selectStatus = await db.select(`admin`, `[id..eq..0]`)
		logInfo(`selectStatus: ${cleanStringify(selectStatus)}`)
		changeStatus = await db.update(`admin`, { lastBackupDate: `ZZZ` })
		logInfo(`selectStatus: ${changeStatus}`)
		selectStatus = await db.select(`admin`)
		logInfo(`selectStatus: ${cleanStringify(selectStatus)}`)
	
		let deleteStatus = await db.remove(`admin`, `[id..eq..0]`)
		logInfo(`deleteStatus: ${deleteStatus}`)
		selectStatus = await db.select(`admin`, `[id..eq..0]`)
		logInfo(`selectStatus: ${cleanStringify(selectStatus)}`)
		selectStatus = await db.select(`admin`)
		logInfo(`selectStatus: ${cleanStringify(selectStatus)}`)
		deleteStatus = await db.remove(`admin`)
		logInfo(`deleteStatus: ${deleteStatus}`)
		selectStatus = await db.select(`admin`)
		logInfo(`selectStatus: ${cleanStringify(selectStatus)}`)
	}
}