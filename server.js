const express = require("express")
const HandlerManager = require('./src/load-handlers')

console.dir(Surreal)
const app = express();
const port = process.env.PORT || `8080`

const handlerManager = new HandlerManager()
const data = handlerManager.readHandlers(`./config/handlers.json`)
handlerManager.buildHandlers(data, app)

async function database() {
  const Surreal = require('surrealdb.js')
  // vdydb.fly.dev::8000/rpc
  const db = new Surreal.default('http://127.0.0.1:8000/rpc');
  const {surrealDBSignIn, surrealDBUse, surrealDBCreate, surrealDBChange, surrealDBSelect, surrealDBQuery} = require('./src/handlers/surrealdb')
  const person = {
    title: 'Founder & CEO',
    name: {
      first: 'Tobie',
      last: 'Morgan Hitchcock',
    },
    marketing: true,
    identifier: Math.random().toString(36).substr(2, 10),
  }

	try {
		// Signin as a namespace, database, or root user
    await surrealDBSignIn(db, 'root', 'root')
    await surrealDBUse(db, 'test', 'test')
    const created = await surrealDBCreate(db, `person`, person)
    const updated = await surrealDBChange(db, `person:jaime`, { marketing: true, })
    const people = await surrealDBSelect(db, `person`);
    const groups = await surrealDBQuery(db, `SELECT marketing, count() FROM type::table($tb) GROUP BY marketing`, {tb: 'person', });
    console.log(`created: ${JSON.stringify(created)}`)
    console.log(`updated: ${JSON.stringify(updated)}`)
    console.log(`people: ${JSON.stringify(people)}`)
    console.log(`groups: ${JSON.stringify(groups)}`)

	} catch (e) {
		console.error('ERROR', e);
	}
}
database()

app.listen(port, () => console.log(`App listening on port ${port}.`))


