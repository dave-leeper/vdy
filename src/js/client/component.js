// TODO: two-way binding.
class Component {
    static msgs = {
        BEFORE_INITIALIZATION: `COMPONENT_BEFORE_INITIALIZATION`,
        AFTER_INITIALIZATION: `COMPONENT_AFTER_INITIALIZATION`,
        BEFORE_MOUNT: `COMPONENT_BEFORE_MOUNT`,
        AFTER_MOUNT: `COMPONENT_AFTER_MOUNT`,
        BEFORE_UNMOUNT: `COMPONENT_BEFORE_UNMOUNT`,
        AFTER_UNMOUNT: `COMPONENT_AFTER_UNMOUNT`,
        CHILDREN_MOUNTED: `COMPONENT_CHILDREN_MOUNTED`,
        ENABLED: `COMPONENT_ENABLED`,
        DISABLED: `COMPONENT_DISABLED`,
        DESCENDANTS_MOUNTED: `COMPONENT_DESCENDANTS_MOUNTED`,
        BEFORE_DESTRUCTION: `COMPONENT_BEFORE_DESTRUCTION`,
        AFTER_DESTRUCTION: `COMPONENT_AFTER_DESTRUCTION`,
        BEFORE_SLOT_LOADED: `COMPONENT_BEFORE_SLOT_LOADED`,
        AFTER_SLOT_LOADED: `COMPONENT_AFTER_SLOT_LOADED`,
        BEFORE_SHOW: `COMPONENT_BEFORE_SHOW`,
        AFTER_SHOW: `COMPONENT_AFTER_SHOW`,
        BEFORE_HIDE: `COMPONENT_BEFORE_HIDE`,
        AFTER_HIDE: `COMPONENT_AFTER_HIDE`,
    }

    /**
     * Gets the registered fragment for the given component class.
     * 
     * @param {Function} componentClass - The component class to get the fragment for.
     * @returns {DocumentFragment} The registered fragment for the component class, or null if not found.
     */
    static getFragment(componentClass) {
        if (!componentClass) {
            console.error(`getFragment: No component fragment id provided.`)
            return null
        }
        if (!ComponentLifecycle.fragmentRegistry?.has(componentClass)) {
            console.error(`getFragment: Component fragment ${componentClass} is not registered.`)
            return null
        }

        let fragment = ComponentLifecycle.fragmentRegistry.get(componentClass)
        return fragment
    }
    /**
     * Checks if a component object is registered in the object registry.
     *
     * @param {string} componentObjectId - The ID of the component object to check.
     * @returns {boolean} True if the component object is registered, false otherwise.
     */
    static isObjectRegistered(componentObjectId) {
        if (!componentObjectId) {
            console.error(`isObjectRegistered: No component object id provided.`)
            return null
        }
        return ComponentLifecycle.objectRegistry?.has(componentObjectId)
    }
    /**
     * Gets the component object instance for the given component object ID.
     * 
     * @param {string} componentObjectId - The ID of the component object to retrieve.
     * @returns {Object|null} The component object instance if found, null if not found.
     */
    static getObject(componentObjectId) {
        if (!componentObjectId) {
            console.error(`getObject: No component object id provided.`)
            return null
        }
        if (!ComponentLifecycle.objectRegistry?.has(componentObjectId)) {
            console.error(`getObject: Component object ${componentObjectId} is not registered.`)
            return null
        }

        let componentObjectInfo = ComponentLifecycle.objectRegistry.get(componentObjectId)
        return componentObjectInfo.componentObject
    }
    /**
     * Creates a new HTML include element to dynamically load a component.
     * 
     * Sets attributes on the include element to provide the component source, ID, 
     * props, vars, classes, styles, and other attributes. Performs string replacements
     * on the props and vars to make them safe for attributes.
     * 
     * @param {string} src - The source URL of the component to load.
     * @param {string} componentId - The ID of the component. 
     * @param {Object} props - Component props object to stringify and embed.
     * @param {Object} vars - Component vars object to stringify and embed.
     * @param {Object[]} classes - Array of class objects with name and value.
     * @param {Object[]} styles - Array of style objects with name and value.
     * @param {string} attributes - String of semicolon-separated attribute key-value pairs.
     * @returns {Element} The constructed include element.
     */
    static createComponentInclude(src, componentId, props, vars, classes, styles, attributes) {
        let newInclude = document.createElement(`include-html`, {})
        let propsString = null
        let varsString = null

        if (props) {
            propsString = JSON.stringify(props)
            propsString = propsString.replace(/\'/g, "\\'")                  // Replace ' with \'
            propsString = propsString.replace(/"([^"]+(?=":))"/g, '$1')     // Replace "name": with name:
            propsString = propsString.replace(/"/g, "'")                    // Replace " with '
        }
        if (vars) {
            varsString = JSON.stringify(vars)
            varsString = varsString.replace(/'/g, "\\'")
            varsString = varsString.replace(/"([^"]+(?=":))"/g, '$1')
            varsString = varsString.replace(/"/g, "'")
        }

        newInclude.setAttribute(`data-src`, src)
        newInclude.setAttribute(`data-id`, componentId)
        if (props) { newInclude.setAttribute(`data-props`, propsString) }
        if (vars) { newInclude.setAttribute(`data-vars`, varsString) }
        // classes = [{ name: `data-class`, value: `display-none` }, { name: `data-class-wrapper`, value: `display-none` }]
        if (classes) { for (let aClass of classes) { newInclude.setAttribute(`data-class`, aClass) } }
        // styles = `[{ name: `data-style`, value: `width: 20px; height:20px` }, { name: `data-style-wrapper`, value: `color: red` }]
        if (styles) { for (let style of styles) { newInclude.setAttribute(style.name, style.value) } }
        // attributes = `disabled: true; value: xyz;`
        if (attributes) {
            const nameValuePairs = attributes.split(`;`)

            for (let nameValuePair of nameValuePairs) {
                const nameValueArray = nameValuePair.split(`:`)

                if (0 === nameValueArray.length) { continue }
                if (2 !== nameValueArray.length) {
                    console.error(`createComponentInclude: Bad attribute: ${nameValuePair}.`)
                    continue
                }
                newInclude.setAttribute(nameValueArray[0].trim(), nameValueArray[1].trim())
            }
        }
        return newInclude
    }
    /**
     * Map to store groups.
     */
    static groups = new Map()
    /**
     * Map to store callback functions to uncheck groups.
     */
    static groupObjectUncheckCallbacks = new Map()
    /**
     * Map to store callback functions to get group data.
     */
    static groupObjectGetDataCallbacks = new Map()
    /**
     * Adds an object to a named group. 
     * 
     * @param {string} groupName - The name of the group to add the object to.
     * @param {Object} object - The object to add to the group.
     * @param {Function} [uncheckCallback] - Optional callback for unchecking the object. 
     * @param {Function} [getDataCallback] - Optional callback for getting data from the object.
     */
    static addToGroup(groupName, object, uncheckCallback, getDataCallback) {
        if (Component.isInGroup(object)) { return }

        let groupObjects = Component.groups.get(groupName)

        if (!groupObjects) { groupObjects = [] }
        groupObjects.push(object)
        Component.groups.set(groupName, groupObjects)
        if (uncheckCallback) { Component.groupObjectUncheckCallbacks.set(object, uncheckCallback) }
        if (getDataCallback) { Component.groupObjectGetDataCallbacks.set(object, getDataCallback) }
    }
    /**
     * Removes an object from a named group.
     * 
     * @param {string} groupName - The name of the group to remove the object from. 
     * @param {Object} object - The object to remove from the group.
     */
    static removeFromGroup(groupName, object) {
        if (!Component.groupIncludesObject(groupName, object)) { return }

        let groupObjects = Component.groups.get(groupName)

        if (!groupObjects.includes(object)) { return }
        groupObjects.splice(array.indexOf(object), 1)
        Component.groups.set(groupName, groupObjects)
        if (Component.groupObjectUncheckCallbacks.has(object)) { Component.groupObjectUncheckCallbacks.delete(object) }
        if (Component.groupObjectGetDataCallbacks.has(object)) { Component.groupObjectGetDataCallbacks.delete(object) }
    }
    /**
     * Gets the array of objects in the specified group.
     * Returns null if the group does not exist.
     */
    static getGroupObjects(groupName) {
        let groupObjects = Component.groups.get(groupName)

        if (!groupObjects) { return null }
        return groupObjects
    }
    /**
     * Checks if the given object is in any group.
     * 
     * @param {Object} object - The object to check.
     * @returns {string|boolean} The name of the group the object is in, 
     * or false if not in any group.
     */
    static isInGroup(object) {
        for (let [key, value] of Component.groups) { if (value && value.includes(object)) { return key } }
        return false
    }
    /**
     * Gets the index of the given object within its group.
     * Returns -1 if the object is not in a group.
     */
    static groupIndexOf(object) {
        const groupName = Component.isInGroup(object)

        if (!groupName) { return -1 }

        const groupObjects = Component.getGroupObjects(groupName)

        for (let loop = 0; loop < groupObjects.length; loop++) {
            const obj = groupObjects[loop]

            if (obj === object) {
                if (undefined === obj.props?.groupIndex) { return loop }
                return obj.props?.groupIndex
            }
        }
        return -1
    }
    /**
     * Gets the object at the specified index within the given group.
     * Returns null if the index is out of bounds.
     */
    static getGroupObjectAt(groupName, index) {
        const groupObjects = Component.getGroupObjects(groupName)

        if (0 > index || groupObjects.length - 1 < index) { return null }
        for (let loop = 0; loop < groupObjects.length; loop++) {
            const obj = groupObjects[loop]

            if (index === obj.props?.groupIndex) { return obj }
        }
        return groupObjects[index]
    }
    /**
     * Checks if the given object is included in the specified group.
     * 
     * @param {string} groupName - The name of the group to check.
     * @param {Object} object - The object to check for inclusion.
     * @returns {boolean} True if the object is in the group, false otherwise.
     */
    static groupIncludesObject(groupName, object) {
        let groupObjects = Component.groups.get(groupName)

        if (!groupObjects) { return false }
        return groupObjects.includes(object)
    }
    /**
     * Updates the checked state of all objects in the group that contains the given object.
     * 
     * Checks the given object.
     * Unchecks all other objects in the same group as the given object.
     * 
     * @param {Object} object - The object to check.
     */
    static async staticUpdateGroup(object) {
        if (true !== object.enabled && `true` !== object.getAttribute(`enabled`)) { return }

        const group = Component.isInGroup(object)

        if (!group) { return }

        const groupObjects = Component.getGroupObjects(group)

        if (!groupObjects) { return }
        for (let obj of groupObjects) {
            const callback = Component.groupObjectUncheckCallbacks.get(obj)

            if (object === obj) {
                if (callback) { callback(obj, true) }
                else if (obj.check) { obj.check(true) }
                continue
            }
            if (callback) { callback(obj, false) }
            else if (obj.check) { obj.check(false) }
        }
    }
    /**
     * Retrieves aggregated data for all objects in the specified group.
     * 
     * Loops through all objects in the group and collects their data by 
     * calling getData() on each one. Returns the aggregated data for the
     * entire group. Returns null if group does not exist or has no objects.
     * 
     * @param {string} groupName - The name of the group to get data for.
     * @returns {Object|null} The aggregated data for the group, or null.
     */
    static async getGroupData(groupName) {
        const groupObjects = Component.getGroupObjects(groupName)
        let groupData = null

        if (!groupObjects) { return null }
        for (let obj of groupObjects) {
            const callback = Component.groupObjectGetDataCallbacks.get(obj)
            let data = null

            if (callback) { data = callback(obj) }
            else if (obj.getData) { data = await obj.getData() }

            if (data) { groupData = data }
        }
        return groupData
    }

    /**
     * Returns the class name of this object.
     */
    className() { return this.constructor.name }
    /**
     * Returns false to indicate this component is not slotted.
     */
    isSlotted() { return false }
    /** Indicates whether the component is currently mounted. */
    mounted = false
    /**
     * Array to store mounted child components.
     */
    mountedChildren = []
    /**
     * Array to store mounted descendant components.
     */
    mountedDescendants = []
    /**
     * Checks if this component is the parent of the given child component.
     * 
     * @param {Object} childObject - The child component object to check.
     * @returns {boolean} True if this component is the parent of the child.
     */
    isParent(childObject) { return childObject.Parent === this }
    /**
     * Returns an array of child component IDs registered to this component.
     */
    get childComponentIds() { return ComponentLifecycle.childComponentRegistry.get(this.className()) }
    /**
     * Returns an array of child Component instances 
     * registered to this component.
     */
    get childComponents() {
        const childComponents = []
        const childComponentIds = this.childComponentIds

        for (let childComponetId of childComponentIds) {
            const fullId = `${this.id}${childComponetId}`
            const childComponent = Component.getObject(fullId)

            childComponents.push(childComponent)
        }

        return childComponents
    }
    /**
     * Returns an array of child Component instances
     * registered to this component.
     */
    getChildComponents() {
        return this.childComponents
    }
    /**
     * Checks if the given component ID is a child of this component.
     * 
     * @param {string} componentId - The component ID to check.
     * @returns {boolean} True if the given component ID is a child of this component.
     */
    isChild(componentId) {
        const childIds = this.childComponentIds

        if (0 === childIds.length) { return false }
        for (let childComponetId of childComponentIds) {
            const fullId = `${this.id}${childComponetId}`

            if (fullId === componentId) { return true }
        }
        return false
    }
    /**
     * Checks if the given component ID is a descendant of this component.
     * 
     * Recursively checks the component's immediate children, and their children,
     * until the component ID is found or the entire descendant tree has been searched.
     * 
     * @param {string} componentId - The component ID to check.
     * @returns {boolean} True if the given component ID is a descendant of this component.
     */
    isDescendant(componentId) {
        const childIds = this.childComponentIds

        if (0 === childIds.length) { return false }
        for (let childComponetId of childComponentIds) {
            const fullId = `${this.id}${childComponetId}`

            if (fullId === componentId) { return true }

            const childComponent = Component.getObject(fullId)
            const isDescendent = childComponent.isDescendant(componentId)

            if (isDescendent) { return true }
        }
        return false
    }
    /**
     * Walks up the DOM tree starting from the element with the id matching
     * this component's id, and returns the first parent component found.
     * Returns null if no parent component is found.
     */
    get Parent() {
        let element = document.getElementById(this.id)
        let walkUpTree = (element) => {
            while (element.parentElement) {
                if (element.parentElement.id) {
                    let parentComponent = ComponentLifecycle.objectRegistry?.get(element.parentElement.id)

                    if (parentComponent) {
                        return parentComponent.componentObject
                    }
                }
                element = element.parentElement
            }
            return null
        }

        if (!element) { return null }
        return walkUpTree(element)
    }
    /**
     * Walks up the component tree starting from this component's DOM element, 
     * and returns the first parent component found with class name 'Form', or
     * null if no Form parent component is found.
     */
    get Form() {
        let parent = this.Parent

        while (parent) {
            if (`Form` === parent.className()) { return parent }
            parent = parent.Parent
        }
        return null
    }
    /**
     * Initializes the component by setting its ID, registering async message handlers, 
     * and broadcasting lifecycle events.
     * - Sets the component's ID
     * - Registers handler for DESCENDANTS_MOUNTED to track mounted child components
     * - Registers handler for VAR_VALUE_CHANGED to handle enabled property changes
     * - Broadcasts BEFORE_INITIALIZATION and AFTER_INITIALIZATION lifecycle events
     */
    async initialize(id) {
        await Queue.broadcast(Component.msgs.BEFORE_INITIALIZATION, this)
        this.id = id
        Queue.registerAsync(this, Component.msgs.DESCENDANTS_MOUNTED, async (component) => {
            const truncatedMessageId = component.id?.replace(this.id, ``)
            const rebuiltMessageId = this.id + truncatedMessageId

            if (!this.childComponentIds.includes(truncatedMessageId)) { return }
            if (rebuiltMessageId !== component?.id) { return }
            if (this.mountedDescendants.includes(component)) { return }

            this.mountedDescendants.push(component)
            if (this.mountedDescendants.length === this.childComponentIds.length) {
                await this.onDescendantsMounted()
                this.enabled = !!this.enabled
            }
        })
        Queue.registerAsync(this, ComponentLifecycle.msgs.VAR_VALUE_CHANGED, async (message) => {
            if (this !== message.componentObject) { return }
            if (`enabled` !== message.member) { return }
            await this.onEnabled()
        })
        await Queue.broadcast(Component.msgs.AFTER_INITIALIZATION, this)
    }
    /**
     * Checks if all child components that were expected to mount have mounted.
     * Returns true if the number of mounted child components matches the number
     * of child component IDs passed to the component.
     */
    haveChildrenMounted() { return this.mountedChildren.length === this.childComponentIds.length }
    /**
     * Checks if all descendant components of this component and its child components 
     * have finished mounting.
     * 
     * Returns true if all expected descendant components have mounted, false otherwise.
     * 
     * Checks:
     * - If all immediate child components have mounted
     * - If each child component recursively has all its descendants mounted
    */
    haveDescendantsMounted() {
        if (!this.haveChildrenMounted()) { return false }

        const childComponents = this.childComponentIds

        if (!childComponents || 0 === childComponents.length) { return true }

        for (let childComponentId of childComponents) {
            if (!Component.isObjectRegistered(`${this.id}${childComponentId}`)) { return false }
            if (!Component.getObject(`${this.id}${childComponentId}`).haveDescendantsMounted()) {
                return false
            }
        }
        return true
    }
    /**
     * Mounts the component by registering its ID with the ComponentLifecycle singleton.
     * This allows the component to begin receiving lifecycle events from the framework.
     */
    async mount() { await ComponentLifecycle.mount(this.id) }
    /**
     * Broadcasts the BEFORE_MOUNT lifecycle event for this component instance 
     * before the component is mounted. Allows any listeners to run logic before 
     * the component instance is registered and begins receiving events.
     */
    async beforeMount() { await Queue.broadcast(Component.msgs.BEFORE_MOUNT, this) }
    /**
     * Broadcasts the AFTER_MOUNT lifecycle event and notifies the parent component that this child has mounted.
     * 
     * Checks if this component has any child components.
     * If not, triggers the onChildrenMounted() and onDescendantsMounted() callbacks since there are no descendants.
     * 
     * Finally enables the component if the enabled property is truthy.
     */
    async afterMount() {
        await Queue.broadcast(Component.msgs.AFTER_MOUNT, this)
        this.Parent?.childMounted(this)
        if (0 === this.childComponentIds.length) {
            await this.onChildrenMounted()
            await this.onDescendantsMounted()
            this.enabled = !!this.enabled
        }
    }
    /**
     * Unregisters the component ID from ComponentLifecycle, allowing it to stop receiving lifecycle events.
     * Effectively "unmounts" the component.
     */
    async unmount() { await ComponentLifecycle.unmount(this.id) }
    /**
     * Broadcasts the BEFORE_UNMOUNT lifecycle event for this component instance
     * before the component is unmounted. Allows any listeners to run logic before
     * the component instance is unregistered and stops receiving events.
     * 
     * Checks for any mounted child components and recursively unmounts them first.
     */
    async beforeUnmount() {
        await Queue.broadcast(Component.msgs.BEFORE_UNMOUNT, this)

        const childComponents = ComponentLifecycle.childComponentRegistry.get(this.className())

        if (!childComponents || 0 === childComponents.length) { return }

        for (let childComponentId of childComponents) {
            if (!Component.isObjectRegistered(`${this.id}${childComponentId}`)) { continue }

            const child = Component.getObject(`${this.id}${childComponentId}`)

            if (child.isMounted()) { await child.unmount() }
        }
    }
    /**
     * Broadcasts the AFTER_UNMOUNT lifecycle event for this component instance
     * after the component is unmounted. Allows any listeners to run logic after
     * the component instance is unregistered and stops receiving events.
     */
    async afterUnmount() { await Queue.broadcast(Component.msgs.AFTER_UNMOUNT, this) }
    /**
     * Returns whether this component instance is currently mounted.
     */
    isMounted() { return this.mounted }
    /**
     * Callback when a child component is mounted. 
     * Adds the child to mountedChildren array.
     * Checks if all children are mounted and calls onChildrenMounted() if so.
     * Checks if child has descendants mounted and adds to mountedDescendants array.
     * Checks if all descendants are mounted, calls onDescendantsMounted() and enables component if so.
     */
    async childMounted(child) {
        this.mountedChildren.push(child)
        if (this.mountedChildren.length === this.childComponentIds.length) { await this.onChildrenMounted() }
        if (child.haveDescendantsMounted()) { this.mountedDescendants.push(child) }
        if (this.mountedDescendants.length === this.childComponentIds.length) {
            await this.onDescendantsMounted()
            this.enabled = !!this.enabled
        }
    }
    /**
     * Callback when all child components have mounted.
     * Adds child component getter methods to this component instance.
     * Broadcasts CHILDREN_MOUNTED event to allow any listeners to run logic after all children are mounted.
     */
    async onChildrenMounted() {
        Loader.addChildComponentGettersToComponentObject(this.className(), this.id)
        await Queue.broadcast(Component.msgs.CHILDREN_MOUNTED, this)
    }
    /**
     * Callback when all descendant components have mounted.
     * Broadcasts DESCENDANTS_MOUNTED event to allow any listeners to run logic after all descendants are mounted.
     * Applies component styling.
     */
    async onDescendantsMounted() {
        await Queue.broadcast(Component.msgs.DESCENDANTS_MOUNTED, this)
        this.stylize()
    }
    /**
     * Shows this component by setting visible to true, calling show() on the component's
     * DOM element, and broadcasting BEFORE_SHOW and AFTER_SHOW events.
     */
    async show() {
        await Queue.broadcast(Component.msgs.BEFORE_SHOW, this)
        this.visible = true
        this.Element?.show()
        await Queue.broadcast(Component.msgs.AFTER_SHOW, this)
    }
    /**
     * Hides this component by setting visible to false, hiding the component's
     * DOM element, and broadcasting BEFORE_HIDE and AFTER_HIDE events.
     */
    async hide() {
        await Queue.broadcast(Component.msgs.BEFORE_HIDE, this)
        this.visible = false
        this.Element?.hide()
        await Queue.broadcast(Component.msgs.AFTER_HIDE, this)
    }
    /**
     * Returns whether this component is visible.
     */
    isVisible() { return this.visible }
    /**
     * Toggles the visibility of the component.
     * If the component is currently visible, hides it.
     * If the component is currently hidden, shows it.
     */
    toggleVisibility() { if (this.isVisible()) { this.hide() } else { this.show() } }
    /**
     * Sets the visible property to true to show the component.
     */
    visible = true
    /**
     * Returns whether this component is enabled.
     */
    isEnabled() { return this.enabled }
    /**
     * Callback when the component is enabled. 
     * If not suspended, update component's suspended state to match enabled value.
     */
    async onEnabled() {
        if (this.isSuspended) { return }
        this.suspendedState = this.enabled
    }
    /**
     * Suspends the component by setting isSuspended to true, 
     * saving the current enabled state, and disabling the component.
     */
    async suspend() {
        if (this.isSuspended) { return }
        this.isSuspended = true
        this.suspendedState = this.enabled ? true : false
        this.enabled = false
    }
    /**
     * Unsuspends the component by setting isSuspended to false and 
     * restoring the enabled state to the value stored in suspendedState.
     */
    async unsuspend() {
        if (!this.isSuspended) { return }
        this.enabled = this.suspendedState
        this.isSuspended = false
    }
    /**
     * Updates the component's group.
     * Calls Component.staticUpdateGroup() to update the group.
     */
    async updateGroup() {
        await Component.staticUpdateGroup(this)
    }
    /**
     * Focuses the element associated with this component if it can be focused.
     */
    focus() { if (this.canFocus()) { this.Element?.focus() } }
    /**
     * Returns whether this component can receive focus.
     * A component can receive focus if it is enabled, visible, not waiting,
     * and not loading.
     */
    canFocus() { return this.isEnabled() && this.isVisible() && !this.isWaiting() && !this.isLoading() }
    /**
     * Sets the waiting property to true to indicate the component is waiting.
     */
    async wait() { this.waiting = true }
    /**
     * Sets the waiting property to false to indicate the component is no longer waiting.
     */
    async unwait() { this.waiting = false }
    /**
     * Returns whether this component is waiting.
     */
    isWaiting() { return this.waiting }
    /**
     * Sets the loading property to true to indicate the component is loading.
     */
    async loadingBegin() { this.loading = true }
    /**
     * Sets the loading property to false to indicate the component is no longer loading.
     */
    async loadingEnd() { this.loading = false }
    /**
     * Returns whether this component is loading.
     */
    isLoading() { return this.loading }
    /**
     * Returns whether this component has any slots.
     * By default, components do not have slots.
     */
    hasSlots() { return false }
    /**
     * Stylizes the component by applying classes and styles from data attributes.
     * Loops through the dataClassAttributes and dataStyleAttributes arrays to apply
     * classes and styles to the root element and sub-elements. Converts attribute 
     * names to camelCase element names to find the matching sub-elements.
     */
    stylize() {
        const classes = this.dataClassAttributes

        for (let aClass of classes) {
            if (`data-class` === aClass.name) {
                const classArray = aClass.value.split(/\s+/)

                for (let classArrayValue of classArray) { this.Element.addClass(classArrayValue) }
                continue
            }

            const strippedName = `${aClass.name.slice(11)}-element`
            const camelCaseElementName = strippedName.toLowerCase().replace(/[-_][a-z0-9]/g, (group) => group.slice(-1).toUpperCase())
            const elementName = camelCaseElementName.charAt(0).toUpperCase() + camelCaseElementName.slice(1)
            const element = this[elementName]

            if (!element) { continue }

            const classArray2 = aClass.value.split(/\s+/)

            for (let classArrayValue2 of classArray2) { element.addClass(classArrayValue2) }
        }

        const styles = this.dataStyleAttributes
        const setStyles = (styleText, element) => {
            const styleArray = styleText.split(`;`)

            if (0 === styleArray.length) { return }

            for (let styleNameValue of styleArray) {
                const styleEntry = styleNameValue.split(`:`)

                if (2 !== styleEntry.length) { continue }
                element.style.setProperty(styleEntry[0].trim(), styleEntry[1].trim())
            }
        }

        for (let style of styles) {
            if (`data-style` === style.name) {
                setStyles(style.value, this.Element)
                continue
            }

            const strippedName = `${style.name.slice(11)}-element`
            const camelCaseElementName = strippedName.toLowerCase().replace(/[-_][a-z0-9]/g, (group) => group.slice(-1).toUpperCase())
            const elementName = camelCaseElementName.charAt(0).toUpperCase() + camelCaseElementName.slice(1)
            const element = this[elementName]

            if (!element) { continue }
            setStyles(style.value, element)
        }
    }
    /**
     * Gets tests.
     */
    getTests() { }
    /**
     * Gets code samples.
     */
    getSamples() { }
    /**
     * Gets data asynchronously.
     * Returns a promise that resolves to the data.
     */
    async getData() { return null }
    /**
     * Broadcasts a BEFORE_SLOT_LOADED event before a slot is loaded.
     * @param {Object} slot - The slot being loaded.
    */
    async beforeSlotLoaded(slot) { await Queue.broadcast(Component.msgs.BEFORE_SLOT_LOADED, { component: this, slot }) }
    /**
     * Broadcasts an AFTER_SLOT_LOADED event after a slot is loaded.
     * @param {Object} slot - The slot that was loaded.
    */
    async afterSlotLoaded(slot) { await Queue.broadcast(Component.msgs.AFTER_SLOT_LOADED, { component: this, slot }) }
    /**
     * Destroys the component by calling ComponentLifecycle.destroyComponentObject()
     * with the component's ID. Returns a promise that resolves when destruction
     * is complete.
     */
    async destroy() { await ComponentLifecycle.destroyComponentObject(`${this.id}`) }
}