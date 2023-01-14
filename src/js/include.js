class TreeNode {
    constructor(name) {
        this.name = name
        this.children = []
        this.parent = null
    }
    addChild(child) {
        let childNode = new TreeNode(child)
        childNode.parent = this
        this.children.push(childNode)
        return childNode
    }
    hasChild(name) {
        let node = this.getChildByName(name)
        return (null !== node) 
    }
    getChildByName(name) {
        for (let node of this.children) {
            if (node.name === name) { return node }
        }
        return null
    }
    hasAncestor(ancestorName) {
        let node = this.getAncestor(ancestorName)
        return (null !== node)
    }
    getAncestor(ancestorName) {
        if (!this.parent) {return null}
        if (this.parent.name === ancestorName) {return this.parent}
        return this.parent.getAncestor(ancestorName)
    }
    hasDescendant(descendantName) {
        let node = this.getDescendant(descendantName)
        return (null !== node)
    }
    getDescendant(descendantName) {
        for (let node of this.children) {
            if (node.name === descendantName) { return node }
            let descendant = node.getDescendant(descendantName)
            if (descendant) { return descendant }
        }
        return null
    }
    toString(prefix) {
        let cleanPrefix = (prefix)? prefix : ``
        let result = `${cleanPrefix}${this.name} (parent: ${this.parent?.name})\n`
        cleanPrefix += `\t`
        for (let node of this.children) {
            result += node.toString(cleanPrefix)
        }
        return result
    }
}
class Tree {
    constructor() {
        this.nodes = []
    }
    addNode(node) {
        if (this.hasNode(node.name)) { return }
        this.nodes.push(node)
    }
    hasNode(name) {
        let node = this.getNodeByName(name)
        return (null !== node) 
    }
    getNodeByName(name) {
        for (let node of this.nodes) {
            if (node.name === name) { return node }
            let descendant = node.getDescendant(name)
            if (descendant) { return descendant }
        }
        return null
    }
    toString(prefix) {
        let result = ``
        for (let node of this.nodes) {
            result += node.toString(prefix)
        }
        return result
    }
}

/*
    FRAGRMENT STATE             FRAGMENT STATE                      NOTES
    (Transitions flow down)     (Transitions flow left/right)
    -------------------------   ----------------------------------  ---------------------------------------------------------
    Compile                                                         Creates document fragment from text.
    Register Dom Fragment       <--> Unregister Dom Fragment        Document fragment put in registry, script tags moved to <HEAD>.

    COMPONENT STATE             COMPONENT STATE                     NOTES
    (Transitions flow down)     (Transitions flow left/right)
    -------------------------   ----------------------------------  ---------------------------------------------------------
    Create Component Object                                         Object instantiated from the class representing the component.
                                                                    Object initialized. Vars and props are wrapped. Node values and
                                                                    attribute values are replaced for the first time.
    Register Component Object   <--> Unregister Component Object    Object placed in registery. Has a unique ID and knows the id
                                                                    of its associated fragment.
    mount                       <--> unmount                        Component placed in DOM, rendered to screen.
    update                                                          Set vars to replace node and attribute values.
    destroy                                                         The object is unmounted, unregistereed, and it's marker is removed
                                                                    from the DOM.
*/
class ComponentLifecycle {
    static initialize() {
        window.$components = undefined
    }
    static saveOriginalNodeValues = (node) => {
        if (node.nodeValue) {
            if (!node.originalNodeValue) { node.originalNodeValue = node.nodeValue }
        }
        for (let child of node.childNodes) {
            ComponentLifecycle.saveOriginalNodeValues(child)
        }
    }
    static saveOriginalNodeAttributes = (node) => {
        if (node.attributes) {
            for (const attr of node.attributes) {
                if (!attr.originalAttributeValue) { attr.originalAttributeValue = attr.value }
            }
        }
        for (let child of node.childNodes) {
            ComponentLifecycle.saveOriginalNodeAttributes(child)
        }
    }
    static copyOriginalNodeValues = (srcNode, destNode) => {
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
    static copyOriginalNodeAttributes = (srcNode, destNode) => {
        if (srcNode.attributes) {
            for (let loop = 0; loop < srcNode.attributes.length; loop++) {
                let srcAttribute = srcNode.attributes[loop]
                let destAttribute = destNode.attributes[loop]

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
    static replaceNodeValue = (node, data, member) => {
        if (node.nodeValue) {
            if (!node.originalNodeValue) { node.originalNodeValue = node.nodeValue }

            const formattedMember = `{${member}}`

            const originalMatches = -1 !== node.originalNodeValue.indexOf(formattedMember)
            const matches = -1 !== node.nodeValue.indexOf(formattedMember)
            if (originalMatches || matches) {
                // TODO: Thoroughly test this with multiple replacements in a single node value.
                let value = (matches)? node.nodeValue : node.originalNodeValue
                try {
                    let memberData = data[member].toString()
                
                    node.nodeValue = value.replaceAll(formattedMember, memberData)
                } catch (e) {
                    console.warn(`Unable to replace node value containing ${member}. It's replacement value is ${data[member]}.`)
                }
            }
        }
        for (let child of node.childNodes) {
            ComponentLifecycle.replaceNodeValue(child, data, member)
        }
    }
    static replaceAttributeValue = (node, data, member) => {
        if (node.attributes) {
            for (const attr of node.attributes) {
                if (!attr.originalAttributeValue) { attr.originalAttributeValue = attr.value }
                const originalMatches = -1 !== attr.originalAttributeValue.indexOf(`{${member}}`)
                const matches = -1 !== attr.value.indexOf(`{${member}}`)
                let value = (matches)? attr.value : attr.originalAttributeValue

                if (originalMatches || matches) {
                    // TODO: Thoroughly test this with multiple replacements in a single attribute value.
                    try {
                        let memberData = data[member].toString()
                    
                        attr.value = value.replaceAll(`{${member}}`, memberData)
                    } catch (e) {
                        console.warn(`Unable to replace attribute containing ${member}. It's replacement value is ${data[member]}.`)
                    }
                }
            }
        }
        for (let child of node.childNodes) {
            ComponentLifecycle.replaceAttributeValue(child, data, member)
        }
    }
    static wrapProps = (componentFragment, componentObject) => {
        if (!componentObject.props) {return}
        let members = Object.getOwnPropertyNames(componentObject.props)

        componentObject.props.$propsStore = {...componentObject.props}
        for (let member of members) {
            if (`$propsStore` === member) { continue }
            Object.defineProperty(componentObject.props, member, {
                get: function() {
                    return componentObject.props.$propsStore[member]
                },
                set: function(newValue) {
                }
            })
            ComponentLifecycle.replaceNodeValue(componentFragment, componentObject.props, member)
            ComponentLifecycle.replaceAttributeValue(componentFragment, componentObject.props, member)
        }
    }
    static wrapVars = (componentFragment, componentObject) => {
        if (!componentObject.vars) {return}
        let members = Object.getOwnPropertyNames(componentObject.vars)

        componentObject.vars.$varsStore = {...componentObject.vars}
        for (let member of members) {
            if (`$varsStore` === member) { continue }
            Object.defineProperty(componentObject.vars, member, {
                get: function() {
                    return componentObject.vars.$varsStore[member]
                },
                set: function(newValue) {
                    const oldValue = componentObject.vars.$varsStore[member]

                    componentObject.vars.$varsStore[member] = newValue
                    ComponentLifecycle.replaceNodeValue(componentFragment, componentObject.vars, member)
                    ComponentLifecycle.replaceAttributeValue(componentFragment, componentObject.vars, member)
                    Queue.broadcast(Messages.VALUE_CHANGED, { componentObject, member, oldValue, newValue})
                }
            })
            ComponentLifecycle.replaceNodeValue(componentFragment, componentObject.vars, member)
            ComponentLifecycle.replaceAttributeValue(componentFragment, componentObject.vars, member)
        }
    }
    static compile = (html) => {
        let fragment = document.createDocumentFragment()

        fragment.append(...new DOMParser().parseFromString(html, `text/html`).body.childNodes)
        return fragment
    }
    static registerDOMFragment = (componentClass, componentFragment, includeTest) => {
        if (!componentClass) { 
            console.error(`registerDOMFragment: No component class provided for DOM fragment registration.`)
            return false 
        }
        if (!componentFragment) { 
            console.error(`registerDOMFragment: No DOM fragment provided for DOM fragment registration.`)
            return false 
        }
        if (window?.$components?.fragmentRegistry?.has(componentClass)) { 
            console.info(`registerDOMFragment: DOM Fragment ${componentClass} is already registered.`)
            return true 
        }

        let scripts = componentFragment.querySelectorAll('script')
        let tests = componentFragment.querySelectorAll('test-script')
        let styles = componentFragment.querySelectorAll('style')
        let markup = componentFragment.querySelectorAll('component-markup')

        if (0 === scripts.length) {
            console.error(`registerDOMFragment: Fragment must contain at least one component script tag.`)
            return false
        }
        if (1 !== markup.length) {
            console.error(`registerDOMFragment: Fragment must contain one and only one component markup tag.`)
            return false
        }
        if (1 < styles.length) {
            console.error(`registerDOMFragment: Fragment can contain no more than one component style tag.`)
            return false
        }
        if (includeTest) {
            if (1 < tests.length) {
                console.error(`registerDOMFragment: Fragment can contain no more than one component test tag.`)
                return false
            }   
        }
        let scriptTag = document.createElement('script')

        scriptTag.type = 'text/javascript'
        scriptTag.id = `ScriptTag${componentClass}`
        scripts[0].remove()
        try {
            eval(`new ${componentClass}`)
            scriptTag.appendChild(document.createTextNode(``))
        } catch (e) {
            scriptTag.appendChild(document.createTextNode(scripts[0].innerText))
        }
        document.head.appendChild(scriptTag);

        if (styles.length) {
            let styleTag = document.createElement('style')

            styleTag.id = `StyleTag${componentClass}`
            styleTag.appendChild(document.createTextNode(styles[0].innerText))
            styles[0].remove()
            document.head.appendChild(styleTag);
        }
        if (tests.length) {
            if (includeTest) {
                let tests = componentFragment.querySelectorAll('test-script')
                let testTag = document.createElement('test-script')

                testTag.type = 'text/javascript'
                testTag.id = `TestTag${componentClass}`
                testTag.appendChild(document.createTextNode(tests[0].innerText))
                document.head.appendChild(testTag);
            }
            tests[0].remove()
        }
        if (!window.$components) { window.$components = {} }
        if (!window.$components.fragmentRegistry) { window.$components.fragmentRegistry = new Map() }
        ComponentLifecycle.saveOriginalNodeValues(componentFragment)
        ComponentLifecycle.saveOriginalNodeAttributes(componentFragment)
        window.$components.fragmentRegistry.set(componentClass, componentFragment)

        return true
    }
    static unregisterDOMFragment = (componentClass) => {
        if (!componentClass) { 
            console.error(`unregisterDOMFragment: No component class provided for unregistration.`)
            return false 
        }
        if (!window?.$components?.fragmentRegistry?.has(componentClass)) { 
            console.error(`unregisterDOMFragment: DOM Fragment ${componentClass} was not in registery.`)
            return false 
        }
        let componentScriptTag = document.getElementById(`ScriptTag${componentClass}`)
        let componentStyleTag = document.getElementById(`StyleTag${componentClass}`)
        let componentTestTag = document.getElementById(`TestTag${componentClass}`)
        
        if (componentScriptTag) { componentScriptTag.remove() }
        if (componentStyleTag) { componentStyleTag.remove() }
        if (componentTestTag) { componentTestTag.remove() }
        window.$components.fragmentRegistry.delete(componentClass)
        return true
    }
    static createComponentObject = (componentClass, componentObjectId, includeElement) => {
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

        let componentObject = eval(` new ${componentClass}()`)
        let markerId = `-VanillaComponentBeginMarker${componentObjectId}`
        let marker = document.getElementById(markerId)
        let componentFragment =  window.$components.fragmentRegistry.get(componentClass)

        if (!marker) {
            let marker = document.createElement('script')

            marker.id = markerId
            marker.type = 'text/javascript'
            // TODO: Do not replace child until repeat is done.
            includeElement.parentNode.replaceChild(marker, includeElement);
        }

        let propsElements = includeElement.getElementsByTagName('include-props')
        let varsElements = includeElement.getElementsByTagName('include-vars')

        if (propsElements.length) {
            if (1 < propsElements.length) { 
                console.error(`createComponentObject: Only one include-props tag is allowed.`)
                return false 
            }
            
            let jsonText = `(` + DOMPurify.sanitize(propsElements[0].innerText) + `)`
            let propsObject = eval(jsonText)

            componentObject.props = {...componentObject.props, ...propsObject}
        }
        if (varsElements.length) {
            if (1 < varsElements.length) { 
                console.error(`createComponentObject: Only one include-vars tag is allowed.`)
                return false 
            }

            let jsonText = `(` + DOMPurify.sanitize(varsElements[0].innerText) + `)`
            let varsObject = eval(jsonText)

            componentObject.vars = {...componentObject.vars, ...varsObject}
        }
        if (componentObject.initialize) { componentObject.initialize(componentObjectId) }

        ComponentLifecycle.replaceNodeValue(componentFragment, componentObject, `id`)
        ComponentLifecycle.replaceAttributeValue(componentFragment, componentObject, `id`)

        if (componentObject.props) {
            let members = Object.getOwnPropertyNames(componentObject.props)

            for (let member of members) {
                ComponentLifecycle.replaceNodeValue(componentFragment, componentObject.props, member)
                ComponentLifecycle.replaceAttributeValue(componentFragment, componentObject.props, member)
            }
        }

        if (componentObject.vars) {
            let members = Object.getOwnPropertyNames(componentObject.vars)

            for (let member of members) {
                ComponentLifecycle.replaceNodeValue(componentFragment, componentObject.vars, member)
                ComponentLifecycle.replaceAttributeValue(componentFragment, componentObject.vars, member)
            }
        }
        return componentObject
    }
    static registerComponentObject = (componentClass, componentObjectId, componentObject, includeElement) => {
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
        if (!includeElement) { 
            console.error(`registerComponentObject: No include element provided for component object registration.`)
            return false 
        }
        if (window?.$components?.objectRegistry?.has(componentObjectId)) { 
            console.error(`registerComponentObject: Component object ${componentObjectId} is already registered.`)
            return false 
        }

        let componentDOM = []
        let fragment = window.$components.fragmentRegistry.get(componentClass)
        let markup = fragment.querySelector(`component-markup`)
        let clonedFragment = fragment.cloneNode(true)
        let clonedMarkup = clonedFragment.querySelector(`component-markup`)

        if (!clonedMarkup) { 
            console.error(`registerComponentObject: Markup for ${componentObjectId} not found.`)
            return false 
        }

        if (!window.$components) { window.$components = {} }
        if (!window.$components.objectRegistry) { window.$components.objectRegistry = new Map() }
        for (let loop = clonedMarkup.children.length - 1; loop >= 0; loop--) {
            let originalChild = markup.children[loop]
            let clonedChild = clonedMarkup.children[loop]
            const setEventHandler = (node, event) => {
                let eventHandlerText = node.getAttribute(event)

                if (eventHandlerText && -1 !== eventHandlerText.indexOf(`$obj.`)) {
                    eventHandlerText = eventHandlerText.replaceAll(`$obj.`, `Component.getObject('${componentObjectId}').`)
                    node.setAttribute(event, eventHandlerText)
                }
                for (const nodeChild of node.children) {
                    setEventHandler(nodeChild, event)
                }
            }
            const copyAttributes = (includeElementSrc, clonedChildDest) => {
                for (let attributeLoop = 0; attributeLoop < includeElementSrc.attributes.length; attributeLoop++) {
                    const attribute = includeElementSrc.attributes[attributeLoop]
                    if (`include-in` === attribute.name) { continue }
                    if (`src` === attribute.name) { continue }
                    if (`component-class` === attribute.name) { continue }
                    if (`component-id` === attribute.name) { continue }
                    if (`repeat` === attribute.name) { continue }

                    const attributeValue = ``

                    if (clonedChildDest.hasAttribute(attribute.name)) { attributeValue = clonedChildDest.getAttribute(attribute.name) }
                    clonedChildDest.setAttribute(attribute.name, attributeValue + attribute.value)
                }
            }
            if (0 === loop) { copyAttributes(includeElement, clonedChild) }

            componentDOM.push(clonedChild)
            setEventHandler(clonedChild, `onblur`)
            setEventHandler(clonedChild, `onchange`)
            setEventHandler(clonedChild, `oncontextmenu`)
            setEventHandler(clonedChild, `onfocus`)
            setEventHandler(clonedChild, `oninput`)
            setEventHandler(clonedChild, `oninvalid`)
            setEventHandler(clonedChild, `onreset`)
            setEventHandler(clonedChild, `onsearch`)
            setEventHandler(clonedChild, `onselect`)
            setEventHandler(clonedChild, `onsubmit`)
            setEventHandler(clonedChild, `onkeydown`)
            setEventHandler(clonedChild, `onkeyup`)
            setEventHandler(clonedChild, `onclick`)
            setEventHandler(clonedChild, `ondblclick`)
            setEventHandler(clonedChild, `onmousedown`)
            setEventHandler(clonedChild, `onmousemove`)
            setEventHandler(clonedChild, `onmouseout`)
            setEventHandler(clonedChild, `onmouseover`)
            setEventHandler(clonedChild, `onmouseup`)
            setEventHandler(clonedChild, `onwheel`)
            setEventHandler(clonedChild, `ondrag`)
            setEventHandler(clonedChild, `ondragend`)
            setEventHandler(clonedChild, `ondragenter`)
            setEventHandler(clonedChild, `ondragleave`)
            setEventHandler(clonedChild, `ondragover`)
            setEventHandler(clonedChild, `ondragstart`)
            setEventHandler(clonedChild, `ondrop`)
            setEventHandler(clonedChild, `onscroll`)
            setEventHandler(clonedChild, `oncopy`)
            setEventHandler(clonedChild, `oncut`)
            setEventHandler(clonedChild, `onpaste`)
            setEventHandler(clonedChild, `onabort`)
            setEventHandler(clonedChild, `oncanplay`)
            setEventHandler(clonedChild, `oncanplaythrough`)
            setEventHandler(clonedChild, `oncuechange`)
            setEventHandler(clonedChild, `ondurationchange`)
            setEventHandler(clonedChild, `onemptied`)
            setEventHandler(clonedChild, `onended`)
            setEventHandler(clonedChild, `onerror`)
            setEventHandler(clonedChild, `onloadeddata`)
            setEventHandler(clonedChild, `onloadedmetadata`)
            setEventHandler(clonedChild, `onloadstart`)
            setEventHandler(clonedChild, `onpause`)
            setEventHandler(clonedChild, `onplay`)
            setEventHandler(clonedChild, `onplaying`)
            setEventHandler(clonedChild, `onprogress`)
            setEventHandler(clonedChild, `onratechange`)
            setEventHandler(clonedChild, `onseeked`)
            setEventHandler(clonedChild, `onseeking`)
            setEventHandler(clonedChild, `onstalled`)
            setEventHandler(clonedChild, `onsuspend`)
            setEventHandler(clonedChild, `ontimeupdate`)
            setEventHandler(clonedChild, `onvolumechange`)
            setEventHandler(clonedChild, `onwaiting`)
            setEventHandler(clonedChild, `ontoggle`)
            ComponentLifecycle.copyOriginalNodeValues(originalChild, clonedChild)
            ComponentLifecycle.copyOriginalNodeAttributes(originalChild, clonedChild)
        }

        for (let node of componentDOM) {
            ComponentLifecycle.wrapVars(node, componentObject)
            ComponentLifecycle.wrapProps(node, componentObject)
        }

        window.$components.objectRegistry.set(componentObjectId, {componentObject: componentObject, componentClass, componentDOM, mounted: false})
        return true
    }
    static unregisterComponentObject = (componentObjectID) => {
        if (!componentObjectID) { 
            console.error(`unregisterComponentObject: No component object id provided for registration.`)
            return false 
        }
        if (!window?.$components?.objectRegistry?.has(componentObjectID)) { 
            console.error(`unregisterComponentObject: Component object ${componentObjectID} was not in registery.`)
            return false 
        }
        if (window.$components.objectRegistry.get(componentObjectID).mounted) { 
            console.error(`unregisterComponentObject: Cannot unregister a mounted component, ${componentObjectID}.`)
            return false 
        }
        window.$components.objectRegistry.delete(componentObjectID)
        return true
    }
    static mount = (componentObjectId) => {
        if (!componentObjectId) { 
            console.error(`unregisterComponentObject: No component object id provided for mount.`)
            return false 
        }
        if (!window?.$components?.objectRegistry?.has(componentObjectId)) { 
            console.error(`unregisterComponentObject: Component object ${componentObjectId} was not in registery.`)
            return false 
        }

        let componentObjectInfo = window.$components.objectRegistry.get(componentObjectId)
        let fragment = window.$components.fragmentRegistry.get(componentObjectInfo.componentClass)
        let markerId = `-VanillaComponentBeginMarker${componentObjectId}`
        let marker = document.getElementById(markerId)

        if (!fragment) { 
            console.error(`unregisterComponentObject: DOM fragment ${componentObjectInfo.componentClass} is not in registery.`)
            return false 
        }
        if (!componentObjectInfo.componentObject) { 
            console.error(`unregisterComponentObject: Component object ${componentObjectId} is not in registery.`)
            return false 
        }
        if (componentObjectInfo.mounted) { 
            console.error(`unregisterComponentObject: Component object ${componentObjectId} is already mounted.`)
            return false 
        }
        if (!marker) { 
            console.error(`UnregisterComponentObject: Marker for ${componentObjectId} is not in DOM.`)
            return false 
        }
        if (componentObjectInfo.componentObject.beforeMount) { componentObjectInfo.componentObject.beforeMount() }

        for (let child of componentObjectInfo.componentDOM) {
            marker.after(child)
        }

        componentObjectInfo.mounted = true
        window.$components.objectRegistry.set(componentObjectId, componentObjectInfo)
        if (componentObjectInfo.componentObject.afterMount) { componentObjectInfo.componentObject.afterMount() }
        return true
    }
    static unmount = (componentObjectId) => {
        if (!componentObjectId) { 
            console.error(`Unmount: No component object id provided for mount.`)
            return false 
        }
        if (!window?.$components?.objectRegistry?.has(componentObjectId)) { 
            console.error(`Unmount: Component object ${componentObjectId} is not in registery.`)
            return false 
        }

        let componentObjectInfo = window?.$components?.objectRegistry?.get(componentObjectId)

        if (!componentObjectInfo?.componentObject) { 
            console.error(`Unmount: Component object ${componentObjectId} is not in registery.`)
            return false 
        }
        if (!componentObjectInfo.mounted) { 
            console.error(`Unmount: Component object ${componentObjectId} was not mounted.`)
            return false 
        }

        let fragment = window.$components.fragmentRegistry.get(componentObjectInfo.componentClass)
        let markerId = `-VanillaComponentBeginMarker${componentObjectId}`
        let marker = document.getElementById(markerId)
        let markup = fragment.querySelector(`component-markup`)

        if (!fragment) { 
            console.error(`Unmount: Fragment ${componentObjectInfo.componentClass} is not in registery.`)
            return false 
        }
        if (!marker) { 
            console.error(`Unmount: Marker for ${componentObjectId}, ${markerId}, not in DOM.`)
            return false 
        }
        if (!markup) { 
            console.error(`Unmount: Markup for ${componentObjectId} not found.`)
            return false 
        }

        if (componentObjectInfo.componentObject.beforeMount) { componentObjectInfo.componentObject.beforeUnmount() }        
        for (let loop = markup.children.length - 1; loop >= 0; loop--) {
            marker.nextSibling.remove()
        }
        componentObjectInfo.mounted = false
        window.$components.objectRegistry.set(componentObjectId, componentObjectInfo)
        if (componentObjectInfo.componentObject.afterMount) { componentObjectInfo.componentObject.afterUnmount() }
        return true
    }
    static destroyComponentObject(componentObjectId) {
        let markerId = `-VanillaComponentBeginMarker${componentObjectId}`
        let marker = document.getElementById(markerId)
        let component = Component.getObject(componentObjectId)

        if (component && component.isMounted()) { ComponentLifecycle.unmount(componentObjectId) }
        ComponentLifecycle.unregisterComponentObject(componentObjectId)
        if (marker) { marker.remove() }
    }
}

class JavascriptWebToken {
    static credentials = ``
    static getCredentials(callback) {
        if (!JavascriptWebToken.credentials || 0 === JavascriptWebToken.credentials.length) {callback(`Credentials not set.`, null)}
        else { callback(null, JavascriptWebToken.credentials) }
    }
    static storeCredentials(token) {
        JavascriptWebToken.credentials = token
    }
    static parseJWT (token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }
    static deleteTokenDatabase() {
        JavascriptWebToken.credentials = null
    }
}

class Component {
    static getFragment = (componentClass) => {
        if (!componentClass) { 
            console.error(`getFragment: No component fragment id provided.`)
            return null 
        }
        if (!window?.$components?.fragmentRegistry?.has(componentClass)) { 
            console.error(`getFragment: Component fragment ${componentClass} is not registered.`)
            return null 
        }
        
        let fragment = window.$components.fragmentRegistry.get(componentClass)
        return fragment
    }
    static getObject = (componentObjectId) => {
        if (!componentObjectId) { 
            console.error(`getObject: No component object id provided.`)
            return null 
        }
        if (!window?.$components?.objectRegistry?.has(componentObjectId)) { 
            console.error(`getObject: Component object ${componentObjectId} is not registered.`)
            return null 
        }
        
        let componentObjectInfo = window.$components.objectRegistry.get(componentObjectId)
        return componentObjectInfo.componentObject
    }
    static createComponentInclude = (includeIn, src, componentClass, componentId, props, vars) => {
        let newInclude = document.createElement(`include-html`, { })

        newInclude.setAttribute(`include-in`, includeIn)
        newInclude.setAttribute(`src`, src)
        newInclude.setAttribute(`component-class`, componentClass)
        newInclude.setAttribute(`component-id`, componentId)

        if (props) {
            let newIncludeProps = document.createElement(`include-props`, { })

            newIncludeProps.innerText = props
            newInclude.appendChild(newIncludeProps)
        }
        if (vars) {
            let newIncludeVars = document.createElement(`include-vars`, { })

            newIncludeVars.innerText = vars
            newInclude.appendChild(newIncludeVars)
        }
        return newInclude
    }
    className() {return this.constructor.name }
    initialize(id) { 
        Queue.broadcast(Messages.COMPONENT_BEFORE_INITIALIZATION, this)
        this.id = id
        Queue.broadcast(Messages.COMPONENT_AFTER_INITIALIZATION, this)
    }
    beforeMount() { Queue.broadcast(Messages.COMPONENT_BEFORE_MOUNT, this )}
    afterMount() { Queue.broadcast(Messages.COMPONENT_AFTER_MOUNT, this )}
    beforeUnmount() { Queue.broadcast(Messages.COMPONENT_BEFORE_UNMOUNT, this )}
    afterUnmount() { Queue.broadcast(Messages.COMPONENT_AFTER_UNMOUNT, this )}
    isMounted() { return window.$components.objectRegistry.get(this.id).mounted } 
    destroy() { 
        Queue.broadcast(Messages.COMPONENT_BEFORE_DESTRUCTION, this)
        ComponentLifecycle.destroyComponentObject(`${this.id}`) 
        Queue.broadcast(Messages.COMPONENT_AFTER_DESTRUCTION, this)
    }
}

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
        const moveSlotContentToComponent = (slotContentElement, componentSlotElement) => {
            if (0 === slotContentElement.children.length) {
                console.error(`moveSlotContentToComponent: Slot content element has no children.`)
                return false
            }
            if (0 !== componentSlotElement.children.length) {
                console.error(`moveSlotContentToComponent: Component slot ${componentElement.getAttribute(`for-slot`)} was not found.`)
                return false
            }
    
            while (0 < slotContentElement.children.length) {
                componentSlotElement.after(slotContentElement.firstChild)
            }
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

            if (!componentSlot) { continue }
            if (!moveSlotContentToComponent(slotContent, componentSlot)) {
                console.error(`loadSlots: An error occured while moving slot content to the ${componentElement.getAttribute(`for-slot`)}] slot of ${forComponentId}.`)
                continue
            }
        }
    }
}

class Loader {
    static includeTree = new Tree()
    static get tree() { return Loader.includeTree }
    
    static loadFile = async (filename) => {
        let response = await fetch(filename)
    
        if (!response.ok) {
            let error = `loadFile: Network response was not OK while loading ${filename}.`
    
            console.error(error)
            throw new Error(error);
        }
    
        let text = await response.text()

        return text
    }
    static updateIncludeTree = (parentName, childName) => {
        let node = null
        
        if (Loader.tree.hasNode(parentName)) {
            node = Loader.tree.getNodeByName(parentName)
        } else {
            node = new TreeNode(parentName)
            Loader.tree.addNode(node)
        }
        if (node.hasAncestor(childName)) {
            console.error(`updateIncludeTree: Include-html tag causes infinite recursion. Include processing halted. Parent name is ${parentName}. Child name is ${childName}`)
            return null
        }
        let childNode = node.addChild(childName)
        return childNode
    }
    static validateIncludeAttributes = (attributes) => {
        const badReturn = [null, null, null, null, null]

        if (!attributes) {
            console.error(`validateIncludeAttributes: Include missing required attributes 'include-in' and 'src'. Include processing halted.`)
            return badReturn
        }

        let src = attributes.src?.value
        let includeIn = attributes[`include-in`]?.value
        let componentClass = attributes[`component-class`]?.value
        let componentObjectId = attributes[`component-id`]?.value  
        let repeatAttributValue = attributes[`repeat`]?.value
        let repeat = (repeatAttributValue)? parseInt(repeatAttributValue) : 1

        if (!src) {
            console.error(`validateIncludeAttributes: Include-html tag missing required attribute 'src'. Include processing halted. File containing bad Include-html tag is ${includeIn}.`)
            return badReturn
        }
        if (!includeIn) {
            console.error(`validateIncludeAttributes: Include-html tag missing required attribute 'include-in'. Include processing halted. Included file is ${src}.`)
            return badReturn
        }
        if (componentClass && !componentObjectId) {
            console.error(`validateIncludeAttributes: Include-html tag missing required attribute 'component-id'. Include processing halted. File containing bad Include-html tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        if (!componentClass && componentObjectId) {
            console.error(`validateIncludeAttributes: Include-html tag missing required attribute 'component-class'. Include processing halted. File containing bad Include-html tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        if (0 !== repeat && !repeat) {
            console.error(`validateIncludeAttributes: Include-html tag 'repeat' attribute is not a number. Include processing halted. File containing bad Include-html tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        if (1 > repeat) {
            console.error(`validateIncludeAttributes: Include-html tag 'repeat' attribute must be greater than zero. Include processing halted. File containing bad Include-html tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        return [src, includeIn, componentClass, componentObjectId, repeat]
    }
    static loadInclude = async function (include) {
        let [src, includeIn, componentClass, componentObjectId, repeat] = Loader.validateIncludeAttributes(include.attributes)

        if (!src || !includeIn) { return false }

        let nodeAddedToIncludeTree = Loader.updateIncludeTree(includeIn, src)

        if (!nodeAddedToIncludeTree) { return false }

        let text = await Loader.loadFile(include.attributes.src.value)

        for (let loop = 0; loop < repeat; loop++) {
            if (!componentClass) {
                include.insertAdjacentHTML('afterend', text)
            } else {
                let loadIncludeComponentResult = Loader.loadIncludeComponent(text, src, includeIn, componentClass, componentObjectId, include)
                if (!loadIncludeComponentResult) { return false }
            }
        }

        return true
    }
    static loadIncludeComponent = function (text, src, includeIn, componentClass, componentObjectId, include) {
        let fragment = ComponentLifecycle.compile(text)
        let fragmentAlreadyRegistered = window?.$components?.fragmentRegistry?.has(componentClass)
        let fragmentRegistered = fragmentAlreadyRegistered || ComponentLifecycle.registerDOMFragment(componentClass, fragment, false)

        if (!fragmentRegistered) {
            console.error(`loadIncludeComponent: Failed to register component fragment. Include processing halted. Component class: ${componentClass}. File containing bad Include-html tag is ${includeIn}. Include file is ${src}.`)
            return false
        }

        let componentObject = ComponentLifecycle.createComponentObject(componentClass, componentObjectId, include)

        if (!componentObject) {
            console.error(`loadIncludeComponent: Failed to create component. Include processing halted. Component class: ${componentClass}. File containing bad Include-html tag is ${includeIn}. Include file is ${src}.`)
            return false
        }

        let componentObjectRegistered = ComponentLifecycle.registerComponentObject(componentClass, componentObjectId, componentObject, include)

        if (!componentObjectRegistered) {
            console.error(`loadIncludeComponent: Failed to register component object. Include processing halted. Component class: ${componentClass}. File containing bad Include-html tag is ${includeIn}. Include file is ${src}.`)
            return false
        }
        
        let componentMounted = ComponentLifecycle.mount(componentObjectId)

        if (!componentMounted) {
            console.error(`loadIncludeComponent: Failed to mount component object ${componentObjectId}. Include processing halted. File containing bad Include-html tag is ${includeIn}. Include file is ${src}.`)
            return false
        }

        return true
    }
    static loadIncludes = async function () {
        let includes = document.getElementsByTagName('include-html')

        if (0 === includes.length) { 
            Queue.broadcast(Messages.INCLUDES_LOADED, {})
            return 
        }
        for (let loop = 0; loop < includes.length; loop++) {
            const include = includes[loop]
            let result = await Loader.loadInclude(include)
            include.remove()
            if (!result) { 
                return 
            }
        }
        // Includes can contain includes.
        await Loader.loadIncludes()
    }
    static registerCustomTags = function () {
        // * The include-html tag can include a file containing HTML into another HTML document. The HTML to be
        // included can be a normal HTML snippet, or can be an HTML component. 
        // * In both cases the include-in attribute is used to indicate the name of the file receiving the HTML and 
        // the src attribute is used to provide the location of the file to be included.
        //
        // Including Components
        // * When including an HTML component, the include-html tag must also have a component-class attribute
        // indicating the class of the component and a component-id attribute providing an id for the component instance.
        // * An object of the type indicated by the component-class attrubute which represents the component instance is
        // created and can be accessed using the Component.getObject(id) method, where id is the value of the component-id
        // attribute of the include-html tag.
        // * The HTML DOM fragment used to create instance of the component can be accessed using the 
        // Component.getFragment(className) method, where className is the value of the component-class attribute of the
        // include-html tag.
        // * It is standard practice to give the root element of the component the same id as the component's class. This
        // makes it easy to locate the DOM element for the component.
        // The object represent an instance of a component has an id member, myComponent.id, that has the value provided by
        // the component-id attribute of the include-html.
        // The value of the id member of the object representing the component can be accessed in the HTML markup of the 
        // component in attributes or in innerText using the {id} syntax. Example: id="{id}".
        customElements.define('include-html', class IncludeHTMLElement extends HTMLElement { }, { })

        // * Components can have props, which are values that cannot be changed after the component has been initialized. The
        // values for the props of an instance of a component can be set using the include-props tag. The inner text of this
        // tag contans JSON used to inialize the props.
        // * The include-props tag can only appear inside the include-html tag of a component.
        // * The values of the props of the object representing the component can be accessed in the HTML markup of the 
        // component in attributes or in innerText using the {prop-name} syntax. Example: <div>{myProp}</div>".
        customElements.define('include-props', class IncludePropsElement extends HTMLElement { }, { })

        // * Components can have vars, which are values that can be changed throughout the lifetime of the component object. The
        // values for the vars of an instance of a component can be set using the include-vars tag. The inner text of this
        // tag contans JSON used to inialize the vars.
        // * The include-vars tag can only appear inside the include-html tag of a component. 
        // * The values of the vars of the object representing the component can be accessed in the HTML markup of the 
        // component in attributes or in innerText using the {var-name} syntax. Example: <div>{myVar}</div>".
        customElements.define('include-vars', class IncludeVarsElement extends HTMLElement { }, { })

        // * Defines a custom component. Custom components must contain:
        //      * A script tag which contains the javascript for a class that extends the Component class. The script
        //       tag may optionally contain additonal javascript.
        //      * A component-markup that provides the HTML markup for the component. The component-markup tag may optionally
        //       contain one or more component-slot tags.
        // * A custom-component tag may also contain:
        //      * A test-script tag that contains testing code for the tag.
        //      * A style tag that contains CSS. This is usually CSS used by the component.
        customElements.define('custom-component', class CustomComponentElement extends HTMLElement { }, { })

        // * Contains tests for the component. In normal web pages, this section will be removed from the DOM
        // when the tag is downloaded. On a testing page, the tests are executed.
        customElements.define('test-script', class TestScriptElement extends HTMLElement { }, { })

        // * A component-markup tag contains HTML markup that defines a component. The component-markup tag can
        // only appear inside a custom-component tag.
        customElements.define('component-markup', class ComponentMarkupElement extends HTMLElement { }, { })

        // * Slots are loaded after all incude tags have been processed.
        // * component-slot appears inside a component. It's only attribute is an id. It marks a location that can
        // accept content from a slot-markup tag.
        customElements.define('component-slot', class ComponentSlotElement extends HTMLElement { }, { })

        // * A slot-markup tag apears anywhere in the body of the page outside of a component. The slot-markup tag
        // has for-component-id and for-slot attributes that indicate which slot it's associated with. All children 
        // elements of the slot-markup tag become sibling elements of the associated component-slot tag. Once this is
        // done, the empty slot-markup and the component-slot tags are removed from the document.
        // * The contents of a slot-markup tag are associated only with the DOM elements of an instance of a component.
        // They are not associated with the DOM fragment.
        customElements.define('slot-markup', class SlotMarkupElement extends HTMLElement { }, { })
    }
}

document.addEventListener(`DOMContentLoaded`, async () => { 
    Loader.registerCustomTags()
    await Loader.loadIncludes()
    SlotManager.loadSlots()
})
window.onload = () => { console.log(`onload`) }
window.onbeforeunload = () => { console.log(`onbeforeunload`) }
window.onunload = () => { console.log(`onunload`) }
