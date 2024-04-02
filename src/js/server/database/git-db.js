const DB = require('./db')
const { Octokit } = require('@octokit/rest');
const { Base64 } = require(`js-base64`)
const {decrypt, stringToBuffer} = require('../utility/encrypt')
const {logError, logInfo} = require('../utility/log')
const {cleanStringify} = require('../utility/json-utils')

module.exports = class GitDB extends DB {
	/** The database connection object */
	connection = null
	/**
	 * Map to store tables.
	 */
	tables = new Map()
	/**
	 * Writes the given table data to a file with the table name. 
	 * 
	 * @param {string} tableName - The name of the table.
	 * @param {Object} table - The table data object to write.
	 * @returns {Promise} A promise that resolves when the write is complete.
	 */
	async writeTable(tableName, table) {
		const content = JSON.stringify(table)
		const result = await this.writeFile(tableName, content)

		return result
	}
	/**
	 * Writes the given file data to a file with the given filename. 
	 * 
	 * Encodes the file data to base64, then commits it to the configured GitHub repo.
	 * Handles errors and logging.
	 * 
	 * @param {string} filename - The name of the file to write to.
	 * @param {string} fileData - The data to write to the file.
	 * @returns {Promise<boolean>} Promise that resolves to true if write succeeded, false otherwise.
	 */
	async writeFile(filename, fileData) {
		try {
			const contentEncoded = Base64.encode(fileData)
			const options = {
				owner: this.connection.owner,
				repo: this.connection.repo,
				path: filename,
				message: `Automated commit`,
				content: contentEncoded,
				committer: {
					name: this.connection.owner,
					email: process.env.GITHUB_EMAIL,
				},
				author: {
					name: this.connection.owner,
					email: process.env.GITHUB_EMAIL,
				},
			}
			const { data } = await this.connection.octokit.repos.createOrUpdateFileContents(options)
			/*
			const options1 = {
				owner: this.connection.owner,
				repo: this.connection.repo,
				path: filename
			}
			const { data: { sha } } = await this.connection.octokit.request('GET /repos/{owner}/{repo}/contents/{path}', options1)
			const options2 = {
				owner: this.connection.owner,
				repo: this.connection.repo,
				path: filename,
				token: this.connection.token,
				content: contentEncoded,
				message: `Automated commit`,
				sha,
				branch: this.connection.branch,
				committer: {
					name: this.connection.owner,
					email: process.env.GITHUB_EMAIL
				}
			}
			const data = await this.connection.octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', options2)
			*/
		} catch (e) {
			logError(`GitDB.writeFile: Error commiting changes to ${filename}. ${e}`)
			return false
		}
		return true
	}
	/**
	 * Connects to the GitHub API using the provided owner name and personal 
	 * access token. Stores the connection details in the connection property.
	 * 
	 * @param {string} owner - The GitHub username of the repo owner
	 * @param {string} token - The personal access token for authenticating with GitHub
	 * @returns {Promise<boolean>} - Promise that resolves to true if connection succeeded, false otherwise
	*/
	async connect(owner, token) {
		try {
			const passBuffer = stringToBuffer(token)
			const passDecrypted = decrypt(passBuffer)
			const octokit = new Octokit({ auth: passDecrypted })

			let newConnection = { owner, octokit, token: passDecrypted }

			this.connection = newConnection
			return true
		} catch (e) {
			logError(`GitDB.connect: Error connecting to GitDB. ${e}`)
			this.connection = null
			return false
		}
	}
	/**
	 * Checks if the GitDB instance is currently connected by checking if the 
	 * connection property is set.
	 * 
	 * @returns {Promise<boolean>} - Promise resolving to true if connected, false otherwise.
	*/
	async isConnected() { return !!this.connection }
	/**
	 * Switches the GitDB instance to use the specified repository and branch. 
	 * Updates the connection object with the new repo and branch values.
	 * Retrieves the contents of the tables in the repository by iterating through 
	 * each file, parsing the JSON, and storing in the tables Map. 
	 * Skips log files.
	 * 
	 * @param {string} branch - The branch name to switch to
	 * @param {string} repo - The repository name to switch to 
	 * @returns {Promise<number>} - Promise resolving to the number of tables retrieved
	 */
	async use(branch, repo) {
		if (!this.isConnected) { return 0 }
		let newConnection = { ...this.connection }
		const url = `/repos/{owner}/{repo}/{path}`
		/**
		 * Retrieves the contents of the tables in the connected Git repository. 
		 * Iterates through the repository contents, gets each table file, parses 
		 * the JSON contents into a Map, and skips log files.
		 * 
		 * @returns {Promise<number>} A promise that resolves to the number of tables retrieved,
		 * or -1 if there was an error.
		*/
		const getContents = async () => {
			try {
				const { data } = await this.connection.octokit.request({
					owner: this.connection.owner,
					repo,
					url,
					method: 'GET',
					path: 'contents', // gets the whole repo
				})

				for (let table of data) {
					const tableData = await this.connection.octokit.rest.repos.getContent({
						owner: this.connection.owner,
						repo,
						path: table.path,
					})
					const tableName = tableData.data.name

					if (!tableName || tableName.startsWith(`log-`)) { continue }

					let tableContents
					let tableJSON

					try {
						tableContents = atob(tableData.data.content)
						tableJSON = JSON.parse(tableContents)
						this.tables.set(tableName, tableJSON)
					} catch (e) {
						logError(`GitDB.use: Could not parse table ${tableName}. ${e}`)
						console.log(tableContents)
						let x = tableContents.substring(34503)
						console.log(x)
					}
				}
			} catch (e) {
				logError(`GitDB.use: Failed to retrieve database contents. ${e}`)
				return -1
			}
		}

		newConnection.repo = repo
		newConnection.branch = branch
		await getContents()
		this.connection = newConnection
		return this.tables.size
	}
	/**
	 * Closes the database connection by setting it to null.
	 * 
	 * @returns {Promise&lt;boolean&gt;} Promise that resolves to true if the 
	 * connection was closed successfully.
	 */
	async close() {
		this.connection = null
		return true
	}
	 /**
	 * Tests the GitDB class by connecting to a GitHub repository, performing CRUD
	 * operations on a table, and logging results.
	 * 
	 * Connects and disconnects from GitHub to test connect/close.
	 * Provides invalid credentials to test error handling.
	 * Selects all records, selects by ID, inserts records, updates records, 
	 * and deletes records to test CRUD operations.
	 */
	static async testGitDB() {
		const db = new GitDB()

		logInfo(`Test connecting and closing.`)
		let connectStatus = await db.connect(process.env.GITHUB_ACCT, process.env.GITHUB_KEY)
		logInfo(`connectStatus: ${connectStatus}`)
		logInfo(`isConnected: ${await db.isConnected()}`)
		let closeStatus = await db.close()
		logInfo(`closeStatus: ${closeStatus}`)
		logInfo(`isConnected: ${await db.isConnected()}`)

		logInfo(`Testing connecting with bad data.`)
		connectStatus = await db.connect(`JUNK`, process.env.GITHUB_KEY)       // Github will accept this
		logInfo(`connectStatus: ${connectStatus}`)
		logInfo(`isConnected: ${await db.isConnected()}`)
		connectStatus = await db.connect(process.env.GITHUB_ACCT, `JUNK`)             // Decryption will fail
		logInfo(`connectStatus: ${connectStatus}`)
		logInfo(`isConnected: ${await db.isConnected()}`)

		logInfo(`Test use.`)
		await db.connect(process.env.GITHUB_ACCT, process.env.GITHUB_KEY)
		let useStatus = await db.use(`main`, process.env.GITHUB_REPOSITORY)
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
