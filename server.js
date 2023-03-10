// node server.js
// flyctl apps restart vdytesting
// flyctl launch
// flyctl deploy
//
// flyctl ips list -a vdytesting
// * Add A and AAAA records for site at DNS provider
// flyctl certs create -a vdytesting vincedrivesyou.com
// flyctl certs show -a vdytesting
// * Connect to https://vincedrivesyou.com
const express = require("express")
const HandlerManager = require('./src/js/server/load-handlers')
const Surreal = require(`surrealdb.js`)
const {surrealDBSignIn, surrealDBUse} = require(`./src/js/server/database/surrealdb`)
const {populateDatabase} = require('./src/js/server/database/populate-db')
const Registry = require(`./src/js/server/utility/registry`)
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
    Date.prototype.subtractHours = function(numberOfHours){
        this.setHours(this.getHours() - numberOfHours);
        return this;
    }

    Registry.register(`JWT`, jwt)

    // Load config
    handlerManager.buildHandlers(data, app)

    // Setup database connection    
    const db = new Surreal.default(`http://127.0.0.1:8000/rpc`)
    // const db = new Surreal.default(`wss://vdydb.fly.dev/rpc`)

    await surrealDBSignIn(db, `root`, `root`)
    await surrealDBUse(db, `test`, `test`)
    Registry.register(`SurrealDBConnection`, db)
    await populateDatabase(db)

    // Start server
    const port = process.env.PORT || `8080`

    app.listen(port, () => console.log(`App listening on port ${port}.`))
}

initializeServer()


