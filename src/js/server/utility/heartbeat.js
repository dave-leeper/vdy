const Queue = require('./queue')
const Messages = require('./messages')
const {logInfo} = require('./log')

module.exports = class Heartbeat {
    static SECOND = `SECOND`
    static MINUTE = `MINUTE`
    static HOUR = `HOUR`
    static DAY = `DAY`
    static WEEK = `WEEK`
    static MONTH = `MONTH`
    static currentHour = -1
    static hasBroadcastNewHour = false
    static hasBroadcastNewDay = false
    static hasBroadcastNewWeek = false
    static hasBroadcastNewMonth = false
    static start() {
        const oneSecondMilliseconds = 1000
        const oneMinuteMilliseconds = oneSecondMilliseconds * 60
        const broadcastHeartbeat = (timeUnit) =>{ Queue.broadcast(Messages.HEARTBEAT, { timeUnit, time: new Date() }) }
        const checkForNewHour = () => {
            const now = new Date()
            const hours = now.getHours()
            const minutes = now.getMinutes()

            if (hours !== Heartbeat.currentHour && 2 > minutes && !Heartbeat.hasBroadcastNewHour) {
                Queue.broadcast(Messages.HEARTBEAT, { timeUnit: Heartbeat.HOUR, time: new Date() })
                Heartbeat.hasBroadcastNewHour = true
                Heartbeat.currentHour = hours
            }
            if (2 < minutes) { Heartbeat.hasBroadcastNewHour = false }
        }
        const checkForNewDay = () => {
            const now = new Date()
            const hours = now.getHours()
            const minutes = now.getMinutes()

            if (0 === hours && 2 > minutes && !Heartbeat.hasBroadcastNewDay) {
                Queue.broadcast(Messages.HEARTBEAT, { timeUnit: Heartbeat.DAY, time: new Date() })
                Heartbeat.hasBroadcastNewDay = true
            }
            if (0 < hours) { Heartbeat.hasBroadcastNewDay = false }
        }
        const checkForNewWeek = () => {
            const dayOfTheWeek = new Date().getDay()

            if (0 === dayOfTheWeek && !Heartbeat.hasBroadcastNewWeek) {
                Queue.broadcast(Messages.HEARTBEAT, { timeUnit: Heartbeat.WEEK, time: new Date() })
                Heartbeat.hasBroadcastNewWeek = true
            }
            if (0 < dayOfTheWeek) { Heartbeat.hasBroadcastNewWeek = false }
        }
        const checkForNewMonth = () => {
            const dayOfTheMonth = new Date().getDate()

            if (1 === dayOfTheMonth && !Heartbeat.hasBroadcastNewMonth) {
                Queue.broadcast(Messages.HEARTBEAT, { timeUnit: Heartbeat.MONTH, time: new Date() })
                Heartbeat.hasBroadcastNewMonth = true
            }
            if (1 < dayOfTheMonth) { Heartbeat.hasBroadcastNewMonth = false }
        }

        setInterval(() => {broadcastHeartbeat(Heartbeat.SECOND)}, oneSecondMilliseconds)
        setInterval(() => {broadcastHeartbeat(Heartbeat.MINUTE)}, oneMinuteMilliseconds)
        Queue.register(this, Messages.HEARTBEAT, (message) => { if (Heartbeat.MINUTE === message.timeUnit) { checkForNewHour() }})
        Queue.register(this, Messages.HEARTBEAT, (message) => { if (Heartbeat.HOUR === message.timeUnit) { checkForNewDay() }})
        Queue.register(this, Messages.HEARTBEAT, (message) => { if (Heartbeat.DAY === message.timeUnit) { checkForNewWeek() }})
        Queue.register(this, Messages.HEARTBEAT, (message) => { if (Heartbeat.DAY === message.timeUnit) { checkForNewMonth() }})
    }
    static registerLogging() { Queue.register(this, Messages.HEARTBEAT, (message) => { if (`SECOND` !== message.timeUnit) { logInfo(message.timeUnit) }}) }
}
