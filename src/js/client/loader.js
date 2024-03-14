
class Loader {
    static msgs = {
        INCLUDES_LOADED: `INCLUDES_LOADED`,
        SITE_LOADED: `SITE_LOADED`
    }
    static includeTree = new Tree()
    static includeCache = new Map()
    static get tree() { return Loader.includeTree }
    static get cache() { return Loader.includeCache }
    static forDebug() {
        const x = 1
    }
    static async siteLoaded() {
        const body = document.getElementsByTagName(`body`)[0]

        body.addEventListener("onclick", (event) => { Queue.broadcast(Messages.DOCUMENT_CLICK, event) })
        document.addEventListener("onkeyup", (event) => { 
            if (`Enter` !== event?.key && ` ` !== event?.key) { return }
            Queue.broadcast(Messages.DOCUMENT_DEFAULT_ACTION, event)
        })
        document.addEventListener("keydown", (event) => { 
            if (`Escape` !== event?.key) { return }
            Queue.broadcast(Messages.DOCUMENT_ESCAPE, event)
        })
        body.addEventListener("focusin", (event) => { 
            const hasFocus = event.target
            const hasFocusId = hasFocus?.id
            const hasFocusComponent = (hasFocusId && Component.isObjectRegistered(hasFocusId))? Component.getObject(hasFocusId) : null
            const hasFocusValue = (hasFocusComponent)? hasFocusComponent : null
            const lostFocus = event.relatedTarget
            const lostFocusId = lostFocus?.id
            const lostFocusComponent = (lostFocusId && Component.isObjectRegistered(lostFocusId))? Component.getObject(lostFocusId) : null
            const lostFocusValue = (lostFocusComponent)? lostFocusComponent : event.relatedTarget

            if (!hasFocusComponent) { return }
            Queue.broadcast(Messages.FOCUS_IN, { lostFocus: lostFocusValue, hasFocus: hasFocusValue })
        })
        body.addEventListener("focusout", (event) => { 
            const hasFocus = event.relatedTarget
            const hasFocusId = hasFocus?.id
            const hasFocusComponent = (hasFocusId && Component.isObjectRegistered(hasFocusId))? Component.getObject(hasFocusId) : null
            const hasFocusValue = (hasFocusComponent)? hasFocusComponent : event.relatedTarget
            const lostFocus = event.target
            const lostFocusId = lostFocus?.id
            const lostFocusComponent = (lostFocusId && Component.isObjectRegistered(lostFocusId))? Component.getObject(lostFocusId) : null
            const lostFocusValue = (lostFocusComponent)? lostFocusComponent : null

            if (!lostFocusValue) { return }
            Queue.broadcast(Messages.FOCUS_OUT, { lostFocus: lostFocusValue, hasFocus: hasFocusValue })
        })
        Queue.broadcast(Loader.msgs.SITE_LOADED, null)
    }
    static async loadFile(filename, includeTests, includeDocs, includeSamples) {
        if (Loader.cache.has(filename)) { return Loader.cache.get(filename) }
        const strip = filename.replace(`./`, `/strip/`)
        const stripTests = filename.replace(`./`, `/strip-tests/`)
        const stripDocs = filename.replace(`./`, `/strip-docs/`)
        const stripSamples = filename.replace(`./`, `/strip-samples/`)
        const stripTestsAndDocs = filename.replace(`./`, `/strip-tests-docs/`)
        const stripTestsAndSamples = filename.replace(`./`, `/strip-tests-samples/`)
        const stripDocsAndSamples = filename.replace(`./`, `/strip-docs-samples/`)
        let url = filename

        if (!includeTests && !includeDocs && !includeSamples) { url = strip }
        else if (includeTests && !includeDocs && includeSamples) { url = stripDocs }
        else if (!includeTests && includeDocs && includeSamples) { url = stripTests }
        else if (includeTests && includeDocs && !includeSamples) { url = stripSamples }
        else if (!includeTests && !includeDocs && includeSamples) { url = stripTestsAndDocs }
        else if (!includeTests && includeDocs && !includeSamples) { url = stripTestsAndSamples }
        else if (includeTests && !includeDocs && !includeSamples) { url = stripDocsAndSamples }

        const response = await fetch(url)
    
        if (!response.ok) {
            let error = `loadFile: Network response was not OK while loading ${filename}.`
    
            console.error(error)
            throw new Error(error);
        }
    
        let text = await response.text()

        Loader.cache.set(filename, text)
        return text
    }
    static updateIncludeTree(parentName, childName) {
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
    static validateIncludeAttributes(attributes) {
        const badReturn = [null, null, null, null, null]

        if (!attributes) {
            console.error(`validateIncludeAttributes: Include missing required attributes. Include processing halted.`)
            return badReturn
        }

        const src = attributes[`data-src`]?.value
        const componentObjectId = attributes[`data-id`]?.value
        const includeIn = attributes[`data-in`]?.value || componentObjectId
        const repeatAttributValue = attributes[`data-repeat`]?.value
        const repeat = (repeatAttributValue)? parseInt(repeatAttributValue) : 1
        const includeTests = !!attributes[`data-tests`]?.value 
        const includeDocs = !!attributes[`data-docs`]?.value
        const includeSamples = !!attributes[`data-samples`]?.value

        if (!src) {
            console.error(`validateIncludeAttributes: Include-html tag missing required attribute 'data-src'. Include processing halted. File containing bad Include-html tag is ${includeIn}.`)
            return badReturn
        }
        if (!componentObjectId) {
            console.error(`validateIncludeAttributes: Include-html tag missing required attribute 'data-id'. Include processing halted. File containing bad Include-html tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        if (0 !== repeat && !repeat) {
            console.error(`validateIncludeAttributes: Include-html tag 'data-repeat' attribute is not a number. Include processing halted. File containing bad Include-html tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        if (1 > repeat) {
            console.error(`validateIncludeAttributes: Include-html tag 'data-repeat' attribute must be greater than zero. Include processing halted. File containing bad Include-html tag is ${includeIn}. Included file is ${src}.`)
            return badReturn
        }
        return [src, includeIn, componentObjectId, repeat, includeTests, includeDocs, includeSamples]
    }
    static async loadInclude(include) {
        let [src, includeIn, componentObjectId, repeat, includeTests, includeDocs, includeSamples] = Loader.validateIncludeAttributes(include.attributes)

        if (!src || !includeIn) { return false }

        let nodeAddedToIncludeTree = Loader.updateIncludeTree(includeIn, src)

        if (!nodeAddedToIncludeTree) { return false }

        const value = include.attributes[`data-src`]?.value

        let text = await Loader.loadFile(value, includeTests, includeDocs, includeSamples)

        for (let loop = 0; loop < repeat; loop++) {
            if (!componentObjectId) {
                include.insertAdjacentHTML('afterend', text)
            } else {
                let loadIncludeComponentResult = await Loader.loadIncludeComponent(text, src, includeIn, componentObjectId, include)

                if (!loadIncludeComponentResult) { return false }
            }
        }

        return true
    }
    static registerChildComponents(fragment, componentClass) {
        const componentMarkupTag = fragment.querySelector("component-markup")
        const includeHTMLTags = componentMarkupTag?.querySelectorAll("include-html")

        if (!ComponentLifecycle.childComponentRegistry) { ComponentLifecycle.childComponentRegistry = new Map() }

        const data = { component: componentClass, childComponents: []}

        for (let loop = 0; loop < includeHTMLTags.length; loop++) {
            let includeHTMLTag = includeHTMLTags[loop]

            if (includeHTMLTag.hasAttribute(`data-id`)) { data.childComponents.push(includeHTMLTag.getAttribute(`data-id`).replace(`{id}`, ``)) }
        }
        ComponentLifecycle.childComponentRegistry.set(data.component, data.childComponents)
    }
    static registerSlots(fragment, componentClass) {
        const componentMarkupTag = fragment.querySelector("component-markup")
        const componentSlotTags = componentMarkupTag.querySelectorAll("component-slot")

        if (!ComponentLifecycle.slotRegistry) { ComponentLifecycle.slotRegistry = new Map() }

        let data = { component: componentClass, slots: []}

        for (let loop = 0; loop < componentSlotTags.length; loop++) {
            let slotTag = componentSlotTags[loop]

            if (slotTag.hasAttribute(`id`)) { data.slots.push(slotTag.getAttribute(`id`).replace(`{id}`, ``)) }
        }
        ComponentLifecycle.slotRegistry.set(data.component, data.slots)
    }
    static addChildComponentGettersToComponentObject(componentClass, componentObjectId) {
        const childComponents = ComponentLifecycle.childComponentRegistry.get(componentClass)
        const componentObject = Component.getObject(componentObjectId)

        if (!childComponents || !componentObject) { return }

        for (let childComponentId of childComponents) {
            let getterName = childComponentId.replace(` `, `_`).replace(componentObject.id, ``)

            if (Object.getOwnPropertyDescriptor(componentObject, getterName)) { continue }
            Object.defineProperty(componentObject, getterName, {
                get: function() {
                    return Component.getObject(`${componentObjectId}${childComponentId}`)
                },
                set: function(newValue) {
                    console.error(`Component: Cannot set ${getterName}.`)
                }
            })
        }
    }
    static getClassName(fragment) {
        const scripts = fragment.querySelectorAll(`script`)

        if (0 === scripts.length) {
            console.error(`getClassName: Fragment must contain at least one component script tag.`)
            return null
        }
        const classDeclaration = /class\s+\w+/.exec(scripts[0].innerText)

        if (!classDeclaration?.length) {
            console.error(`getClassName: No class declaration found in fragment.`)
            return null
        }

        const parsedClassDeclaration = classDeclaration[0].split(/\s+/)

        if (2 !== parsedClassDeclaration.length) {
            console.error(`getClassName: Invalid declaration found in fragment.`)
            return null
        }

        const componentClass = parsedClassDeclaration[1]

        return componentClass
    }
    static async loadIncludeComponent(text, src, includeIn, componentObjectId, include) {
            const fragment = ComponentLifecycle.compile(text)
            const componentClass = Loader.getClassName(fragment)
            const includeTests = !!include.getAttribute(`data-tests`)
            const includeSamples = !!include.getAttribute(`data-samples`)

            if (null === componentClass) {
                console.error(`loadIncludeComponent: Failed to parse component class. Include file is ${src}.`)
                return false
            }

            const fragmentAlreadyRegistered = ComponentLifecycle.fragmentRegistry.has(componentClass)
            const fragmentRegistered = fragmentAlreadyRegistered || ComponentLifecycle.registerDOMFragment(componentClass, componentObjectId, fragment, includeTests, includeSamples)

            if (!fragmentRegistered) {
                console.error(`loadIncludeComponent: Failed to register component fragment. Include processing halted. Component class: ${componentClass}. File containing bad Include-html tag is ${includeIn}. Include file is ${src}.`)
                return false
            }
    
            Loader.registerChildComponents(fragment, componentClass)
            Loader.registerSlots(fragment, componentClass)

            const componentObject = await ComponentLifecycle.createComponentObject(componentClass, componentObjectId, include)

            if (!componentObject) {
                console.error(`loadIncludeComponent: Failed to create component. Include processing halted. Component class: ${componentClass}. File containing bad Include-html tag is ${includeIn}. Include file is ${src}.`)
                return false
            }

            const componentObjectRegistered = ComponentLifecycle.registerComponentObject(componentClass, componentObjectId, componentObject)

            if (!componentObjectRegistered) {
                console.error(`loadIncludeComponent: Failed to register component object. Include processing halted. Component class: ${componentClass}. File containing bad Include-html tag is ${includeIn}. Include file is ${src}.`)
                return false
            }
            
            Loader.addChildComponentGettersToComponentObject(componentClass, componentObjectId)

            const componentMounted = await ComponentLifecycle.mount(componentObjectId)

            if (!componentMounted) {
                console.error(`loadIncludeComponent: Failed to mount component object ${componentObjectId}. Include processing halted. File containing bad Include-html tag is ${includeIn}. Include file is ${src}.`)
                return false
            }

            return true
    }
    static async loadIncludes() {
        let includes = document.getElementsByTagName('include-html')

        while (0 < includes.length) {
            const include = includes[0]
            const result = await Loader.loadInclude(include)

            include.remove()
            if (!result) { return }
            includes = document.getElementsByTagName('include-html')
        }
        await Queue.broadcast(Loader.msgs.INCLUDES_LOADED, {})
        return 
    }
    static registerCustomTags () {
        // * The include-html tag can include a file containing HTML into another HTML document. The HTML to be
        // included can be a normal HTML snippet, or can be an HTML component. 
        // * In both cases the include-src attribute is used to provide the location of the file to be included.
        //
        // Including Components
        // * An object of the type indicated by the inlcuded component is created and can be accessed using the 
        // Component.getObject(id) method, where id is the value of the data-id attribute of the include-html tag.
        // * The HTML DOM fragment used to create instance of the component can be accessed using the 
        // Component.getFragment(className) method, where className is the value of the component created by the
        // include-html tag.
        // * It is standard practice to give the root element of the component the same id as the component's class. This
        // makes it easy to locate the DOM element for the component. In other words, obj.id === element.id.
        // The object represent an instance of a component has an id member, myComponent.id, that has the value provided by
        // the data-id attribute of the include-html.
        // The value of the id member of the object representing the component can be accessed in the HTML markup of the 
        // component in attributes or in innerText using the {id} syntax. Example: id="{id}".
        customElements.define('include-html', class IncludeHTMLElement extends HTMLElement { }, { })

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