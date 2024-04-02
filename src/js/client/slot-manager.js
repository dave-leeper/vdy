class SlotManager {
    /**
     * Checks if a slot with the given ID is present in the DOM for the given component ID.
     * 
     * @param {string} forComponentId - The ID of the component to check.
     * @param {string} slotId - The ID of the slot to check for.
     * @returns {boolean} - Whether the slot is present in the component's DOM.
     */
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
    /**
     * Gets the DOM element for the slot with the given ID in the component with the given ID.
     * 
     * @param {string} forComponentId - The ID of the component to get the slot from.
     * @param {string} slotId - The ID of the slot to get.
     * @returns {Element|null} The DOM element for the slot, or null if not found.
     */
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
    /**
     * Moves the content from a slot element into a component's shadow DOM slot.
     * 
     * Moves all child elements from the slotContentElement into the componentSlotElement
     * in the component's shadow DOM, preserving their relative order. Handles inserting
     * slot marker elements before and after the moved content. Removes the original 
     * slotContentElement after moving its children.
     * 
     * @param {Object} component - The component instance to move the slot content into.
     * @param {Element} slotContentElement - The element containing the content to move.
     * @param {Element} componentSlotElement - The shadow DOM slot element to move the content into.
     * @returns {boolean} - True if the move was successful, false otherwise.
     */
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
    /**
     * Loads slot content from all <slot-markup> elements in the DOM. 
     * Iterates through all <slot-markup> elements, calls loadSlot() on each one.
     */
    static loadSlots() {
        let slotMarkupElements = document.querySelectorAll('slot-markup')

        for (let slotContent of slotMarkupElements) {
            SlotManager.loadSlot(slotContent)
        }
    }
    /**
     * Unslots the content from the slot with the given ID.
     * Finds the begin and end markers for the slot, removes the content
     * between them, and replaces the slot element with a new empty one.
     * Calls beforeSlotUnloaded and afterSlotUnloaded on the component.
     */
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