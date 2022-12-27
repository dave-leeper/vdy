const express = require("express")
const HandlerManager = require('./src/js/load-handlers')
const Surreal = require(`surrealdb.js`)
const {surrealDBSignIn, surrealDBUse} = require(`./src/js/database/surrealdb`)
const {populateDatabase} = require('./src/js/database/populate-db')
const Registry = require(`./src/js/registry`)
const bodyParser = require('body-parser')
const dotenv = require(`dotenv`)
const jwt = require(`jsonwebtoken`)

const initializeServer = async () => {
    const app = express();
    const handlerManager = new HandlerManager()
    const data = handlerManager.readHandlers(`./config/handlers.json`)

    app.use(express.static(__dirname + '/src'));
    app.use(bodyParser.json())
    dotenv.config()
    Date.prototype.addHours = function(numberOfHours){
        this.setHours(this.getHours() + numberOfHours);
        return this;
    }

    Registry.register(jwt, `JWT`)

    // Load config
    handlerManager.buildHandlers(data, app)

    // Setup database connection    
    const db = new Surreal.default(`http://127.0.0.1:8000/rpc`)
    // const db = new Surreal.default(`wss://vdydb.fly.dev/rpc`)

    await surrealDBSignIn(db, `root`, `root`)
    await surrealDBUse(db, `test`, `test`)
    Registry.register(db, `SurrealDBConnection`)
    await populateDatabase(db)

    // Start server
    const port = process.env.PORT || `8080`

    app.listen(port, () => console.log(`App listening on port ${port}.`))
}

initializeServer()


