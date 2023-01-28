class SlotManager {
    static loadSlots() {
        const getSlot = (forComponentId, slotName) => {
            const componentElement = document.getElementById(forComponentId)
    
            if (!componentElement) {
                console.error(`getSlot: Component element ${forComponentId} was not found.`)
                return null
            }
    
            const componentSlot = componentElement.querySelector(`component-slot[id=${slotName}]`)
    
            if (!componentSlot) {
                console.error(`getSlot: Component slot ${slotName} was not found.`)
                return null
            }
    
            return componentSlot
        }
        const moveSlotContentToComponent = (forComponentId, slotContentElement, componentSlotElement) => {
            if (0 === slotContentElement.children.length) {
                console.error(`moveSlotContentToComponent: Slot content element has no children.`)
                return false
            }
            if (0 !== componentSlotElement.children.length) {
                console.error(`moveSlotContentToComponent: Component slot ${componentElement.getAttribute(`for-slot`)} was not found.`)
                return false
            }
    
            while (0 < slotContentElement.children.length) { componentSlotElement.after(slotContentElement.firstChild) }
            componentSlotElement.remove()
            slotContentElement.remove()
    
            return true
        }
        const slotMarkupElements = document.querySelectorAll('slot-markup')

        for (let slotContent of slotMarkupElements) {
            const forComponentId = slotContent.getAttribute(`for-component-id`)

            if (!forComponentId) {
                console.error(`loadSlots: The for-component-id attribute is required on slot-markup tags.`)
                continue
            }

            const slotName = slotContent.getAttribute(`for-slot`)
            const componentSlot = getSlot(forComponentId, slotName)
            const component = Component.getObject(forComponentId)

            if (!componentSlot) { continue }
            component?.beforeSlotLoaded(slotName)
            if (!moveSlotContentToComponent(forComponentId, slotContent, componentSlot)) {
                console.error(`loadSlots: An error occured while moving slot content to the ${componentElement.getAttribute(`for-slot`)}] slot of ${forComponentId}.`)
                continue
            }
            component?.afterSlotLoaded(slotName)
        }
    }
}