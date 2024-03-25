class Queue {
    /**
     * Array to store event listeners.
     */
    static listeners = []
    /**
     * Array to store async event listeners.
     */
    static asyncListeners = []
    /**
     * Registers a listener function to be called when a message with the given name is dispatched.
     * The callback will be invoked with the dispatched message.
     *
     * @param {Function} listener - The listener function to register.
     * @param {string} message - The message name to listen for. 
     * @param {Function} callback - The callback to invoke when the message is dispatched.
     */
    static register(listener, message, callback) {
        Queue.listeners.push({ listener: listener, message: message, callback: callback })
    }
    /**
     * Registers an async listener function to be called when a message with the given name is dispatched.
     * The callback will be invoked with the dispatched message.
     * 
     * @param {Function} listener - The listener function to register.
     * @param {string} message - The message name to listen for.
     * @param {Function} callback - The callback to invoke when the message is dispatched.
     */
    static registerAsync(listener, message, callback) {
        Queue.asyncListeners.push({ listener: listener, message: message, callback: callback })
    }
    /**
     * Checks if the given listener is already registered for the given message.
     * 
     * @param {Function} listener - The listener function 
     * @param {string} message - The message name
     * @returns {boolean} - True if the listener is registered for the message
     */
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
    /**
     * Unregisters the given listener for the given message by removing it from the listeners array.
     * Returns an array of the removed listener objects.
     * 
     * @param {Function} listener - The listener function to unregister
     * @param {string} message - The message to unregister the listener for
     * @returns {Object[]} - Array of removed listener objects 
     */
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
    /**
     * Unregisters all listeners registered for the given listener function.
     * Loops through the listeners and asyncListeners arrays and removes any 
     * listeners where the listener property matches the given listener.
     * Returns an array of all removed listener objects.
     */
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
    /**
     * Unregisters all listeners that have been registered.
     * Clears the listeners array so no listeners remain registered.
     */
    static unregisterAll() {
        Queue.listeners = []
    }
    /**
     * Broadcasts the given message and data to all registered listeners. 
     * Loops through the listeners and asyncListeners arrays and calls the callback 
     * function for any listener registered for the given message. 
     * Returns an array of the listener records that received the message.
     */
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
    /**
     * Broadcasts an error message to all registered listeners.
     * 
     * @param {string} errorText - The error message text to broadcast.
     * @returns {Promise<Array>} A promise that resolves with an array of the listener records that received the message.
     */
    static async broadcastError(errorText) {
        return await Queue.broadcast(Messages.ERROR, { message: errorText })
    }
    /**
     * Broadcasts a notification message to all registered listeners.
     *
     * @param {string} notificationText - The notification message text to broadcast.
     * @returns {Promise<Array>} A promise that resolves with an array of the listener records that received the message.
     */
    static async broadcastNotification(notificationText) {
        return await Queue.broadcast(Messages.NOTIFICATION, { message: notificationText })
    }
    /**
     * Calls the registered listeners for the given message. 
     * Passes the data to each listener and waits for each callback to resolve before continuing.
     * 
     * @param {string} message - The message to send to listeners.
     * @param {Object} data - The data to pass to each listener callback.
     * @returns {Promise<Array>} Promise that resolves with an array of resolved listener callback results.
     */
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