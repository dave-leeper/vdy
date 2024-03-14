const Registry = require(`../utility/registry`)
const fs = require('fs')
const databaseDirectory = `./database/`
const {logError} = require('../utility/log')

module.exports = {
	fileDBSignIn: async function (connection, user, pass) { 
	},
	fileDBUse: async function (connection, namespace, database = databaseDirectory) { 
		try {
			const files = await fs.promises.readdir(database)

			files.forEach((filename) => {
				const text = fs.readFileSync(`${database}${filename}`, 'utf8')
	
				Registry.register(`database.${filename}`, JSON.parse(text))
			})
		} catch (e) {
			logError(`Error reading database. ${JSON.stringify(e)}`)
		}
	 },
	fileDBClose: async function (connection) { return },
	fileDBCreate: async function (connection, thing, data) {
		const filename = thing.split(`:`)[0]
		let table = Registry.get(`database.${filename}`)
		const dataWithId = { ...data, id: thing }

		if (!table) { table = [] }
		for (let loop = 0; loop < table.length; loop++) {
			const row = table[loop]

			if (row.id !== thing) { continue }
			return false
		}
		table.push(dataWithId)
		Registry.register(`database.${filename}`, table)
		fs.writeFileSync(`${databaseDirectory}${filename}`, JSON.stringify(table))
		return dataWithId
	},
	fileDBChange: async function (connection, thing, data) {
		if (!thing) {
			console.error(`fileDBChange: No id provided. Data is ${data}`)
		}
		const filename = thing.split(`:`)[0] // <-- Failing with no value for thing
		const table = Registry.get(`database.${filename}`)
		const dataWithId = { ...data, id: thing }

		if (!table) { return false }
		for (let loop = 0; loop < table.length; loop++) {
			const row = table[loop]

			if (row.id !== thing) { continue }
			table[loop] = { ...row, ...dataWithId }
			Registry.register(`database.${filename}`, table)
			fs.writeFileSync(`${databaseDirectory}${filename}`, JSON.stringify(table))
			return true
		}
		return false
	},
	fileDBSelect: async function (connection, thing) {
		if (-1 === thing.indexOf(`:`)) {
			const table = Registry.get(`database.${thing}`)

			if (!table) { return [] }
			return table
		}

		const filename = thing.split(`:`)[0]
		const table = Registry.get(`database.${filename}`)

		for (let loop = 0; loop < table.length; loop++) {
			const row = table[loop]

			if (row.id !== thing) { continue }
			return [ row ]
		}
		return data
	},
	fileDBQuery: async function (connection, query, options) {
		const tablename = options.tb
		const table = Registry.get(`database.${tablename}`)

		if (!table) { return [{ result: [] }] }
		return [{ result: table }]
	},
	fileDBDelete: async function (connection, thing) { 
		if (-1 === thing.indexOf(`:`)) {
			const table = []

			Registry.register(`database.${thing}`, table)
			fs.writeFileSync(`${databaseDirectory}${thing}`, JSON.stringify(table))
			return table
		}

		const filename = thing.split(`:`)[0]
		const table = Registry.get(`database.${filename}`)

		if (!table) { return false }
		for (let loop = 0; loop < table.length; loop++) {
			const row = table[loop]

			if (row.id !== thing) { continue }
			table.splice(loop, 1)
			Registry.register(`database.${filename}`, table)
			fs.writeFileSync(`${databaseDirectory}${filename}`, JSON.stringify(table))
			return true
		}
		return false
	}
	
}