class Queue {
    static listeners = []
    static asyncListeners = []
    static register(listener, message, callback) {
        Queue.listeners.push({ listener: listener, message: message, callback: callback })
    }
    static registerAsync(listener, message, callback) {
        Queue.asyncListeners.push({ listener: listener, message: message, callback: callback })
    }
    static isRegistered(listener, message) {
        for (let loop = 0; loop < Queue.listeners.length; loop++) {
            let l = Queue.listeners[loop]

            if ((l.listener === listener) && (l.message === message)) {
                return true
            }
        }
        for (let loop = 0; loop < Queue.asyncListeners.length; loop++) {
            let l = Queue.asyncListeners[loop]

            if ((l.listener === listener) && (l.message === message)) {
                return true
            }
        }
        return false
    }
    static unregister(listener, message) {
        let removed = []

        for (let loop = 0; loop < Queue.listeners.length; loop++) {
            let l = Queue.listeners[loop]
            if ((l.listener === listener) && (l.message === message)) {
                removed.push(Queue.listeners.splice(loop, 1)[0])
            }
        }
        for (let loop = 0; loop < Queue.asyncListeners.length; loop++) {
            let l = Queue.asyncListeners[loop]
            if ((l.listener === listener) && (l.message === message)) {
                removed.push(Queue.asyncListeners.splice(loop, 1)[0])
            }
        }
        return removed
    }
    static unregisterAllForListener(listener) {
        let removed = []

        for (let loop = 0; loop < Queue.listeners.length; loop++) {
            let l = Queue.listeners[loop]
            if ((l.listener === listener)) {
                removed.push(Queue.listeners.splice(loop, 1)[0])
            }
        }
        for (let loop = 0; loop < Queue.asyncListeners.length; loop++) {
            let l = Queue.asyncListeners[loop]
            if ((l.listener === listener)) {
                removed.push(Queue.asyncListeners.splice(loop, 1)[0])
            }
        }
        return removed
    }
    static unregisterAll() {
        Queue.listeners = []
    }
    static async broadcast(message, data) {
        let receivers = []

        for (let loop = 0; loop < Queue.listeners.length; loop++) {
            let listenerRecord = Queue.listeners[loop]

            if (listenerRecord.message !== message) { continue }
            try {
                listenerRecord.callback(data)
            } catch (e) {
                console.error(`broadcast (1 of 5): An exception was thrown during a message callback.`)
                console.error(`broadcast (2 of 5): Exception text: ${e}`)
                console.error(`broadcast (3 of 5): Message: ${message}`)
                console.error(`broadcast (4 of 5): Data: id: ${data?.id} ${JSON.stringify(data)}`)
                console.error(`broadcast (5 of 5): Listener record: id: ${listenerRecord?.listener?.id} ${JSON.stringify(listenerRecord)}`)
            }
            receivers.push(listenerRecord)
        }
        for (let loop = 0; loop < Queue.asyncListeners.length; loop++) {
            let listenerRecord = Queue.asyncListeners[loop]

            if (listenerRecord.message !== message) { continue }
            try {
                await listenerRecord.callback(data)
            } catch (e) {
                console.error(`broadcast (1 of 5): An exception was thrown during a message callback.`)
                console.error(`broadcast (2 of 5): Exception text: ${e}`)
                console.error(`broadcast (3 of 5): Message: ${message}`)
                console.error(`broadcast (4 of 5): Data: id: ${data?.id} ${JSON.stringify(data)}`)
                console.error(`broadcast (5 of 5): Listener record: id: ${listenerRecord?.listener?.id} ${JSON.stringify(listenerRecord)}`)
            }
            receivers.push(listenerRecord)
        }
        return receivers
    }
    static async broadcastError(errorText) {
        return await Queue.broadcast( Messages.ERROR, { message: errorText })
    }
    static async broadcastNotification(notificationText) {
        return await Queue.broadcast( Messages.NOTIFICATION, { message: notificationText })
    }
    static async call(message, data) {
        let promises = []

        for (let loop = 0; loop < Queue.listeners.length; loop++) {
            let listenerRecord = Queue.listeners[loop]
            if (listenerRecord.message !== message) { continue }
            try {
                promises.push(listenerRecord.callback(data))
            } catch (e) {
                console.error(`call (1 of 5): An exception was thrown during a message callback.`)
                console.error(`call (2 of 5): Exception text: ${e}`)
                console.error(`call (3 of 5): Message: ${message}`)
                console.error(`call (4 of 5): Data: id: ${data?.id} ${JSON.stringify(data)}`)
                console.error(`call (5 of 5): Listener record: id: ${listenerRecord?.listener?.id} ${JSON.stringify(listenerRecord)}`)
            }
        }
        for (let loop = 0; loop < Queue.asyncListeners.length; loop++) {
            let listenerRecord = Queue.asyncListeners[loop]
            if (listenerRecord.message !== message) { continue }
            try {
                promises.push(await listenerRecord.callback(data))
            } catch (e) {
                console.error(`call (1 of 5): An exception was thrown during a message callback.`)
                console.error(`call (2 of 5): Exception text: ${e}`)
                console.error(`call (3 of 5): Message: ${message}`)
                console.error(`call (4 of 5): Data: id: ${data?.id} ${JSON.stringify(data)}`)
                console.error(`call (5 of 5): Listener record: id: ${listenerRecord?.listener?.id} ${JSON.stringify(listenerRecord)}`)
            }
        }
        return Promise.all(promises)
    }
}