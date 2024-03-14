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
    static isObjectRegistered(componentObjectId) {
        if (!componentObjectId) { 
            console.error(`isObjectRegistered: No component object id provided.`)
            return null 
        }
        return ComponentLifecycle.objectRegistry?.has(componentObjectId)
    }
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
    static createComponentInclude(src, componentId, props, vars, classes, styles, attributes) {
        let newInclude = document.createElement(`include-html`, { })
        let propsString = null
        let varsString = null

        if (props) {
            propsString = JSON.stringify(props)
            propsString = propsString.replace(/\'/g,"\\'")                  // Replace ' with \'
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
        if (classes) { for (let aClass of classes) { newInclude.setAttribute(`data-class`, aClass) }}
        // styles = `[{ name: `data-style`, value: `width: 20px; height:20px` }, { name: `data-style-wrapper`, value: `color: red` }]
        if (styles) { for (let style of styles) { newInclude.setAttribute(style.name, style.value) }}
        // attributes = `disabled: true; value: xyz;`
        if (attributes) {
            const nameValuePairs =  attributes.split(`;`)

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
    static groups = new Map()
    static groupObjectUncheckCallbacks = new Map()
    static groupObjectGetDataCallbacks = new Map()
    static addToGroup(groupName, object, uncheckCallback, getDataCallback) {
        if (Component.isInGroup(object)) { return }

        let groupObjects = Component.groups.get(groupName)

        if (!groupObjects) { groupObjects = [] }
        groupObjects.push(object)
        Component.groups.set(groupName, groupObjects)
        if (uncheckCallback) { Component.groupObjectUncheckCallbacks.set(object, uncheckCallback) }
        if (getDataCallback) { Component.groupObjectGetDataCallbacks.set(object, getDataCallback) }
    }
    static removeFromGroup(groupName, object) {
        if (!Component.groupIncludesObject(groupName, object)) { return }

        let groupObjects = Component.groups.get(groupName)

        if (!groupObjects.includes(object)) { return }
        groupObjects.splice(array.indexOf(object), 1)
        Component.groups.set(groupName, groupObjects)
        if (Component.groupObjectUncheckCallbacks.has(object)) { Component.groupObjectUncheckCallbacks.delete(object) }
        if (Component.groupObjectGetDataCallbacks.has(object)) { Component.groupObjectGetDataCallbacks.delete(object) }
    }
    static getGroupObjects(groupName) {
        let groupObjects = Component.groups.get(groupName)

        if (!groupObjects) { return null }
        return groupObjects
    }
    static isInGroup(object) {
        for (let [key, value] of Component.groups) { if (value && value.includes(object)) { return key }}
        return false
    }
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
    static getGroupObjectAt(groupName, index) {
        const groupObjects = Component.getGroupObjects(groupName)

        if (0 > index || groupObjects.length - 1 < index) { return null }
        for (let loop = 0; loop < groupObjects.length; loop++) {
            const obj = groupObjects[loop]

            if (index === obj.props?.groupIndex) { return obj }
        }
        return groupObjects[index]
    }
    static groupIncludesObject(groupName, object) {
        let groupObjects = Component.groups.get(groupName)

        if (!groupObjects) { return false }
        return groupObjects.includes(object)
    }
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

    className() {return this.constructor.name }
    isSlotted() { return false }
    mounted = false
    mountedChildren = []
    mountedDescendants = []
    isParent(childObject) { return childObject.Parent === this }
    get childComponentIds() { return ComponentLifecycle.childComponentRegistry.get(this.className()) }
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
    getChildComponents() { 
        return this.childComponents
    }
    isChild(componentId) {
        const childIds = this.childComponentIds

        if (0 === childIds.length) { return false }
        for (let childComponetId of childComponentIds) {
            const fullId = `${this.id}${childComponetId}`

            if (fullId === componentId) { return true }
        }
        return false
    }
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
    get Form() {
        let parent = this.Parent

        while (parent) {
            if (`Form` === parent.className()) { return parent}
            parent = parent.Parent
        }
        return null
    }
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
    haveChildrenMounted() { return this.mountedChildren.length === this.childComponentIds.length }
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
    async mount() { await ComponentLifecycle.mount(this.id) }
    async beforeMount() { await Queue.broadcast(Component.msgs.BEFORE_MOUNT, this )}
    async afterMount() { 
        await Queue.broadcast(Component.msgs.AFTER_MOUNT, this )
        this.Parent?.childMounted(this)
        if (0 === this.childComponentIds.length) {
            await this.onChildrenMounted()
            await this.onDescendantsMounted()
            this.enabled = !!this.enabled
        }
    }
    async unmount() { await ComponentLifecycle.unmount(this.id) }
    async beforeUnmount() { 
        await Queue.broadcast(Component.msgs.BEFORE_UNMOUNT, this )

        const childComponents = ComponentLifecycle.childComponentRegistry.get(this.className())

        if (!childComponents || 0 === childComponents.length) { return }

        for (let childComponentId of childComponents) {
            if (!Component.isObjectRegistered(`${this.id}${childComponentId}`)) { continue }
            
            const child = Component.getObject(`${this.id}${childComponentId}`)
            
            if (child.isMounted()) { await child.unmount() }
        }
    }
    async afterUnmount() { await Queue.broadcast(Component.msgs.AFTER_UNMOUNT, this )}
    isMounted() { return this.mounted }
    async childMounted(child) {
        this.mountedChildren.push(child)
        if (this.mountedChildren.length === this.childComponentIds.length) { await this.onChildrenMounted() }
        if (child.haveDescendantsMounted()) { this.mountedDescendants.push(child) }
        if (this.mountedDescendants.length === this.childComponentIds.length) { 
            await this.onDescendantsMounted() 
            this.enabled = !!this.enabled
        }
    }
    async onChildrenMounted() {
        Loader.addChildComponentGettersToComponentObject(this.className(), this.id)
        await Queue.broadcast(Component.msgs.CHILDREN_MOUNTED, this )
    }
    async onDescendantsMounted() { 
        await Queue.broadcast(Component.msgs.DESCENDANTS_MOUNTED, this )
        this.stylize()
    }
    async show() { 
        await Queue.broadcast(Component.msgs.BEFORE_SHOW, this)
        this.visible = true
        this.Element?.show() 
        await Queue.broadcast(Component.msgs.AFTER_SHOW, this)
    }
    async hide() { 
        await Queue.broadcast(Component.msgs.BEFORE_HIDE, this)
        this.visible = false
        this.Element?.hide() 
        await Queue.broadcast(Component.msgs.AFTER_HIDE, this)
    }
    isVisible() { return this.visible }
    toggleVisibility() { if (this.isVisible()) { this.hide() } else { this.show() }}
    visible = true
    isEnabled() { return this.enabled }
    async onEnabled() { 
        if (this.isSuspended) { return }
        this.suspendedState = this.enabled
    }
    async suspend() { 
        if (this.isSuspended) { return }
        this.isSuspended = true
        this.suspendedState = this.enabled? true : false
        this.enabled = false
    }
    async unsuspend() { 
        if (!this.isSuspended) { return }
        this.enabled = this.suspendedState 
        this.isSuspended = false
    }
    async updateGroup() { 
        await Component.staticUpdateGroup(this)
    }
    focus() { if (this.canFocus()) { this.Element?.focus() }}
    canFocus() { return this.isEnabled() && this.isVisible() && !this.isWaiting() && !this.isLoading() }
    async wait() { this.waiting = true }
    async unwait() { this.waiting = false }
    isWaiting() { return this.waiting }
    async loadingBegin() { this.loading = true }
    async loadingEnd() { this.loading = false }
    isLoading() { return this.loading }
    hasSlots() { return false }
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
    getTests() {}
    getSamples() {}
    async getData() { return null }
    async beforeSlotLoaded(slot) { await Queue.broadcast(Component.msgs.BEFORE_SLOT_LOADED, { component: this, slot })}
    async afterSlotLoaded(slot) { await Queue.broadcast(Component.msgs.AFTER_SLOT_LOADED, { component: this, slot } )}
    async destroy() { await ComponentLifecycle.destroyComponentObject(`${this.id}`) }
}