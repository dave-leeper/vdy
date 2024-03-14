const DB = require('./db')
const { Octokit } = require('@octokit/rest');
const { Base64 } = require(`js-base64`)
const {decrypt, stringToBuffer} = require('../utility/encrypt')
const {logError, logInfo} = require('../utility/log')
const {cleanStringify} = require('../utility/json-utils')

module.exports = class GitDB extends DB {
	connection = null
	tables = new Map()
	async writeTable(tableName, table) {
		const content = JSON.stringify(table)
		const result = await this.writeFile(tableName, content)

		return result
	}
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
	async isConnected() { return !!this.connection }
    async use(branch, repo) {
		if (!this.isConnected) { return 0 }
		let newConnection = {...this.connection}
		const url =  `/repos/{owner}/{repo}/{path}`
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
    async close() { 
		this.connection = null 
		return true
	}
	static async testGitDB(){
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
