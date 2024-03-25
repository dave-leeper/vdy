/**
 *  <table>
 *  <tr><th>FRAGRMENT STATE</th>             <th>FRAGMENT STATE</th>                      <th>NOTES</th></tr>
 *  <tr><th>(Transitions flow down)</th>     <th>(Transitions flow left/right)</th>       <th></th></tr>
 *  <tr><th>Compile</th>                     <td></td>                                    <td>Creates document fragment from text.</td></tr>
 *  <tr><th>Register Dom Fragment</th>       <td><--> Unregister Dom Fragment</td>        <td>Document fragment put in registry, script tags moved to <HEAD>.<td></tr>
 *  <tr></tr>
 *  <tr><th>COMPONENT STATE</th>             <th>COMPONENT STATE</th>                     <th>NOTES</th></tr>
 *  <tr><th>(Transitions flow down)</th>     <th>(Transitions flow left/right)</th>       <th></th></tr>
 *  <tr><th>Create Component Object</th>     <td></td>                                    <td>Object instantiated from the class representing the component. Object initialized. Vars and props are wrapped. Node values and attribute values are replaced for the first time.<td></tr>
 *  <tr><th>Register Component Object</th>   <td><--> Unregister Component Object</td>    <td>Object placed in registery. Has a unique ID and knows the id of its associated fragment.<td></tr>
 *  <tr><th>mount<th/>                       <td><--> unmount</td>                        <td>Component placed in DOM, rendered to screen.</td></tr>
 *  <tr><th>children mounted</th>            <td></td>                                    <td>The child components of a component have mounted.</td></tr>
 *  <tr><th>descendants mounted</th>         <td></td>                                    <td>All descendant components of a component have mounted.</td></tr>
 *  <tr><th>enabled</th>                     <td><--> disabled</td>                       <td>Component switches between the enabled and disabled state. onEnabled is called with a bool parameter indicating if the component is enabled. Components are enabled by default.</td></tr>
 *  <tr><th>suspend</th>                     <td><--> unsuspend</td>                      <td>When a component is suspended, its enabled state is saved and it is placed in a disabled state. When a component is unsuspended its saved enabled state is restored.</td></tr>
 *  <tr><th>update</th>                      <td></td>                                    <td>Not truely a lifecycle state. This is when you'll set vars to replace node and attribute values.</td></tr>
 *  <tr><th>destroy</th>                     <td></td>                                    <td>The object is unmounted, unregistereed, and it's marker is removed from the DOM.</td></tr>
 *  </table>
 *  @class
 */
class ComponentLifecycle {
    static msgs = {
        VAR_VALUE_CHANGED: `VAR_VALUE_CHANGED`
    }
    static objectFragmentRegistry = new Map()
    static fragmentRegistry = new Map()
    static objectRegistry = new Map()
    static childComponentRegistry = new Map()
    static initialize() { }
    /**
     * Recursively saves the original nodeValue for text nodes and original attributes for element nodes,
     * so they can be restored later if needed.
     */
    static saveOriginalNodeValues(node) {
        if (node.nodeValue) {
            if (!node.originalNodeValue) { node.originalNodeValue = node.nodeValue }
        }
        for (let child of node.childNodes) {
            ComponentLifecycle.saveOriginalNodeValues(child)
        }
    }
    /**
     * Recursively saves the original attribute values for element nodes,
     * so they can be restored later if needed.
     */
    static saveOriginalNodeAttributes(node) {
        if (node.attributes) {
            for (let attr of node.attributes) {
                if (!attr.originalAttributeValue) { attr.originalAttributeValue = attr.value }
            }
        }
        for (let child of node.childNodes) {
            ComponentLifecycle.saveOriginalNodeAttributes(child)
        }
    }
    /**
     * Recursively copies original node values from srcNode to destNode.
     * Checks if srcNode has an originalNodeValue and copies it to destNode if destNode does not already have one.
     * Loops through child nodes and recursively calls copyOriginalNodeValues on each pair of child nodes.
     */
    static copyOriginalNodeValues(srcNode, destNode) {
        if (srcNode.nodeValue) {
            if (srcNode.originalNodeValue && !destNode.originalNodeValue) {
                destNode.originalNodeValue = srcNode.originalNodeValue
            }
        }
        for (let loop = 0; loop < srcNode.childNodes.length; loop++) {
            let srcChildNode = srcNode.childNodes[loop]
            let destChildNode = destNode.childNodes[loop]
            ComponentLifecycle.copyOriginalNodeValues(srcChildNode, destChildNode)
        }
    }
    /**
     * Recursively copies original attribute values from srcNode to destNode. 
     * Checks if srcNode has original attribute values and copies them to destNode if destNode does not already have them.
     * Loops through attributes and child nodes, recursively calling copyOriginalNodeAttributes.
     */
    static copyOriginalNodeAttributes(srcNode, destNode) {
        if (srcNode.attributes) {
            for (let loop = 0; loop < srcNode.attributes.length; loop++) {
                let srcAttribute = srcNode.attributes[loop]
                let destAttribute = destNode.attributes[srcAttribute.name]

                if (srcAttribute.originalAttributeValue && !destAttribute.originalAttributeValue) {
                    destAttribute.originalAttributeValue = srcAttribute.originalAttributeValue
                }
            }
        }
        for (let loop = 0; loop < srcNode.childNodes.length; loop++) {
            let srcChildNode = srcNode.childNodes[loop]
            let destChildNode = destNode.childNodes[loop]
            ComponentLifecycle.copyOriginalNodeAttributes(srcChildNode, destChildNode)
        }
    }
    /**
     * Recursively replaces node values containing template strings with member data.
     * Checks if node has originalNodeValue and saves current value.
     * Checks if node has replacementData map and initializes it if not.
     * Checks if member template string is in original node value.
     * Saves member data in replacementData map.
     * Replaces all template string occurrences with corresponding data.
     * Sets new node value with replacements.
     * Recursively calls on child nodes.
    */
    static replaceNodeValue(node, data, member) {
        if (node.nodeValue || node.originalNodeValue) {
            if (!node.originalNodeValue) { node.originalNodeValue = node.nodeValue }
            if (!node.replacementData) { node.replacementData = new Map() }

            const formattedMember = `{${member}}`
            const matches = -1 !== node.originalNodeValue.indexOf(formattedMember)
            let newValue = node.originalNodeValue

            if (matches && data.hasOwnProperty(member)) {
                // TODO: Thoroughly test this with multiple replacements in a single node value.
                try {
                    const memberData = data[member].toString()
                    const replaceFunc = (value, key, map) => {
                        const formattedKey = `{${key}}`

                        newValue = newValue.replaceAll(formattedKey, value)
                    }

                    node.replacementData.set(member, memberData)
                    node.replacementData.forEach(replaceFunc)
                    node.nodeValue = newValue
                } catch (e) {
                    console.warn(`Unable to replace node value containing ${member}. Existing node value is ${node.nodeValue}. It's replacement value is ${data[member]}. Node id is ${node.id}`)
                }
            }
        }
        for (let child of node.childNodes) {
            ComponentLifecycle.replaceNodeValue(child, data, member)
        }
    }
    /**
     * Recursively replaces attribute values containing template strings with member data.
     * Checks if attribute has originalAttributeValue and saves current value. 
     * Checks if attribute has replacementData map and initializes it if not.
     * Checks if member template string is in original attribute value.
     * Saves member data in replacementData map.
     * Replaces all template string occurrences with corresponding data.
     * Sets new attribute value with replacements.
     * Recursively calls on child nodes.
    */
    static replaceAttributeValue(node, data, member) {
        if (node.attributes) {
            for (let attr of node.attributes) {
                if (!attr.originalAttributeValue) { attr.originalAttributeValue = attr.value }
                if (!attr.replacementData) { attr.replacementData = new Map() }

                const formattedMember = `{${member}}`
                const matches = -1 !== attr.originalAttributeValue.indexOf(formattedMember)
                let newValue = attr.originalAttributeValue

                if (matches) {
                    // TODO: Thoroughly test this with multiple replacements in a single attribute value.
                    try {
                        let memberData = data[member].toString()
                        const replaceFunc = (value, key, map) => {
                            const formattedKey = `{${key}}`

                            newValue = newValue.replaceAll(formattedKey, value)
                        }

                        attr.replacementData.set(member, memberData)
                        attr.replacementData.forEach(replaceFunc)
                        attr.value = newValue
                    } catch (e) {
                        console.warn(`Unable to replace attribute containing ${member}. It's replacement value is ${data[member]}. Node id is ${node.id}`)
                    }
                }
            }
        }
        for (let child of node.children) {
            ComponentLifecycle.replaceAttributeValue(child, data, member)
        }
    }
    /**
     * Wraps the component object's data members in getter/setter proxies. 
     * This allows reactive tracking of changes to the component's data.
     * The enabled member is currently hardcoded, but more can be added.
     * When a proxied data member changes, a message is broadcast on the Queue.
     */
    static wrapObjectData(componentObject) {
        if (!componentObject.vars) { return }
        let members = [`enabled`]

        componentObject.$objectDataStore = { enabled: componentObject.enabled }
        for (let member of members) {
            Object.defineProperty(componentObject, member, {
                get: function () {
                    return componentObject.$objectDataStore[member]
                },
                set: function (newValue) {
                    const oldValue = componentObject.$objectDataStore[member]

                    componentObject.$objectDataStore[member] = newValue
                    Queue.broadcast(ComponentLifecycle.msgs.VAR_VALUE_CHANGED, { componentObject, member, oldValue, newValue })
                }
            })
        }
    }
    /**
     * Wraps the props members of the given component object in getter/setter 
     * proxies. This allows reactive tracking of changes to the component's 
     * props. The existing props are copied to a $propsStore property on 
     * the component's props object. The individual props are then proxied
     * through getters/setters that reference the $propsStore copy. 
     * Setters will log errors since props should be immutable.
     * The component's DOM is also searched and any matching prop values
     * are replaced with the proxied getters/setters.
     */
    static wrapProps(componentObject) {
        if (!componentObject.props) { return }
        let members = Object.getOwnPropertyNames(componentObject.props)

        componentObject.props.$propsStore = { ...componentObject.props }
        for (let member of members) {
            if (`$propsStore` === member) { continue }
            Object.defineProperty(componentObject.props, member, {
                get: function () {
                    return componentObject.props.$propsStore[member]
                },
                set: function (newValue) {
                    console.error(`wrapProps: Cannot set ${member}.`)
                }
            })

            ComponentLifecycle.replaceNodeValue(componentObject.ObjectFragment, componentObject.props, member)
            ComponentLifecycle.replaceAttributeValue(componentObject.ObjectFragment, componentObject.props, member)
        }
    }
    /**
     * Wraps the vars members of the given component object in getter/setter 
     * proxies. This allows reactive tracking of changes to the component's
     * vars. The existing vars are copied to a $varsStore property on the 
     * component's vars object. The individual vars are then proxied through 
     * getters/setters that reference the $varsStore copy.
     * Setters will update any matching DOM node values and broadcast var changes.
    */
    static wrapVars(componentObject) {
        if (!componentObject.vars) { return }
        let members = Object.getOwnPropertyNames(componentObject.vars)

        componentObject.vars.$varsStore = { ...componentObject.vars }
        for (let member of members) {

            if (`$varsStore` === member) { continue }
            Object.defineProperty(componentObject.vars, member, {
                get: function () {
                    return componentObject.vars.$varsStore[member]
                },
                set: function (newValue) {
                    const oldValue = componentObject.vars.$varsStore[member]

                    componentObject.vars.$varsStore[member] = newValue
                    ComponentLifecycle.replaceNodeValue(componentObject.ObjectFragment, componentObject.vars, member)
                    ComponentLifecycle.replaceAttributeValue(componentObject.ObjectFragment, componentObject.vars, member)
                    Queue.broadcast(ComponentLifecycle.msgs.VAR_VALUE_CHANGED, { componentObject, member, oldValue, newValue })
                }
            })

            ComponentLifecycle.replaceNodeValue(componentObject.ObjectFragment, componentObject.vars, member)
            ComponentLifecycle.replaceAttributeValue(componentObject.ObjectFragment, componentObject.vars, member)
        }
    }
    /**
     * Compiles the given HTML string into a DocumentFragment.
     * 
     * Parses the HTML using a DOMParser, then extracts the body children nodes
     * from the parsed document and appends them to a new DocumentFragment.
     * 
     * @param {string} html - The HTML string to compile
     * @returns {DocumentFragment} The compiled HTML fragment
     */
    static compile(html) {
        let fragment = document.createDocumentFragment()

        fragment.append(...new DOMParser().parseFromString(html, `text/html`).body.childNodes)
        return fragment
    }
    /**
     * Registers a DOM fragment for a component class. Stores the fragment, 
     * component ID, test, and sample scripts in a registry for later retrieval.
     * Validates the fragment structure before registration.
     */
    static registerDOMFragment(componentClass, componentObjectId, componentFragment, includeTest, includeSample) {
        if (!componentClass) {
            console.error(`registerDOMFragment: No component class provided for DOM fragment registration.`)
            return false
        }
        if (ComponentLifecycle.fragmentRegistry.has(componentClass)) {
            console.info(`registerDOMFragment: DOM Fragment ${componentClass} is already registered.`)
            return true
        }
        if (!componentObjectId) {
            console.error(`registerDOMFragment: No component object id provided for DOM fragment registration.`)
            return false
        }
        if (!componentFragment) {
            console.error(`registerDOMFragment: No DOM fragment provided for DOM fragment registration.`)
            return false
        }

        const scripts = componentFragment.querySelectorAll(`script`)
        const styles = componentFragment.querySelectorAll(`style`)
        const markup = componentFragment.querySelectorAll(`component-markup`)
        /**
         * Counts the number of non-test and non-sample component scripts.
         * 
         * Loops through the provided scripts array and increments a counter
         * for each script that does not have the data-is-test or data-is-sample
         * attribute.
         * 
         * @param {HTMLScriptElement[]} scripts - The array of script elements to check 
         * @returns {number} The number of component scripts
         */
        const getComponentScriptCount = (scripts) => {
            let count = 0

            if (scripts[0] && !scripts[0].hasAttribute(`data-is-test`) && !scripts[0].hasAttribute(`data-is-sample`)) { count++ }
            if (scripts[1] && !scripts[1].hasAttribute(`data-is-test`) && !scripts[1].hasAttribute(`data-is-sample`)) { count++ }
            if (scripts[2] && !scripts[2].hasAttribute(`data-is-test`) && !scripts[2].hasAttribute(`data-is-sample`)) { count++ }
            return count
        }

        if (0 === scripts.length) {
            console.error(`registerDOMFragment: Fragment must contain at least one component script tag. ${componentClass} ${componentObjectId}`)
            return false
        }
        if (3 < scripts.length) {
            console.error(`registerDOMFragment: Fragment can contain no more than three script tags, one for the component, one for the tests, and one for samples. ${componentClass} ${componentObjectId}`)
            return false
        }
        if (1 !== markup.length) {
            console.error(`registerDOMFragment: Fragment must contain one and only one component markup tag. ${componentClass}  ${componentObjectId}`)
            return false
        }
        if (1 < styles.length) {
            console.error(`registerDOMFragment: Fragment can contain no more than one component style tag. ${componentClass}  ${componentObjectId}`)
            return false
        }
        if (includeTest) {
            let testCount = 0

            for (let script of scripts) { if (script.hasAttribute(`data-is-test`)) { testCount++ } }
            if (1 < testCount) {
                console.error(`registerDOMFragment: Fragment can contain no more than one test script. ${componentClass}  ${componentObjectId}`)
                return false
            }
        }
        if (includeSample) {
            let sampleCount = 0

            for (let script of scripts) { if (script.hasAttribute(`data-is-sample`)) { sampleCount++ } }
            if (1 < sampleCount) {
                console.error(`registerDOMFragment: Fragment can contain no more than one sample script. ${componentClass}  ${componentObjectId}`)
                return false
            }
            if (1 !== sampleCount) {
                console.error(`registerDOMFragment: Fragment can contain no more than one sample script. ${componentClass}  ${componentObjectId}`)
                return false
            }
        }
        if (1 !== getComponentScriptCount(scripts)) {
            console.error(`registerDOMFragment: Fragment can contain no more than one component script. ${componentClass}  ${componentObjectId}`)
            return false
        }

        /**
         * Gets the component script from an array of scripts.
         * 
         * Loops through the array of scripts and returns the first one that is not
         * marked as a test or sample script using data attributes.
         * 
         * @param {HTMLScriptElement[]} scripts - Array of script elements to search.
         * @returns {HTMLScriptElement|null} The component script element, or null if none found.
         */
        const getComponentScript = (scripts) => {
            if (scripts[0] && !scripts[0].hasAttribute(`data-is-test`) && !scripts[0].hasAttribute(`data-is-sample`)) { return scripts[0] }
            if (scripts[1] && !scripts[1].hasAttribute(`data-is-test`) && !scripts[1].hasAttribute(`data-is-sample`)) { return scripts[1] }
            if (scripts[2] && !scripts[2].hasAttribute(`data-is-test`) && !scripts[1].hasAttribute(`data-is-sample`)) { return scripts[2] }
            return null
        }
        /**
         * Gets the test script from an array of scripts.
         * 
         * Loops through the array of scripts and returns the first one that is
         * marked as a test script using the data-is-test attribute.
         *  
         * @param {HTMLScriptElement[]} scripts - Array of script elements to search.
         * @returns {HTMLScriptElement|null} The test script element, or null if none found.
         */
        const getTestScript = (scripts) => {
            if (scripts[0] && scripts[0].hasAttribute(`data-is-test`)) { return scripts[0] }
            if (scripts[1] && scripts[1].hasAttribute(`data-is-test`)) { return scripts[1] }
            if (scripts[2] && scripts[2].hasAttribute(`data-is-test`)) { return scripts[2] }
            return null
        }
        /**
         * Gets the sample script from an array of scripts.
         * 
         * Loops through the array of scripts and returns the first one that is
         * marked as a sample script using the data-is-sample attribute.
         *
         * @param {HTMLScriptElement[]} scripts - Array of script elements to search.  
         * @returns {HTMLScriptElement|null} The sample script element, or null if none found.
         */
        const getSampleScript = (scripts) => {
            if (scripts[0] && scripts[0].hasAttribute(`data-is-sample`)) { return scripts[0] }
            if (scripts[1] && scripts[1].hasAttribute(`data-is-sample`)) { return scripts[1] }
            if (scripts[2] && scripts[2].hasAttribute(`data-is-sample`)) { return scripts[2] }
            return null
        }
        const componentScript = getComponentScript(scripts)
        const testScript = getTestScript(scripts)
        const sampleScript = getSampleScript(scripts)

        if (!componentScript) {
            console.error(`registerDOMFragment: Fragment must contain at least one component script tag. ${componentClass} ${componentObjectId}`)
            return false
        }

        const scriptTag = document.createElement(`script`)

        scriptTag.type = `text/javascript`
        scriptTag.id = `ScriptTag${componentClass}`

        componentScript.remove()
        try {
            eval(`new ${componentClass}`)
            scriptTag.appendChild(document.createTextNode(``))
        } catch (e) {
            scriptTag.appendChild(document.createTextNode(componentScript.innerText))
        }
        document.head.appendChild(scriptTag);

        if (styles.length && !document.getElementById(`StyleTag${componentClass}`)) {
            let styleTag = document.createElement(`style`)

            styleTag.id = `StyleTag${componentClass}`
            styleTag.appendChild(document.createTextNode(styles[0].innerText))
            styles[0].remove()
            document.head.appendChild(styleTag);
        }

        let test
        let sample

        if (testScript) {
            if (includeTest) {
                try {
                    const testText = testScript.innerText

                    test = new Function(testText)
                } catch (e) {
                    console.error(`registerDOMFragment: Error loading test script. ${componentClass}  ${componentObjectId} ${e}`)
                    return false
                }
            }
            testScript.remove()
        }
        if (sampleScript) {
            if (includeSample) {
                try {
                    const sampleText = sampleScript.innerText

                    sample = new Function(sampleText)
                } catch (e) {
                    console.error(`registerDOMFragment: Error loading sample script. ${componentClass}  ${componentObjectId} ${e}`)
                    return false
                }
            }
            sampleScript.remove()
        }
        ComponentLifecycle.saveOriginalNodeValues(componentFragment)
        ComponentLifecycle.saveOriginalNodeAttributes(componentFragment)
        ComponentLifecycle.fragmentRegistry.set(componentClass, { componentFragment, componentObjectId, test, sample })

        return true
    }
    /**
     * Unregisters a DOM fragment for the given component class. 
     * Removes any associated script and style tags from the document.
     * Deletes the component fragment from the registry.
     */
    static unregisterDOMFragment(componentClass) {
        if (!componentClass) {
            console.error(`unregisterDOMFragment: No component class provided for unregistration.`)
            return false
        }
        if (!ComponentLifecycle.fragmentRegistry?.has(componentClass)) {
            console.error(`unregisterDOMFragment: DOM Fragment ${componentClass} was not in registery.`)
            return false
        }
        let componentScriptTag = document.getElementById(`ScriptTag${componentClass}`)
        let componentStyleTag = document.getElementById(`StyleTag${componentClass}`)
        let componentTestTag = document.getElementById(`TestTag${componentClass}`)

        if (componentScriptTag) { componentScriptTag.remove() }
        if (componentStyleTag) { componentStyleTag.remove() }
        if (componentTestTag) { componentTestTag.remove() }
        ComponentLifecycle.fragmentRegistry.delete(componentClass)
        return true
    }
    /**
     * Adds getter properties to the componentObject for each element ID,
     * to allow easy access to element objects by ID.
     * 
     * @param {HTMLElement} element - The element to add getters for
     * @param {Object} componentObject - The component object to add the getters to
     */
    static addElementGettersToComponentObject = (element, componentObject) => {
        if (element.children) {
            for (let child of element.children) {
                ComponentLifecycle.addElementGettersToComponentObject(child, componentObject)
            }
        }
        if (!element.id || -1 !== element.tagName.indexOf(`-`)) { return }
        let getterName = element.id.replace(` `, `_`).replace(componentObject.id, ``).replace(`{id}`, ``)

        getterName += `Element`
        if (!componentObject.hasOwnProperty(getterName)) {
            Object.defineProperty(componentObject, getterName, {
                get: function () { return document.getElementById(element.id) },
                set: function (newValue) { console.error(`createComponentObject: Cannot set ${getterName}.`) }
            })
        }
    }
    /**
     * Adds convenience methods to the provided element to allow easy access 
     * to common operations like showing/hiding, checking visibility, getting the component,
     * destroying the component, removing children, adding/removing classes, etc.
     * 
     * Also adds the same convenience methods recursively to all child elements.
     */
    static addConvenienceMethodsToElement = (element) => {
        const show = () => { if (element.classList.contains(`display-none`)) { element.classList.remove(`display-none`) } }
        const hide = () => { if (!element.classList.contains(`display-none`)) { element.classList.add(`display-none`) } }
        const isVisible = () => { return !element.classList.contains(`display-none`) }
        const toggleVisibility = () => { if (element.isVisible()) { element.hide() } else { element.show() } }
        const hasComponent = () => { return Component.isObjectRegistered(element.id) }
        const getComponent = () => {
            if (!element.id || !Component.isObjectRegistered(element.id)) { return null }
            return Component.getObject(element.id)
        }
        const destroy = async () => {
            const component = element.getComponent()

            if (!component) { return }
            await component.destroy()
        }
        const destroyChildren = async () => {
            const destroyChildElements = async (element) => {
                if (!element.children) { return }
                for (let childElement of element.children) {
                    if (childElement.destroy) { await childElement.destroy() }
                    destroyChildElements(childElement)
                }
            }

            await destroyChildElements(element)
        }
        const removeChildren = () => { while (element.firstChild) { element.removeChild(element.firstChild) } }
        const addClass = (className) => { element.classList.add(className) }
        const removeClass = (className) => { element.classList.remove(className) }
        const toggleClass = (className) => { element.classList.toggle(className) }
        const replaceClass = (existingClassName, newClassName) => { element.classList.replace(existingClassName, newClassName) }
        const hasClass = (className) => { return element.classList.contains(className) }
        const hasFocus = () => { return element === document.activeElement }
        const getFocusedElement = () => { return document.activeElement }

        element.show = show
        element.hide = hide
        element.isVisible = isVisible
        element.toggleVisibility = toggleVisibility
        element.hasComponent = hasComponent
        element.getComponent = getComponent
        element.destroy = destroy
        element.destroyChildren = destroyChildren
        element.removeChildren = removeChildren
        element.addClass = addClass
        element.removeClass = removeClass
        element.toggleClass = toggleClass
        element.replaceClass = replaceClass
        element.hasClass = hasClass
        element.hasFocus = hasFocus
        element.getFocusedElement = getFocusedElement
        if (element.children) {
            for (let elementChild of element.children) {
                ComponentLifecycle.addConvenienceMethodsToElement(elementChild)
            }
        }
    }
    /**
     * Copies attributes from one element to another, excluding certain 
     * attribute names related to component state and configuration.
     *
     * @param {Element} includeElementSrc - The source element to copy attributes from
     * @param {Element} elementDest - The destination element to copy attributes to
     */
    static copyAttributes = (includeElementSrc, elementDest) => {
        for (let attributeLoop = 0; attributeLoop < includeElementSrc.attributes.length; attributeLoop++) {
            let attribute = includeElementSrc.attributes[attributeLoop]
            if (`data-src` === attribute.name) { continue }
            if (`data-id` === attribute.name) { continue }
            if (`data-props` === attribute.name) { continue }
            if (`data-vars` === attribute.name) { continue }
            if (`data-class` === attribute.name) { continue }
            if (`data-style` === attribute.name) { continue }
            if (`data-include` === attribute.name) { continue }
            if (`data-docs` === attribute.name) { continue }
            if (`data-enabled` === attribute.name) { continue }
            if (`data-visible` === attribute.name) { continue }
            if (`data-repeat` === attribute.name) { continue }

            let attributeValue = ``

            if (elementDest.hasAttribute(attribute.name)) { attributeValue = elementDest.getAttribute(attribute.name) }
            elementDest.setAttribute(attribute.name, attributeValue + attribute.value)
        }
    }
    /**
     * Sets event handlers on the given node and its children. 
     * Looks for event handler attributes like onClick, and replaces references to $obj with references to the component object instance.
     * This allows event handlers defined in the template to access the component instance via $obj.
     * 
     * @param {Node} node - The node to set event handlers on
     * @param {string} componentObjectId - The id of the component object instance  
     */
    static setEventHandlers = (node, componentObjectId) => {
        const events = [`onblur`, `onchange`, `oncontextmenu`, `onfocus`, `oninput`, `oninvalid`, `onreset`, `onsearch`, `onselect`, `onsubmit`, `onkeydown`, `onkeyup`, `onclick`,
            `ondblclick`, `onmousedown`, `onmousemove`, `onmouseout`, `onmouseover`, `onmouseup`, `onwheel`, `ondrag`, `ondragend`, `ondragenter`, `ondragleave`, `ondragover`,
            `ondragstart`, `ondrop`, `onscroll`, `oncopy`, `oncut`, `onpaste`, `onabort`, `oncanplay`, `oncanplaythrough`, `oncuechange`, `ondurationchange`, `onemptied`, `onended`,
            `onerror`, `onloadeddata`, `onloadedmetadata`, `onloadstart`, `onpause`, `onplay`, `onplaying`, `onprogress`, `onratechange`, `onseeked`, `onseeking`, `onstalled`,
            `onsuspend`, `ontimeupdate`, `onvolumechange`, `onwaiting`, `ontoggle`]
        const setEventHandler = (node, event) => {
            if (!node?.getAttribute) { return }
            let eventHandlerText = node.getAttribute(event)

            if (eventHandlerText && -1 !== eventHandlerText.indexOf(`$obj.`)) {
                eventHandlerText = eventHandlerText.replaceAll(`$obj.`, `Component.getObject('${componentObjectId}').`)
                node.setAttribute(event, eventHandlerText)
            }
            for (let nodeChild of node.children) {
                setEventHandler(nodeChild, event)
            }
        }

        for (let event of events) {
            setEventHandler(node, event)
        }
    }
    /**
     * Creates a new component object instance from the provided component class and initializes it.
     * 
     * Copies attributes from the original <include> tag to the component markup. 
     * Replaces $obj in event handlers with a reference to the component instance.
     * Adds getters for elements in the component markup to the component instance.
     * Adds convenience methods like getElementById() to element nodes.
     * Calls initialize() on the component instance if it exists.
     * Wraps the component's props and vars in getter/setters.
     * Replaces values in the markup with props and vars from the component instance.
     */
    static async createComponentObject(componentClass, componentObjectId, includeElement) {
        if (!componentClass) {
            console.error(`createComponentObject: No component class provided for createComponentObject.`)
            return false
        }
        if (!componentObjectId) {
            console.error(`createComponentObject: No component object id provided for createComponentObject.`)
            return false
        }
        if (!includeElement) {
            console.error(`createComponentObject: No includeComponentElement provided for createComponentObject.`)
            return false
        }

        const componentObject = eval(`new ${componentClass}()`)
        const markerIdBegin = `-ComponentBeginMarker${componentObjectId}`
        const markerIdEnd = `-ComponentEndMarker${componentObjectId}`
        const marker = document.getElementById(markerIdBegin)
        const template = ComponentLifecycle.fragmentRegistry.get(componentClass)?.componentFragment
        const test = ComponentLifecycle.fragmentRegistry.get(componentClass)?.test
        const sample = ComponentLifecycle.fragmentRegistry.get(componentClass)?.sample
        const fragment = template.cloneNode(true)
        const markup = fragment.querySelector(`component-markup`)

        if (!markup) {
            console.error(`registerComponentObject: Markup for ${componentObjectId} not found.`)
            return false
        }
        if (!marker) {
            const marker = document.createElement(`script`)

            marker.id = markerIdBegin
            marker.type = `text/javascript`
            // TODO: Do not replace child until repeat is done.
            includeElement.parentNode.replaceChild(marker, includeElement);
        }

        const htmlTag = markup.children[0]
        const propsAttribute = includeElement.getAttribute(`data-props`)
        const varsAttribute = includeElement.getAttribute(`data-vars`)
        const dataStyleAttributes = [].filter.call(includeElement.attributes, function (at) { return /^data-style/.test(at.name) })
        const dataClassAttributes = [].filter.call(includeElement.attributes, function (at) { return /^data-class/.test(at.name) })

        if (test) { componentObject.getTests = test }
        if (sample) { componentObject.getSamples = sample }
        ComponentLifecycle.objectFragmentRegistry.set(componentObjectId, fragment)
        if (propsAttribute) {
            const jsonText = `(` + DOMPurify.sanitize(propsAttribute) + `)`
            const propsObject = eval(jsonText)

            componentObject.props = { ...componentObject.props, ...propsObject }
        }
        if (varsAttribute) {
            const jsonText = `(` + DOMPurify.sanitize(varsAttribute) + `)`
            const varsObject = eval(jsonText)

            componentObject.vars = { ...componentObject.vars, ...varsObject }
        }
        Object.defineProperty(componentObject, `ObjectFragment`, {
            get: function () { return htmlTag },
            set: function (newValue) { console.error(`${componentObject.className()}.${componentObject.id}: Cannot set ObjectFragment.`) }
        })
        Object.defineProperty(componentObject, `dataStyleAttributes`, {
            get: function () { return dataStyleAttributes },
            set: function (newValue) { console.error(`${componentObject.className()}.${componentObject.id}: Cannot set dataStyleAttributes.`) }
        })
        Object.defineProperty(componentObject, `dataClassAttributes`, {
            get: function () { return dataClassAttributes },
            set: function (newValue) { console.error(`${componentObject.className()}.${componentObject.id}: Cannot set dataClassAttributes.`) }
        })

        if (componentObject.initialize) { await componentObject.initialize(componentObjectId) }

        const isDisabled = includeElement.hasAttribute(`disabled`)
        ComponentLifecycle.wrapProps(componentObject)
        ComponentLifecycle.wrapVars(componentObject)
        ComponentLifecycle.replaceNodeValue(markup, componentObject, `id`)
        ComponentLifecycle.replaceAttributeValue(markup, componentObject, `id`)
        componentObject.enabled = !isDisabled
        this.wrapObjectData(componentObject)

        if (componentObject.props) {
            let members = Object.getOwnPropertyNames(componentObject.props)

            for (let member of members) {
                ComponentLifecycle.replaceNodeValue(markup, componentObject.props, member)
                ComponentLifecycle.replaceAttributeValue(markup, componentObject.props, member)
            }
        }

        if (componentObject.vars) {
            let members = Object.getOwnPropertyNames(componentObject.vars)

            for (let member of members) {
                ComponentLifecycle.replaceNodeValue(markup, componentObject.vars, member)
                ComponentLifecycle.replaceAttributeValue(markup, componentObject.vars, member)
            }
        }

        for (let loop = markup.children.length - 1; loop >= 0; loop--) {
            const child = markup.children[loop]

            if (0 === loop) { ComponentLifecycle.copyAttributes(includeElement, child) }
            ComponentLifecycle.setEventHandlers(child, componentObjectId)
            ComponentLifecycle.addElementGettersToComponentObject(child, componentObject)
            ComponentLifecycle.addConvenienceMethodsToElement(child)
        }
        return componentObject
    }
    /**
     * Registers a component object instance with the component lifecycle manager.
     * 
     * @param {Function} componentClass - The component class.
     * @param {string} componentObjectId - The unique ID for the component instance. 
     * @param {Object} componentObject - The component object instance.
     * @returns {boolean} - True if registered successfully, false otherwise.
     */
    static registerComponentObject(componentClass, componentObjectId, componentObject) {
        if (!componentObjectId) {
            console.error(`registerComponentObject: No component object id provided for component object registration.`)
            return false
        }
        if (!componentObject) {
            console.error(`registerComponentObject: No component object provided for component object registration.`)
            return false
        }
        if (!componentClass) {
            console.error(`registerComponentObject: No fragment id provided for component object registration.`)
            return false
        }
        if (ComponentLifecycle.objectRegistry.has(componentObjectId)) {
            console.error(`registerComponentObject: Component object ${componentObjectId} is already registered.`)
            return false
        }

        ComponentLifecycle.objectRegistry.set(componentObjectId, { componentObject, componentClass })
        return true
    }
    /**
     * Unregisters a component object instance from the component lifecycle manager.
     *
     * @param {string} componentObjectID - The unique ID of the component instance to unregister.
     * @returns {boolean} - True if unregistered successfully, false otherwise.
     */
    static unregisterComponentObject(componentObjectID) {
        if (!componentObjectID) {
            console.error(`unregisterComponentObject: No component object id provided for registration.`)
            return false
        }
        if (!ComponentLifecycle.objectRegistry.has(componentObjectID)) {
            console.warn(`unregisterComponentObject: Component object ${componentObjectID} was not in registery.`)
            return false
        }
        if (ComponentLifecycle.objectRegistry.get(componentObjectID).mounted) {
            console.error(`unregisterComponentObject: Cannot unregister a mounted component, ${componentObjectID}.`)
            return false
        }
        while (ComponentLifecycle.objectRegistry.has(componentObjectID)) { ComponentLifecycle.objectRegistry.delete(componentObjectID) }
        while (ComponentLifecycle.objectFragmentRegistry.has(componentObjectID)) { ComponentLifecycle.objectFragmentRegistry.delete(componentObjectID) }
        return true
    }
    /**
     * Mounts the component object instance into the DOM. 
     * 
     * Checks that the component object instance and related registries are valid.
     * Calls beforeMount on the component if provided. 
     * Inserts the component's DOM elements before the marker element.
     * Sets the mounted flag to true on the component object info.
     * Calls afterMount on the component if provided.
     * 
     * @param {string} componentObjectId - The unique ID of the component instance to mount.
     * @returns {boolean} - True if mounted successfully, false otherwise.
     */
    static async mount(componentObjectId) {
        if (!componentObjectId) {
            console.error(`mount: No component object id provided for mount.`)
            return false
        }
        if (!ComponentLifecycle.objectRegistry?.has(componentObjectId)) {
            console.error(`mount: Component object ${componentObjectId} was not in registery.`)
            return false
        }

        let componentObjectInfo = ComponentLifecycle.objectRegistry.get(componentObjectId)
        let fragment = ComponentLifecycle.objectFragmentRegistry.get(componentObjectId)
        let customComponentElement = fragment.querySelector(`custom-component`)
        let componentMarkupElement = customComponentElement?.querySelector(`component-markup`)
        let markerId = `-ComponentBeginMarker${componentObjectId}`
        let marker = document.getElementById(markerId)

        if (!fragment) {
            console.error(`mount: DOM fragment ${componentObjectInfo.componentClass} is not in registery.`)
            return false
        }
        if (!customComponentElement) {
            console.error(`mount: Custom component element for ${componentObjectInfo.componentClass} was not provided.`)
            return false
        }
        if (!componentMarkupElement) {
            console.error(`mount: Component markup element for ${componentObjectInfo.componentClass} was not provided.`)
            return false
        }
        if (!componentObjectInfo.componentObject) {
            console.error(`mount: Component object ${componentObjectId} is not in registery.`)
            return false
        }
        if (componentObjectInfo.mounted) {
            console.error(`mount: Component object ${componentObjectId} is already mounted.`)
            return false
        }
        if (!marker) {
            console.error(`mount: Marker for ${componentObjectId} is not in DOM.`)
            return false
        }

        if (componentObjectInfo.componentObject.beforeMount) { await componentObjectInfo.componentObject.beforeMount() }

        for (let loop = 0; loop < componentMarkupElement.children.length; loop++) {
            const child = componentMarkupElement.children[loop]

            if (0 === loop) { child.setAttribute(`data-component`, markerId) }
            marker.after(child)
        }
        marker.remove()

        componentObjectInfo.componentObject.mounted = true
        ComponentLifecycle.objectRegistry.set(componentObjectId, componentObjectInfo)
        try {
            if (componentObjectInfo.componentObject.afterMount) { await componentObjectInfo.componentObject.afterMount() }
        } catch (e) {
            console.error(`mount: Exception thrown when calling afterMount for ${componentObjectId}. ${e}`)
        }
        return true
    }
    /**
     * Unmounts a component object by id. 
     * 
     * Removes the component's DOM elements and updates the component's state.
     * Calls the component's beforeUnmount and afterUnmount lifecycle methods if defined.
     * 
     * @param {string} componentObjectId - The id of the component object to unmount.
     * @returns {boolean} - True if the component was successfully unmounted.
     */
    static async unmount(componentObjectId) {
        if (!componentObjectId) {
            console.error(`Unmount: No component object id provided for mount.`)
            return false
        }
        if (!ComponentLifecycle.objectRegistry?.has(componentObjectId)) {
            console.error(`Unmount: Component object ${componentObjectId} is not in registery.`)
            return false
        }

        let componentObjectInfo = ComponentLifecycle.objectRegistry?.get(componentObjectId)

        if (!componentObjectInfo?.componentObject) {
            console.error(`Unmount: Component object ${componentObjectId} is not in registery.`)
            return false
        }
        if (!componentObjectInfo.componentObject.mounted) {
            console.error(`Unmount: Component object ${componentObjectId} was not mounted.`)
            return false
        }

        let fragment = ComponentLifecycle.objectFragmentRegistry.get(componentObjectId)
        let markerId = `-ComponentBeginMarker${componentObjectId}`
        let marker = document.querySelectorAll(`[data-component="${markerId}"]`)

        if (!fragment) {
            console.warn(`Unmount: Fragment ${componentObjectInfo.componentClass} is not in registery.`)
            return false
        }
        if (!marker || 0 === marker.length) {
            console.warn(`Unmount: Marker for ${componentObjectId}, ${markerId}, not in DOM.`)
            return false
        }

        if (componentObjectInfo.componentObject.beforeUnmount) { await componentObjectInfo.componentObject.beforeUnmount() }
        marker[0].remove()
        componentObjectInfo.componentObject.mounted = false
        ComponentLifecycle.objectRegistry.set(componentObjectId, componentObjectInfo)
        if (componentObjectInfo.componentObject.afterUnmount) { await componentObjectInfo.componentObject.afterUnmount() }
        return true
    }
    /**
     * Destroys a component object instance by id.
     * 
     * Removes the component's DOM elements, deregisters event listeners, 
     * calls lifecycle hooks, and removes it from registries.
     * 
     * @param {string} componentObjectId - The id of the component instance to destroy.
     */
    static async destroyComponentObject(componentObjectId) {
        const markerId = `-ComponentBeginMarker${componentObjectId}`
        const marker = document.querySelectorAll(`[data-component="${markerId}"]`)
        const component = Component.getObject(componentObjectId)
        const childComponents = component.childComponents

        await Queue.broadcast(Component.msgs.BEFORE_DESTRUCTION, component)
        if (childComponents && 0 !== childComponents.length) {
            for (let childComponent of childComponents) {
                if (!childComponent) { continue }
                await ComponentLifecycle.destroyComponentObject(childComponent.id)
            }
        }

        if (component && component.isMounted()) { await ComponentLifecycle.unmount(componentObjectId) }
        try {
            const unregisterComponentObjectResult = ComponentLifecycle.unregisterComponentObject(componentObjectId)

            if (!unregisterComponentObjectResult) {
                console.error(`ComponentLifecycle.destroyComponentObject: Failed to unregister component object.`)
                return
            }
        } catch (e) {
            console.error(`ComponentLifecycle.destroyComponentObject: Failed to unregister component object. Error is ${e}`)
        }
        Queue.unregisterAllForListener(component)
        await component.unwait()
        try {
            if (marker && 0 < marker.length) { marker[0].remove() }
        } catch (e) {
            console.warn(`ComponentLifecycle.destroyComponentObject: Failed to remove marker. MarkerId is ${markerId}. Error is ${e}`)
        }
        try {
            component.Element?.remove()
        } catch (e) {
            console.warn(`ComponentLifecycle.destroyComponentObject: Failed to remove component from document. Id is ${component.id}. Error is ${e}`)
        }
        await Queue.broadcast(Component.msgs.AFTER_DESTRUCTION, component)
    }
}