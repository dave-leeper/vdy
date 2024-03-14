// node server.js
// * Connect to https://vincedrivesyou.com
const express = require(`express`)
const HandlerManager = require(`./src/js/server/load-handlers`)
const { fileDBSignIn, fileDBUse } = require(`./src/js/server/database/file-db-old`)
const GitDB = require(`./src/js/server/database/git-db`)
const { populateDatabase } = require(`./src/js/server/database/populate-db`)
const { logError, logInfo } = require(`./src/js/server/utility/log`)
const { startLogManager } = require(`./src/js/server/utility/log-manager`)
const Heartbeat = require(`./src/js/server/utility/heartbeat`)
const Queue = require(`./src/js/server/utility/queue`)
const Messages = require(`./src/js/server/utility/messages`)
const Registry = require(`./src/js/server/utility/registry`)
const bodyParser = require(`body-parser`)
const dotenv = require(`dotenv`)
const jwt = require(`jsonwebtoken`)
const https = require(`https`)
var http = require(`http`)
const fs = require(`fs`)
const options = {
  key: fs.readFileSync(`./ssl/generated-private-key.txt`),
  cert: fs.readFileSync(`./ssl/vincedrivesyou.2024/ec8f3ba52c2a086e.crt`),
  ca: [fs.readFileSync(`./ssl/vincedrivesyou.2024/gd_bundle-g2-g1.crt`)]
}

const { getTests } = require(`./src/js/server/utility/get-tests`)

const initializeServer = async () => {
    dotenv.config()
    await getTests()
    Queue.broadcast(Messages.SERVER_BEFORE_START, this)
    Date.prototype.addHours = function(numberOfHours){
        this.setHours(this.getHours() + numberOfHours);
        return this;
    }
    Date.prototype.subtractHours = function(numberOfHours){
        this.setHours(this.getHours() - numberOfHours);
        return this;
    }
    getToday = function(seperator = `/`) { 
        const date = new Date()
        const pad = (i) => { return (i < 10) ? `0` + i : i }
        const day = pad(date.getDate())
        const month = pad(date.getMonth() + 1)
        const year = date.getFullYear()

        return `${year}${seperator}${month}${seperator}${day}`
    }
    getTimeNow = function(seperator = `:`) {
        const date = new Date()
        const pad = (i) => { return (i < 10) ? `0` + i : i }
        const hour = pad(date.getHours())
        const minute = pad(date.getMinutes())
        const second = pad(date.getSeconds())

        return `${hour}${seperator}${minute}${seperator}${second}`
    }

    Heartbeat.registerLogging()
    Heartbeat.start()
    startLogManager(Heartbeat.DAY)

    const app = express();
    const handlerManager = new HandlerManager()
    const data = handlerManager.readHandlers(`./config/handlers.json`)

    app.use(express.static(__dirname + `/src`));
    app.use(bodyParser.text())
    app.use(function(request, response, next) {
        if (process.env.NODE_ENV != `development` && !request.secure) {
            try {
                // request was via http, so redirect to https
                let url = (`/` === request.url)? `/index.html` : request.url

                logInfo(`${getToday()} ${getTimeNow()} Redirecting http request ${url} to https.`)
                logError(`${getToday()} ${getTimeNow()} Redirecting http request ${url} to https.`)
                response.redirect(`https://` + request.headers.host + request.url)
            } catch (e) {
                logError(`Error redirecting to https. ${e}`)
            }
        }
        next()
    })
    app.enable(`trust proxy`)
    
    Registry.register(`JWT`, jwt)

    // Load config
    handlerManager.buildHandlers(data, app)

    // Start database
    const gitDB = new GitDB()
    const connectStatus = await gitDB.connect(process.env.GITHUB_ACCT, process.env.GITHUB_KEY)

    if (connectStatus) {
        const useStatus = await gitDB.use(`main`, process.env.GITHUB_REPOSITORY)

        if (-1 !== useStatus) { Registry.register(`GitDB`, gitDB) }
    }

    const fileDBConnection = {}

    await fileDBSignIn(fileDBConnection, `root`, `root`)
    await fileDBUse(fileDBConnection, `test`, `./database/`)
    Registry.register(`FileDBConnection`, fileDBConnection)
    await populateDatabase(fileDBConnection)

    // Start server
    const httpsPort = process.env.HTTPS_PORT || `443`
    const httpPort = process.env.HTTP_PORT || `80`
    const logLevel = process.env.LOG_LEVEL.toUpperCase()
    const emailService = process.env.EMAIL_SERVICE
    const emailUser = process.env.EMAIL_USER
    const nodeEnv = process.env.NODE_ENV
    
    logInfo(`HTTPS Port: ${httpsPort}`)
    logInfo(`HTTP Port: ${httpPort}`)
    logInfo(`Log Level: ${logLevel}`)
    logInfo(`Email Service: ${emailService}`)
    logInfo(`Email User: ${emailUser}`)
    logInfo(`Node Env: ${nodeEnv}`)

    http.createServer(app).listen(httpPort, () => logInfo(`App listening on HTTP port ${httpPort}.`))
    https.createServer(options, app).listen(httpsPort, () => logInfo(`App listening on HTTPS port ${httpsPort}.`))
    Queue.broadcast(Messages.SERVER_AFTER_START, this)
}

initializeServer()


