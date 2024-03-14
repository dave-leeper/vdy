const fs = require(`fs`)

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

module.exports.getTimestamp = () => {
  const today = getToday(`-`)
  const timeNow = getTimeNow(`-`)
  const timestamp = `${today}-${timeNow}`

  return timestamp
}

let logFile = `./log-${module.exports.getTimestamp()}`

const formatLogEntry = (logLevel, entry) => {
  const stringConstructor = "test".constructor
  const arrayConstructor = [].constructor
  const objectConstructor = ({}).constructor
  const whatIsIt = (object) => {
      if (object === null) { return `null` }
      if (object === undefined) { return `undefined` }
      if (object.constructor === stringConstructor) { return `String` }
      if (object.constructor === arrayConstructor) { return `Array` }
      if (object.constructor === objectConstructor) { return `Object` }
      return `don't know`
  }
  const entryIs = whatIsIt(entry)
  const firstChar = (fs.existsSync(logFile))? `` : `[`
  const lastChar = `,\n`
  let formattedEntry = entry
  
  if (`Array` === entryIs || `Object` === entryIs) { formattedEntry = JSON.stringify(entry) }
  else { formattedEntry = `"${entry}"`}
  formattedEntry = `${firstChar}{ "level": "${logLevel}", "date": "${getToday()}", "time": "${getTimeNow()}", "entry": ${formattedEntry} }${lastChar}`
  return formattedEntry
}
const writeToFile = (entry) => { fs.appendFileSync(logFile, entry, function (err) { if (err) throw err }) }

module.exports.setLogFilename = (logFilePath) => { logFile = logFilePath }
module.exports.getLogFilename = () => { return logFile }
module.exports.log = (entry) => { module.exports.logInfo(`${entry.verb} ${entry.path}`) }
module.exports.logInfo = (text) => {
  const logLevel = process.env.LOG_LEVEL?.toUpperCase()
  const logEntry = formatLogEntry(`INFO`, text)

  if (`INFO` === logLevel) { 
    console.info(logEntry)
    writeToFile(logEntry)
  }
}
module.exports.logWarn = (text) => {
  const logLevel = process.env.LOG_LEVEL?.toUpperCase()
  const logEntry = formatLogEntry(`WARN`, text)

  if (`INFO` === logLevel || `WARN` === logLevel) { 
    console.warn(logEntry) 
    writeToFile(logEntry)
  }
}
module.exports.logError = (text) => {
  const logEntry = formatLogEntry(`ERR`, text)

  console.error(logEntry)
  writeToFile(logEntry)
}
module.exports.closeLog = () => { 
  const formattedEntry = `{ "level": "INFO", "date": "${getToday()}", "time": "${getTimeNow()}", "entry": "Closing log." }`

  writeToFile(formattedEntry)
  writeToFile(`]`) 
}

const Queue = require('./queue')
const Messages = require('./messages')

module.exports.newLog = (newLogFilename) => { 
  const oldLogFilename = module.exports.getLogFilename()
  module.exports.closeLog()
  module.exports.setLogFilename(newLogFilename)
  Queue.broadcast(Messages.NEW_LOG, { oldLog: oldLogFilename, newLog: newLogFilename })

}

