const express = require("express")
const HandlerManager = require('./src/js/load-handlers')

const app = express();
const port = process.env.PORT || `8080`

const handlerManager = new HandlerManager()
const data = handlerManager.readHandlers(`./config/handlers.json`)
handlerManager.buildHandlers(data, app)

app.use(express.static(__dirname + '/src'));
app.listen(port, () => console.log(`App listening on port ${port}.`))


