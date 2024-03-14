const fs = require('fs')
const cors = require('cors')
const {logInfo, logError} = require('./utility/log')

module.exports = function () {
  this.readHandlers = function (handlerFile) { 
    try {
      const data = fs.readFileSync(handlerFile, 'utf8')
      return JSON.parse(data)
    } catch (err) {
      logError(err);
      throw err
    }
  }
  this.buildHandlers = function (handlerData, app) { 
    const build = (handlerConfigArray, app) => {
      for (let entry of handlerConfigArray) {
        logInfo(entry)
        const handlerBuilder = require(`./handlers/${entry.handler}`)
        const handler = handlerBuilder(entry)
        const corsOptionsDelegate = function (req, callback) {
          const corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response

          callback(null, corsOptions) // callback expects two parameters: error and options
        }

        if (entry.args?.cors) { app.options(entry.path, cors(corsOptionsDelegate)) }
        if (`GET` === entry.verb.toUpperCase()) { app.get(entry.path, cors(corsOptionsDelegate), handler) }
        else if (`POST` === entry.verb.toUpperCase()) { app.post(entry.path, cors(corsOptionsDelegate), handler) }
        else if (`PUT` === entry.verb.toUpperCase()) { app.put(entry.path, cors(corsOptionsDelegate), handler) }
        else if (`PATCH` === entry.verb.toUpperCase()) { app.patch(entry.path, cors(corsOptionsDelegate), handler) }
        else if (`DELETE` === entry.verb.toUpperCase()) { 
          app.options(entry.path, cors(corsOptionsDelegate)) 
          app.delete(entry.path, cors(corsOptionsDelegate), handler) 
        }
      }
    }

    build(handlerData.textResponse, app)
    build(handlerData.fileLoaders, app)
    build(handlerData.database, app)
    build(handlerData.function, app)
  }
}