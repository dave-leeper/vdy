class SlottedComponent extends Component {
    /**
     * Creates a new slot markup element and appends it to the parent element.
     * 
     * @param {string} componentId - The id of the component this slot belongs to.
     * @param {string} slotId - The id of the slot to create markup for.
     * @param {Element} parentElement - The parent element to append the new slot markup element to.
     * @returns {Element} The newly created slot markup element.
     */
    static createSlotMarkup(componentId, slotId, parentElement) {
        let newSlotMarkup = document.createElement(`slot-markup`)

        newSlotMarkup.setAttribute(`for-component-id`, componentId)
        newSlotMarkup.setAttribute(`for-slot`, slotId)
        parentElement.appendChild(newSlotMarkup)
        return newSlotMarkup
    }

    /**
     * Loads slot content dynamically from a separate file into the slot markup element.
     * 
     * @param {Element} parentElement - The parent element containing the slot markup. 
     * @param {string} slotId - The id of the slot to load content into.
     * @param {string} src - The source URL to load slot content from.
     * @param {string} componentId - The id of the component this slot belongs to.
     * @param {Object} props - Props to pass to the loaded slot content.
     * @param {Object} vars - Variables to pass to the loaded slot content. 
     * @param {string[]} classes - Classes to add to the loaded slot content.
     * @param {Object} styles - Styles to apply to the loaded slot content.
     * @param {Object} attributes - Attributes to add to the loaded slot content.
     */
    static async loadSlotFromInclude(parentElement, slotId, src, componentId, props, vars, classes, styles, attributes) {
        const newSlotContent = SlottedComponent.createSlotMarkup(parentElement.id, slotId, parentElement)
        const newInclude = Component.createComponentInclude(src, componentId, props, vars, classes, styles, attributes)

        newSlotContent.appendChild(newInclude)
        await Loader.loadInclude(newInclude)
        
        SlotManager.loadSlot(newSlotContent) 
        await Loader.loadIncludes()
    }
    /**
     * Loads slot content dynamically from JSON into the slot markup element.
     * 
     * @param {Element} parentElement - The parent element containing the slot markup.
     * @param {string} slotId - The id of the slot to load content into. 
     * @param {Object} json - The JSON data to load the slot content from.
     * @returns {Promise} A promise that resolves when the slot content is loaded.
     */
    static async loadSlotFromJSON(parentElement, slotId, json) {
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
    /**
     * Loads slot content dynamically from a JSON file into the slot markup element.
     * 
     * @param {Element} parentElement - The parent element containing the slot markup.
     * @param {string} slotId - The id of the slot to load content into.
     * @param {string} jsonFile - The path to the JSON file to load the slot content from.
     * @returns {Promise} A promise that resolves when the slot content is loaded.
     */
    static async loadSlotFromJSONFile(parentElement, slotId, jsonFile) {
        const text = await Loader.loadFile(jsonFile)
        const json = JSON.parse(text)

        await SlottedComponent.loadSlotFromJSON(parentElement, slotId, json)
    }
    /**
     * Indicates if the component is a slotted component.
     * 
     * @returns {boolean} True if the component is slotted.
     */
    isSlotted() { return true }
    /**
     * Recursively gets the IDs of all descendant and child components within the element tree under the slots for this component.
     * 
     * Loops through each slot ID associated with this component. For each slot ID, calls helper functions to get child and descendant component IDs under that slot element tree.
     * 
     * Concatenates and returns a single array containing all descendant component IDs under all slots for this component.
     */
    get slotDescendantComponentIds() {
        const slotIds = ComponentLifecycle.slotRegistry.get(this.className())
        /**
         * Recursively gets the IDs of all descendant components within the element tree under the given slot ID.  
         * 
         * @param {string} slotId - The ID of the slot element to search under
         * @returns {Array<string>} The array of descendant component IDs
         */
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
        /**
         * Recursively gets the IDs of all child components within the element tree under the given slot ID.
         * 
         * @param {string} slotId - The ID of the slot element to search under
         * @returns {Array<string>} The array of child component IDs
         */
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
    /**
     * Gets the child Component instances that are slotted within this Component's shadow DOM slots.
     * 
     * Loops through all slot descendant Components and returns the ones where this Component is the parent.
     */
    get slotChildComponents() {
        const slotDescendantComponents = this.slotDescendantComponents
        const result = []

        for (let slotDescendantComponent of slotDescendantComponents) {
            if (this === slotDescendantComponent.Parent) { result.push(slotDescendantComponent) }
        }
        return result
    }
    /**
     * Checks if the given component ID is a child component within one of this component's slots.
     * 
     * Loops through the slotChildComponents array and returns true if the given ID matches one of them.
     */
    isSlotChild(componentId) {
        const children = this.slotChildComponents

        if (0 === children.length) { return false }
        for (let childComponet of children) {
            if (childComponetId === childComponet.id) { return true }
        }
        return false
    }
    /**
     * Gets the descendant Component instances that are slotted within this Component's DOM slots.
     * 
     * Loops through all slot descendant component IDs, gets the corresponding Component instance for each ID, 
     * and returns the Component instances where this Component is the parent.
     */
    get slotDescendantComponents() {
        const slotChildComponentIds = this.slotDescendantComponentIds
        const result = []

        for (let slotChildomponentId of slotChildComponentIds) {
            const slotChildComponent = Component.getObject(slotChildomponentId)

            result.push(slotChildComponent)
        }
        return result
    }
    /**
     * Checks if the given component ID is a descendant component within 
     * one of this component's slots.
     * 
     * Loops through the slot descendant component IDs and returns true if 
     * the given ID matches one of them.
    */
    isSlotDescendant(componentId) {
        const childIds = this.slotDescendantComponentIds

        if (0 === childIds.length) { return false }
        for (let childComponetId of childComponentIds) {

            if (childComponetId === componentId) { return true }
        }
        return false
    }
    /**
     * Broadcasts a lifecycle event to all child components in the given slot
     * before the slot content is loaded.
     * 
     * @param {HTMLElement} slot - The slot element that is about to be populated.
     */
    async beforeSlotLoaded(slot) { await Queue.broadcast(ComponentLifecycle.msgs.COMPONENT_BEFORE_SLOT_LOADED, { component: this, slot }) }
    /**
     * Broadcasts a lifecycle event to all child components in the given slot
     * after the slot content has been loaded.
     * 
     * @param {HTMLElement} slot - The slot element that was just populated.
     */
    async afterSlotLoaded(slot) { await Queue.broadcast(ComponentLifecycle.msgs.COMPONENT_AFTER_SLOT_LOADED, { component: this, slot }) }
    /**
     * Broadcasts a lifecycle event to all child components in the given slot
     * before the slot content is unloaded.
     *  
     * @param {HTMLElement} slot - The slot element that is about to be emptied.
     */
    async beforeSlotUnloaded(slot) { await Queue.broadcast(ComponentLifecycle.msgs.COMPONENT_BEFORE_SLOT_UNLOADED, { component: this, slot }) }
    /**
     * Broadcasts a lifecycle event to all child components in the given slot
     * after the slot content has been unloaded.
     *
     * @param {HTMLElement} slot - The slot element that was just emptied.
     */
    async afterSlotUnloaded(slot) { await Queue.broadcast(ComponentLifecycle.msgs.COMPONENT_AFTER_SLOT_UNLOADED, { component: this, slot }) }
    /**
     * Checks if the given slot ID is one of this component's slots.
     */
    isSlotted(slotId) { return SlotManager.isSlotted(this.id, slotId) }
    /**
     * Moves the content of the given element into the slot with the provided ID on this component.
     * Uses the SlotManager utility to handle the DOM manipulation.
     */
    slot(element, slotId) { SlotManager.moveSlotContentToComponent(this, element, document.getElementById(slotId)) }
    /**
     * Removes the content from the slot with the given ID on this component.
     * Uses the SlotManager utility to handle the DOM manipulation.
     * 
     * @param {string} slotId - The ID of the slot to unslot.
     */
    unslot(slotId) { SlotManager.unslot(slotId) }
    /**
     * Indicates if this component has any &lt;slot&gt; elements.
     */
    hasSlots() { return true }
    /**
     * Calls show method to all child components in slots after
     * calling super.show().
     */
    async show() {
        await super.show()
        const children = this.slotChildComponents
        for (let child of children) { child.show() }
    }
    /**
     * Calls hide method on all child components in slots after
     * calling super.hide().
     */
    async hide() {
        await super.hide()
        const children = this.slotChildComponents
        for (let child of children) { child.hide() }
    }
    /**
     * Calls the onEnabled lifecycle method on all child components in slots
     * after calling the super onEnabled method.
     * 
     * This allows all child components to handle the enabled state change
     * after the component itself has handled it.
     */
    async onEnabled() {
        await super.onEnabled()
        const children = this.slotChildComponents
        for (let child of children) { child.onEnabled() }
    }
    /**
     * Calls the suspend lifecycle method on all child components in slots
     * after calling the super suspend method.
     * 
     * This allows all child components to handle the suspend state change
     * after the component itself has handled it.
     */
    async suspend() {
        await super.suspend()
        const children = this.slotChildComponents
        for (let child of children) { child.suspend() }
    }
    /**
     * Calls the unsuspend lifecycle method on all child components in slots
     * after calling the super unsuspend method.
     *
     * This allows all child components to handle the unsuspend state change
     * after the component itself has handled it.
     */
    async unsuspend() {
        await super.unsuspend()
        const children = this.slotChildComponents
        for (let child of children) { child.unsuspend() }
    }
    /**
     * Calls the focus() method on the first child component in slots.
     * This allows the first child component to receive focus after the
     * component itself has handled the focus event.
     */
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