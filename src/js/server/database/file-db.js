const DB = require('./db')
const fs = require('fs')
const {logError, logInfo} = require('../utility/log')
const {cleanStringify} = require('../utility/json-utils')
const databaseDirectory = `./database/`

module.exports = class FileDB extends DB {
	/**
	 * The directory where the database files are stored.
	 */
	database = databaseDirectory
	/**
	 * Map to store database table objects.
	 */
	tables = new Map()
	/**
	 * Writes the given table data to a file in the database directory. 
	 * 
	 * @param {string} tableName - The name of the table to write.
	 * @param {Object} table - The table data object to write.
	 * @returns {boolean} - True if the write succeeded, false otherwise.
	 */
	async writeTable(tableName, table) {
		try {
			fs.writeFileSync(`${databaseDirectory}${tableName}`, JSON.stringify(table))
			return true
		} catch (e) {
			logError(`GitDB.writeTable: Error commiting changes to ${tableName}. ${e}`)
			return false
		}
	}
	/**
	 * Returns true to indicate the database connection is active.
	 * As this is just an in-memory database, it is always connected.
	 */
	async isConnected() { return true }
	/**
	 * Reads all files in the database directory into memory.
	 * If a database path is provided, it will read from that instead of the default.
	 * 
	 * @param {string} namespace - The namespace to load the database into.
	 * @param {string} database - Optional database path to load instead of default.
	 * @returns {number} The number of tables loaded.
	 */
	async use(namespace, database) {
		try {
			const finalDatabase = (database) ? database : databaseDirectory
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
	/**
	 * Closes the database connection. 
	 * As this is just an in-memory database, it always returns true.
	 */
	async close() { return true }
	/**
	 * Tests the FileDB class by performing basic CRUD operations.
	 * 
	 * Connects to a test database, creates some sample records, 
	 * selects/queries them, updates them, and deletes them.
	 * Logs the results of each operation.
	 * 
	 * This allows us to verify FileDB works as expected.
	 */
	static async testFileDB() {
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