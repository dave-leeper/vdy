class Registry {
    /**
     * Registry array that stores registered items.
     */
    static registry = [];

    /**
     * Registers a new item in the registry array. 
     * 
     * @param {string} name - The name of the item to register
     * @param {object} object - The object to register
     */
    static register(name, object) {
        Registry.registry.unshift({ object: object, name: name })
    }

    /**
     * Unregisters an item from the registry by name.
     * 
     * Loops through the registry array to find the item with the matching name.
     * Removes the item from the registry when found.
     * 
     * @param {string} name - The name of the item to unregister
     * @returns {object} The unregistered object, or null if not found
     */
    static unregister(name) {
        for (let loop = 0; loop < Registry.registry.length; loop++) {
            if (Registry.registry[loop].name === name) {
                let object = Registry.registry[loop].object;
                Registry.registry.splice(loop, 1);
                return object;
            }
        }
        return null;
    }

    /**
     * Unregisters all items from the registry by resetting it to an empty array.
     */
    static unregisterAll() {
        Registry.registry = [];
    }

    /**
     * Checks if an item with the given name is already registered.
     * 
     * Loops through the registry to find an item with a matching name.
     * Returns true if found, false if not.
     */
    static isRegistered(name) {
        for (let loop = 0; loop < Registry.registry.length; loop++) {
            if (Registry.registry[loop].name === name) return true;
        }
        return false;
    }

    /**
     * Gets an item from the registry by name.
     * 
     * Loops through the registry array to find the item with the matching name.
     * Returns the item object if found, null if not.
     * 
     * @param {string} name - The name of the item to get
     * @returns {object} The registered object, or null if not found
     */
    static get(name) {
        for (let loop = 0; loop < Registry.registry.length; loop++) {
            if (Registry.registry[loop].name === name) return Registry.registry[loop].object;
        }
        return null;
    }
}