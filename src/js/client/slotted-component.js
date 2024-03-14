class SlottedComponent extends Component {
    static createSlotMarkup(componentId, slotId, parentElement) {
        let newSlotMarkup = document.createElement(`slot-markup`)

        newSlotMarkup.setAttribute(`for-component-id`, componentId)
        newSlotMarkup.setAttribute(`for-slot`, slotId)
        parentElement.appendChild(newSlotMarkup)
        return newSlotMarkup
    }
    static async loadSlotFromInclude(parentElement, slotId, src,  componentId, props, vars, classes, styles, attributes) {
        const newSlotContent = SlottedComponent.createSlotMarkup(parentElement.id, slotId, parentElement)
        const newInclude = Component.createComponentInclude(src, componentId, props, vars, classes, styles, attributes)

        newSlotContent.appendChild(newInclude)
        await Loader.loadInclude(newInclude)
        
        SlotManager.loadSlot(newSlotContent) 
        await Loader.loadIncludes()
    }
    static async loadSlotFromJSON (parentElement, slotId, json) {
        const newSlotContent = SlottedComponent.createSlotMarkup(parentElement.id, slotId, parentElement)
        const slotContentWrapper = document.createElement(`div`)
        const slotContentWrapperId = `${parentElement.id}${slotId}ContentWrapper`

        slotContentWrapper.id = slotContentWrapperId
        for (let loop = 0; loop < json.components.length; loop++) {
            const component = json.components[loop]
            const newInclude = Component.createComponentInclude(component.includeSrc, component.componentId, component.props, component.vars, component.dataClass, component.style, component.attribute)

            newSlotContent.append(newInclude)
            await Loader.loadInclude(newInclude)
        }        
        SlotManager.loadSlot(newSlotContent)
        await Loader.loadIncludes()
    }
    static async loadSlotFromJSONFile (parentElement, slotId, jsonFile) {
        const text = await Loader.loadFile(jsonFile)
        const json = JSON.parse(text)

        await SlottedComponent.loadSlotFromJSON(parentElement, slotId, json)
    }
    isSlotted() { return true }
    get slotDescendantComponentIds() { 
        const slotIds = ComponentLifecycle.slotRegistry.get(this.className())
        const getElementGrandchildComponentIds = (slotId) => {
            let result = []     
            const element = document.getElementById(slotId)

            if (element?.id) {
                const isObjectRegistered = Component.isObjectRegistered(element?.id)

                if (isObjectRegistered) { result.push(element?.id) }
            }
            if (!element || 0 === element.children.length) { return result }

            for (let loop = 0; loop < element.children.length; loop++) {
                const child = element.children[loop]
                const grandChildResult = getElementGrandchildComponentIds(child.id)

                result = result.concat(grandChildResult)
            }
            return result
        }
        const getElementChildComponentIds = (slotId) => {
            let childResult = []     
            const markerElement = document.getElementById(`-SlotBeginMarker${slotId}`)
            let element = markerElement?.nextSibling

            while (element && element?.id.startsWith(`-ComponentBeginMarker`)) { element = element.nextSibling }
            if (element?.id) {
                const isObjectRegistered = Component.isObjectRegistered(element?.id)

                if (isObjectRegistered) { childResult.push(element?.id) }
            }
            if (!element || 0 === element.children.length) { return childResult }

            for (let loop = 0; loop < element.children.length; loop++) {
                const child = element.children[loop]
                const grandChildResult = getElementGrandchildComponentIds(child.id)

                childResult = childResult.concat(grandChildResult)
            }
            return childResult
        }
        let result = []

        for (let slotId of slotIds) {
            const componentSlotId = `${this.id}${slotId}`
            const childComponentIds = getElementChildComponentIds(componentSlotId)

            result = result.concat(childComponentIds)
        }
        return result
    }
    get slotChildComponents() { 
        const slotDescendantComponents = this.slotDescendantComponents
        const result = []

        for (let slotDescendantComponent of slotDescendantComponents) {
            if (this === slotDescendantComponent.Parent) { result.push(slotDescendantComponent) }
        }
        return result
    }
    isSlotChild(componentId) {
        const children = this.slotChildComponents

        if (0 === children.length) { return false }
        for (let childComponet of children) {
            if (childComponetId === childComponet.id) { return true }
        }
        return false
    }
    get slotDescendantComponents() { 
        const slotChildComponentIds = this.slotDescendantComponentIds
        const result = []

        for (let slotChildomponentId of slotChildComponentIds) {
            const slotChildComponent = Component.getObject(slotChildomponentId)

            result.push(slotChildComponent)
        }
        return result
    }
    isSlotDescendant(componentId) {
        const childIds = this.slotDescendantComponentIds

        if (0 === childIds.length) { return false }
        for (let childComponetId of childComponentIds) {

            if (childComponetId === componentId) { return true }
        }
        return false
    }
    async beforeSlotLoaded(slot) { await Queue.broadcast(ComponentLifecycle.msgs.COMPONENT_BEFORE_SLOT_LOADED, { component: this, slot })}
    async afterSlotLoaded(slot) { await Queue.broadcast(ComponentLifecycle.msgs.COMPONENT_AFTER_SLOT_LOADED, { component: this, slot } )}
    async beforeSlotUnloaded(slot) { await Queue.broadcast(ComponentLifecycle.msgs.COMPONENT_BEFORE_SLOT_UNLOADED, { component: this, slot })}
    async afterSlotUnloaded(slot) { await Queue.broadcast(ComponentLifecycle.msgs.COMPONENT_AFTER_SLOT_UNLOADED, { component: this, slot } )}
    isSlotted(slotId) { return SlotManager.isSlotted(this.id, slotId) }
    slot(element, slotId) { SlotManager.moveSlotContentToComponent(this, element, document.getElementById(slotId)) }
    unslot(slotId) { SlotManager.unslot(slotId) }
    hasSlots() { return true }
    async show() { 
        await super.show()
        const children = this.slotChildComponents
        for (let child of children) { child.show() }
    }
    async hide() {
        await super.hide()
        const children = this.slotChildComponents
        for (let child of children) { child.hide() }
    }
    async onEnabled() { 
        await super.onEnabled()
        const children = this.slotChildComponents
        for (let child of children) { child.onEnabled() }
    }
    async suspend() { 
        await super.suspend()
        const children = this.slotChildComponents
        for (let child of children) { child.suspend() }
    }
    async unsuspend() { 
        await super.unsuspend()
        const children = this.slotChildComponents
        for (let child of children) { child.unsuspend() }
    }
    focus() { 
        const children = this.slotChildComponents
        if (children.length) { children[0].focus() }
    }
    async destroy() { 
        await super.destroy()

        const slotChildComponents = this.slotChildComponents

        if (slotChildComponents && 0 !== slotChildComponents.length) {
            for (let childComponentId of slotChildComponents) {
                if (!Component.isObjectRegistered(`${component.id}${childComponentId}`)) { 
                    continue 
                }
                
                const childId = `${component.id}${childComponentId}`

                await ComponentLifecycle.destroyComponentObject(childId)
            }
        }
    }

    slots = []
}