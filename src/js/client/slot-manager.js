class SlotManager {
    static isSlotted = (forComponentId, slotId) => {
        const componentElement = document.getElementById(forComponentId)

        if (!componentElement) { return false }

        const beginMarkerId = `#-SlotBeginMarker${slotId}`
        const beginMarker = componentElement.querySelector(beginMarkerId)
        const endMarkerId = `#-SlotEndMarker${slotId}`
        const endMarker = componentElement.querySelector(endMarkerId)

        if (!beginMarker || endMarker) { return false }

        return true
    }
    static getSlot = (forComponentId, slotId) => {
        const componentElement = document.getElementById(forComponentId)

        if (!componentElement) {
            console.error(`getSlot: Component element ${forComponentId} was not found.`)
            return null
        }

        const componentSlot = componentElement.querySelector(`component-slot[id=${slotId}]`)

        if (!componentSlot) {
            console.error(`getSlot: Component slot ${slotId} was not found.`)
            return null
        }

        return componentSlot
    }
    static moveSlotContentToComponent = (component, slotContentElement, componentSlotElement) => {
        if (0 === slotContentElement.children.length) {
            console.error(`moveSlotContentToComponent: Slot content element has no children.`)
            return false
        }
        if (0 !== componentSlotElement.children.length) {
            console.error(`moveSlotContentToComponent: Component slot ${componentSlotElement.getAttribute(`for-slot`)} was not found.`)
            return false
        }

        const beginMarkerId = `-SlotBeginMarker${componentSlotElement.id}`
        const beginMarker = document.createElement(`script`)
        const endMarkerId = `-SlotEndMarker${componentSlotElement.id}`
        const endMarker = document.createElement(`script`)

        beginMarker.id = beginMarkerId
        endMarker.id = endMarkerId
        componentSlotElement.after(endMarker)
        while (0 < slotContentElement.children.length) {
            ComponentLifecycle.setEventHandlers(slotContentElement.lastChild, component.id)
            ComponentLifecycle.addElementGettersToComponentObject(slotContentElement.lastChild, component)
            ComponentLifecycle.addConvenienceMethodsToElement(slotContentElement.lastChild)
            componentSlotElement.after(slotContentElement.lastChild)
        }
        componentSlotElement.after(beginMarker)
        componentSlotElement.remove()
        slotContentElement.remove()

        return true
    }
    static loadSlot(slotContent) {
        const forComponentId = slotContent.getAttribute(`for-component-id`)

        if (!forComponentId) {
            console.error(`loadSlots: The for-component-id attribute is required on slot-markup tags.`)
            return
        }

        const slotName = slotContent.getAttribute(`for-slot`)
        const componentSlot = SlotManager.getSlot(forComponentId, slotName)
        const component = Component.getObject(forComponentId)

        if (!componentSlot) { return }
        component?.beforeSlotLoaded(slotName)
        if (!SlotManager.moveSlotContentToComponent(component, slotContent, componentSlot)) {
            console.error(`loadSlots: An error occured while moving slot content to the ${componentElement.getAttribute(`for-slot`)}] slot of ${forComponentId}.`)
            return
        }
        component?.afterSlotLoaded(slotName)
    }
    static loadSlots() {
        let slotMarkupElements = document.querySelectorAll('slot-markup')

        for (let slotContent of slotMarkupElements) {
            SlotManager.loadSlot(slotContent)
        }
    }
    static unslot = (slotId) => {
        const beginMarkerId = `-SlotBeginMarker${slotId}`
        const beginMarker = document.getElementById(beginMarkerId)
        const endMarkerId = `-SlotEndMarker${slotId}`
        const endMarker = document.getElementById(endMarkerId)

        if (beginMarker) {
            console.error(`removeSlotContentFromComponent: Slot ${beginMarkerId} was not found.`)
            return false
        }
        if (endMarker) {
            console.error(`removeSlotContentFromComponent: Slot ${endMarkerId} was not found.`)
            return false
        }
        component?.beforeSlotUnloaded(slotName)
        while (beginMarker.nextSibling && beginMarker.nextSibling.id !== endMarkerId) {
            beginMarker.nextSibling.remove()
        }
        endMarker.remove()

        const componentSlotTag = document.createElement(`component-slot`)

        componentSlotTag.id = slotId
        beginMarker.after(componentSlotTag)
        beginMarker.remove()
        component?.afterSlotUnloaded(slotName)

        return true
    }
}