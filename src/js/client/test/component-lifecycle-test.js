const cleanup = (fragmentId) => {
    const testingDOMNode = document.getElementById(`TestingDOM`)

    while (testingDOMNode?.firstChild) {
        testingDOMNode.removeChild(testingDOMNode.firstChild)
    }
    if (fragmentId) {
        const componentScript = document.getElementById(`ScriptTag${fragmentId}`)
        const componentTest = document.getElementById(`TestTag${fragmentId}`)
        const componentSyle = document.getElementById(`StyleTag${fragmentId}`)
    
        componentScript?.remove()
        componentTest?.remove()
        componentSyle?.remove()
    }
    window.$vanilla = undefined
    window.initialized = false
    window.beforeMount = false
    window.afterMount = false
}
document.addEventListener('DOMContentLoaded', async () => {
    suite(`Test VanillaComponentLifecycle`, `Ensure VanillaComponentLifecycle is working.`, [
        await test (`Compile`, `Ensure html is properly compiled.`, [async () => {
            let html = `<div>First Div</div><span>Parent Div<div>Child Div</div></span>`
            let frag = VanillaComponentLifecycle.compile(html)
            let results = []
    
            assert(frag,                                                        `DOM elements created.`, results)
            assert(frag.children.length === 2,                                  `Correct number of children.`, results)
            assert(frag.children[0].innerText === `First Div`,                  `First div inner text is correct.`, results)
            assert(frag.children[1].innerText === `Parent DivChild Div`,        `Span inner text is correct.`, results)
            assert(frag.children[1].children.length === 1,                      `Span has correct number of children.`, results)
            assert(frag.children[1].children[0].innerText === `Child Div`,      `Child div inner text is correct.`, results)
    
            return results                                                                    
        }]),
        await test (`Replace Node Values`, `Ensure node values are properly replaced.`, [async () => {
            let text = `Original Text {field1}`
            let textChild = `Original Text {field2}`
            let testDiv = document.createElement('div')
            let testDivText = document.createTextNode(text)
            let testDivChildText = document.createTextNode(textChild)
            let testDivChild = document.createElement('div')
            let testData = { field1: `value 1`, field2: `value 2` }
            let results = []
    
            testDiv.id = `testDiv`
            testDivChild.id = `testDivChild`
            testDiv.appendChild(testDivText)
            testDiv.appendChild(testDivChild)
            testDivChild.appendChild(testDivChildText)
            document.getElementById(`TestingDOM`).appendChild(testDiv)
            VanillaComponentLifecycle.replaceNodeValue(testDiv, testData, `field1`)
            VanillaComponentLifecycle.replaceNodeValue(testDiv, testData, `field2`)
            
            assert(testDivText.nodeValue === `Original Text value 1`,           `Node value replaced.`, results)
            assert(testDivText.originalNodeValue === text,                      `Original value saved.`, results)
            assert(testDivChildText.nodeValue === `Original Text value 2`,      `Node value replaced in child nodes.`, results)
            assert(testDivChildText.originalNodeValue === textChild,            `Original value saved in child nodes.`, results)
    
            testDiv.remove()
            testDivChild.remove()
    
            return results                                                                    
        }]),
    
        await test (`Replace Attribute Values`, `Ensure attribute values are properly replaced.`, [async () => {
            let text = `Original Text {field1}`
            let textChild = `Original Text {field2}`
            let testDiv = document.createElement('div')
            let testDivChild = document.createElement('div')
            let testDivAttr = document.createAttribute(`test`)
            let testDivChildAttr = document.createAttribute(`test`)
            let testData = { field1: `value 1`, field2: `value 2` }
            let results = []
    
            testDiv.id = `testDiv`
            testDivChild.id = `testDivChild`
            testDiv.setAttributeNode(testDivAttr)
            testDivChild.setAttributeNode(testDivChildAttr)
            testDivAttr.value = text
            testDivChildAttr.value = textChild
            testDiv.appendChild(testDivChild)
            testDivChild.setAttributeNode(testDivChildAttr)
            document.getElementById(`TestingDOM`).appendChild(testDiv)
    
            VanillaComponentLifecycle.replaceAttributeValue(testDiv, testData, `field1`)
            VanillaComponentLifecycle.replaceAttributeValue(testDiv, testData, `field2`)
            
            assert(testDivAttr.value === `Original Text value 1`,               `Attribute value replaced.`, results)
            assert(testDivAttr.originalAttributeValue === text,                 `Original value saved.`, results)
            assert(testDivChildAttr.value === `Original Text value 2`,          `Attribute value replaced in child nodes.`, results)
            assert(testDivChildAttr.originalAttributeValue === textChild,       `Original value saved in child nodes.`, results)
    
            testDiv.remove()
            testDivChild.remove()
    
            return results                                                                    
        }]),
        await test (`Wrap props`, `Ensure component props are properly wrapped.`, [async () => {
            class TestComponent{
                className(){return this.constructor.name}
                initialize() { if (window.initialized !== undefined) { window.initialized = true }}
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true }}
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true }}
                beforeUnmount() { if (window.afterMount !== undefined) { window.afterMount = true }}
                afterUnmount() { if (window.afterMount !== undefined) { window.afterMount = true }}
                vars = { var1: `TestComponent`, var2: `Y` }
                props = { prop1: `value1`, prop2: `value2` }
            }
            let testComponent = new TestComponent()
            let html = `<footer class="center-text caption-1 red-f pad-tb-5 margin-tb-5 bg-gray-e border-2 border-solid border-black">My Footer</footer>`
            let componentFragment = VanillaComponentLifecycle.compile(html)
            let results = []
    
            VanillaComponentLifecycle.wrapProps(componentFragment, testComponent)
            testComponent.props.prop1 = `New Value`
    
            assert(testComponent.props.$propsStore,                             `Data store created.`, results)
            assert(testComponent.props.prop1 === `value1`,                      `Cannot assign value to props.`, results)
    
            return results                                                                    
        }]),
        await test (`Wrap vars`, `Ensure component vars are properly wrapped.`, [async () => {
            class TestComponent{
                className(){return this.constructor.name}
                initialize() { if (window.initialized !== undefined) { window.initialized = true }}
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true }}
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true }}
                beforeUnmount() { if (window.afterMount !== undefined) { window.afterMount = true }}
                afterUnmount() { if (window.afterMount !== undefined) { window.afterMount = true }}
                vars = { var1: `TestComponent`, var2: `Y` }
                props = { prop1: `value1`, prop2: `value2` }
            }
            let testComponent = new TestComponent()
            let html = `<footer class="center-text caption-1 red-f pad-tb-5 margin-tb-5 bg-gray-e border-2 border-solid border-black">My Footer</footer>`
            let componentFragment = VanillaComponentLifecycle.compile(html)
            let results = []
    
            VanillaComponentLifecycle.wrapVars(componentFragment, testComponent)
            testComponent.vars.var1 = `New Value`
    
            assert(testComponent.vars.$varsStore,                               `Data store created.`, results)
            assert(testComponent.vars.var1 === `New Value`,                     `Assigning value to vars works.`, results)
    
            return results                                                                    
        }]),
        await test (`Register DOM fragment`, `Ensure component DOM fragment is properly registered.`, [async () => {
            let html = `<vanilla-component><script>
                class TestComponent{
                    className() { return this.constructor.name }
                    initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <test-script>const myTest = function() { return 42; }</test-script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
            let frag = VanillaComponentLifecycle.compile(html)
            let fragmentId = `TestComponent`
            let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
            let fragmentScripts = frag.querySelectorAll(`script`)
            let fragmentTests = frag.querySelectorAll(`test-script`)
            let fragmentStyles = frag.querySelectorAll(`style`)
            let componentScript = document.getElementById(`ScriptTag${fragmentId}`)
            let componentTest = document.getElementById(`TestTag${fragmentId}`)
            let componentSyle = document.getElementById(`StyleTag${fragmentId}`)
            let componentInRegistry = window.$vanilla?.fragmentRegistry?.has(fragmentId)
            let results = []
    
            assert(registerResult,                                              `DOM fragment registered.`, results)
            assert(componentInRegistry,                                         `DOM fragment in registry.`, results)
            assert(fragmentScripts.length === 0,                                `Component script moved out of fragment.`, results)
            assert(fragmentTests.length === 0,                                  `Component test moved out of fragment.`, results)
            assert(fragmentStyles.length === 0,                                 `Component style moved out of fragment.`, results)
            assert(componentScript,                                             `Component script still in document.`, results)
            assert(document.head.querySelector(`#ScriptTag${fragmentId}`),      `Component script moved to head.`, results)
            assert(componentTest === null,                                      `Component test not in document.`, results)
            assert(componentSyle,                                               `Component style still in document.`, results)
            assert(document.head.querySelector(`#StyleTag${fragmentId}`),       `Component style moved to head.`, results)
    
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
            componentScript = document.getElementById(`ScriptTag${fragmentId}`)
            componentTest = document.getElementById(`TestTag${fragmentId}`)
            componentSyle = document.getElementById(`StyleTag${fragmentId}`)
    
            assert(registerResult,                                              `DOM fragment registered (include test tag).`, results)
            assert(componentInRegistry,                                         `DOM fragment in registry (include test tag).`, results)
            assert(fragmentScripts.length === 0,                                `Component script moved out of fragment (include test tag).`, results)
            assert(fragmentTests.length === 0,                                  `Component test moved out of fragment (include test tag).`, results)
            assert(fragmentStyles.length === 0,                                 `Component style moved out of fragment (include test tag).`, results)
            assert(componentScript,                                             `Component script still in document (include test tag).`, results)
            assert(document.head.querySelector(`#ScriptTag${fragmentId}`),      `Component script moved to head (include test tag).`, results)
            assert(componentTest,                                               `Component test still in document (include test tag).`, results)
            assert(document.head.querySelector(`#TestTag${fragmentId}`),        `Component test moved to head (include test tag).`, results)
            assert(componentSyle,                                               `Component style still in document (include test tag).`, results)
            assert(document.head.querySelector(`#StyleTag${fragmentId}`),       `Component style moved to head (include test tag).`, results)
    
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
    
            assert(!registerResult,                                             `Register DOM fragment fails when fragment is already registered.`, results)
    
            componentScript = document.getElementById(`ScriptTag${fragmentId}`)
            componentTest = document.getElementById(`TestTag${fragmentId}`)
            componentSyle = document.getElementById(`StyleTag${fragmentId}`)
            componentScript?.remove()
            componentTest?.remove()
            componentSyle?.remove()
            window.$vanilla.fragmentRegistry.delete(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(null, frag, false)
    
            assert(!registerResult,                                             `Register DOM fragment fails when no fragment id is provided.`, results)
    
            cleanup(fragmentId)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, null, false)
    
            assert(!registerResult,                                             `Register DOM fragment fails when no fragment is provided.`, results)
    
            html = `<vanilla-component><test-script>const myTest = function() { return 42; }</test-script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
    
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
        
            assert(!registerResult,                                             `Register DOM fragment fails when there's no script tag.`, results)
    
            html = `<vanilla-component><script>
                class TestComponent{
                    className() { return this.constructor.name }
                    initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <script>const f = () => {}</script>
                <test-script>const myTest = function() { return 42; }</test-script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
            
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
        
            assert(!registerResult,                                             `Register DOM fragment fails when there's two script tags.`, results)
        
            html = `<vanilla-component><script>
                class TestComponent{
                    className() { return this.constructor.name }
                    initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <test-script>const myTest = function() { return 42; }</test-script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                </vanilla-component>`
    
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
        
            assert(!registerResult,                                             `Register DOM fragment fails when there's no markup tag.`, results)
    
            html = `<vanilla-component><script>
                class TestComponent{
                    className() { return this.constructor.name }
                    initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <test-script>const myTest = function() { return 42; }</test-script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup>
                <component-markup><div></div></component-markup>
                </vanilla-component>`
    
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
        
            assert(!registerResult,                                             `Register DOM fragment fails when there's two markup tags.`, results)
    
            html = `<vanilla-component><script>
                class TestComponent{
                    className() { return this.constructor.name }
                    initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup>
                </vanilla-component>`
    
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
        
            assert(registerResult,                                              `Register DOM fragment succeeds when including test tag, but there's no test tag.`, results)
    
            html = `<vanilla-component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <test-script>const myTest = function() { return 42; }</test-script>
            <test-script>const myOtherTest = function() { return 42; }</test-script>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <component-markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </component-markup></vanilla-component>`
    
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
        
            assert(!registerResult,                                             `Register DOM fragment fails when there's two test tags.`, results)
    
            html = `<vanilla-component><script>
            class TestComponent{
                className() { return this.constructor.name }
                initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                vars = { var1: 'value1', var2: 'value2' } 
                props = { prop1: 'value3', prop2: 'value4' }
            }</script>
            <test-script>const myTest = function() { return 42; }</test-script>
            <style>.buttonStyle { color: green; background-color: red; }</style>
            <style>.checkboxStyle { color: green; background-color: red; }</style>
            <component-markup>
                <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                <div id='test-div-1'>{var2}</div>
                <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
            </component-markup></vanilla-component>`
    
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
        
            assert(!registerResult,                                             `Register DOM fragment fails when there's two style tags.`, results)
    
            cleanup(fragmentId)
            return results                                                                    
        }]),
        await test (`Unregister DOM fragment`, `Ensure component DOM fragment is properly unregistered.`, [async () => {
            let html = `<vanilla-component><script>
                class TestComponent{
                    className() { return this.constructor.name }
                    initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <test-script>const myTest = function() { return 42; }</test-script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
            let frag = VanillaComponentLifecycle.compile(html)
            let fragmentId = `TestComponent`
            let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
            let unregisterResult = VanillaComponentLifecycle.unregisterDOMFragment(fragmentId)
            let componentScript = document.getElementById(`ScriptTag${fragmentId}`)
            let componentTest = document.getElementById(`TestTag${fragmentId}`)
            let componentSyle = document.getElementById(`StyleTag${fragmentId}`)
            let componentInRegistry = window.$vanilla?.fragmentRegistry?.has(fragmentId)
            let results = []
    
            assert(unregisterResult,                                            `DOM fragment unregistered.`, results)
            assert(!componentInRegistry,                                        `DOM fragment not in registry.`, results)
            assert(componentScript === null,                                    `Component script not in document.`, results)
            assert(componentTest === null,                                      `Component test not in document.`, results)
            assert(componentSyle === null,                                      `Component style still in document.`, results)
    
            cleanup(fragmentId)
            frag = VanillaComponentLifecycle.compile(html)
            registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, true)
            unregisterResult = VanillaComponentLifecycle.unregisterDOMFragment(fragmentId)
            componentScript = document.getElementById(`ScriptTag${fragmentId}`)
            componentTest = document.getElementById(`TestTag${fragmentId}`)
            componentSyle = document.getElementById(`StyleTag${fragmentId}`)
            componentInRegistry = window.$vanilla?.fragmentRegistry?.has(fragmentId)
    
            assert(registerResult,                                              `DOM fragment registers successfully after an unregistered.`, results)
            assert(unregisterResult,                                            `DOM fragment unregistered (include test tag).`, results)
            assert(!componentInRegistry,                                        `DOM fragment not in registry (include test tag).`, results)
            assert(componentScript === null,                                    `Component script not in document (include test tag).`, results)
            assert(componentTest === null,                                      `Component test not in document (include test tag).`, results)
            assert(componentSyle === null,                                      `Component style still in document (include test tag).`, results)
    
            cleanup(fragmentId)
            return results                                                                    
        }]),
        await test (`Create component object`, `Ensure a component's object can be successfully created.`, [async () => {
            let html = `<vanilla-component><script>
                class TestComponent {
                    className() { return this.constructor.name }
                    initialize() { window.initialized = true }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
            const setup = (fragmentId, html, includeTagHTML) => {
                let frag = VanillaComponentLifecycle.compile(html)
                let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
                let testingDOMNode = document.getElementById(`TestingDOM`)
        
                assert(registerResult,                                          `DOM fragment registered successfully.`, results)
                window.initialized = false
                testingDOMNode.append(...new DOMParser().parseFromString(includeTagHTML, `text/html`).body.childNodes)
            }
            let results = []
            let fragmentId = `TestComponent`
            let testIncludeTagId = `TestIncludeTag`
            let includeTagHTML = `<include-html id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-html>`
            
            setup(fragmentId, html, includeTagHTML)
    
            let componentObject = VanillaComponentLifecycle.createComponentObject(fragmentId, `TestComponent1`, document.getElementById(testIncludeTagId))
            let objectInRegistry = window.$vanilla?.objectRegistry?.has(fragmentId)
            let hasIncludeTag = document.getElementById(testIncludeTagId)
            let hasMarkerTag = document.getElementById(`-VanillaComponentBeginMarkerTestComponent1`)
    
            componentObject.props.prop1 = "Some value"
    
            assert(componentObject,                                             `Component object successfully created.`, results)
            assert(!objectInRegistry,                                           `Creating a component does not register it.`, results)
            assert(!hasIncludeTag,                                              `Include tag removed from document after object creation.`, results)
            assert(hasMarkerTag,                                                `Marker tag added to document after object creation.`, results)
            assert(window.initialized,                                          `Component has been initialized.`, results)
            assert(componentObject.vars.$varsStore,                             `Vars are wrapped.`, results)
            assert(componentObject.props.$propsStore,                           `Props are wrapped.`, results)
            assert(componentObject.props.prop1 === `value3`,                    `Props cannot be changed.`, results)
            
            cleanup(fragmentId)
            includeTagHTML = `<include-html props='{"q":"Q"}' id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-html>`
            setup(fragmentId, html, includeTagHTML)
            componentObject = VanillaComponentLifecycle.createComponentObject(fragmentId, `TestComponent1`, document.getElementById(testIncludeTagId))
            objectInRegistry = window.$vanilla?.objectRegistry?.has(fragmentId)
            hasIncludeTag = document.getElementById(`TestIncludeTag`)
    
            assert(componentObject,                                             `Component object successfully created.`, results)
            assert(componentObject.props.$propsStore,                           `Props are wrapped.`, results)
            assert(componentObject.props.prop1 === `value3`,                    `Props cannot be changed.`, results)
            assert(componentObject.props.q === `Q`,                             `Props can be set via the include tag.`, results)
    
            cleanup(fragmentId)
            includeTagHTML = `<include-html vars='{"q":"Q"}' id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-html>`
            setup(fragmentId, html, includeTagHTML)
            componentObject = VanillaComponentLifecycle.createComponentObject(fragmentId, `TestComponent1`, document.getElementById(testIncludeTagId))
            objectInRegistry = window.$vanilla?.objectRegistry?.has(fragmentId)
    
            assert(componentObject,                                             `Component object successfully created.`, results)
            assert(!objectInRegistry,                                           `Creating a component does not register it.`, results)
            assert(componentObject.vars.$varsStore,                             `Vars are wrapped.`, results)
            assert(componentObject.vars.q === `Q`,                              `Vars can be set via the include tag.`, results)
    
            cleanup(fragmentId)
            return results                                                                    
        }]),
        await test (`Register component object`, `Ensure a component's object can be successfully registered.`, [async () => {
            let html = `<vanilla-component><script>
                class TestComponent {
                    className() { return this.constructor.name }
                    initialize() { window.initialized = true }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
            let results = []
            const setup = (fragmentId, html, includeTagHTML) => {
                let frag = VanillaComponentLifecycle.compile(html)
                let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
                let testingDOMNode = document.getElementById(`TestingDOM`)
        
                assert(registerResult,                                          `DOM fragment registered successfully.`, results)
                window.initialized = false
                testingDOMNode.append(...new DOMParser().parseFromString(includeTagHTML, `text/html`).body.childNodes)
            }
            let fragmentId = `TestComponent`
            let componentObjectID = `TestComponent1`
            let includeTagHTML = `<include-html id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-html>`
    
            setup(fragmentId, html, includeTagHTML)
    
            let registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(fragmentId, componentObjectID, { test: `test` })
            let objectInRegistry = window.$vanilla?.objectRegistry?.has(componentObjectID)
    
            assert(registerComponentObjectResult,                               `Component object registered successfully.`, results)
            assert(objectInRegistry,                                            `Component object in registry.`, results)
    
            registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(fragmentId, componentObjectID, { test: `test` })
    
            assert(!registerComponentObjectResult,                              `Registering an object fails when it is already registered.`, results)
    
            cleanup(fragmentId)
            setup(fragmentId, html, includeTagHTML)
            registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(fragmentId, null, { test: `test` })
    
            assert(!registerComponentObjectResult,                              `Registering an object fails when no component object id is provided.`, results)
    
            cleanup(fragmentId)
            setup(fragmentId, html, includeTagHTML)
            registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(fragmentId, componentObjectID, null)
    
            assert(!registerComponentObjectResult,                              `Registering an object fails when no component object is provided.`, results)
    
            cleanup(fragmentId)
            setup(fragmentId, html, includeTagHTML)
            registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(null, componentObjectID, { test: `test` })
    
            assert(!registerComponentObjectResult,                              `Registering an object fails when no component class is provided.`, results)
    
            cleanup(fragmentId)
    
            return results                                                                    
        }]),
        await test (`Unregister component object`, `Ensure a component's object can be successfully unregistered.`, [async () => {
            let html = `<vanilla-component><script>
                class TestComponent {
                    className() { return this.constructor.name }
                    initialize() { window.initialized = true }
                    beforeMount() { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
            let results = []
            const setup = (fragmentId, html, includeTagHTML) => {
                let frag = VanillaComponentLifecycle.compile(html)
                let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
                let testingDOMNode = document.getElementById(`TestingDOM`)
        
                assert(registerResult,                                          `DOM fragment registered successfully.`, results)
                window.initialized = false
                testingDOMNode.append(...new DOMParser().parseFromString(includeTagHTML, `text/html`).body.childNodes)
            }
            let fragmentId = `TestComponent`
            let componentObjectID = `TestComponent1`
            let includeTagHTML = `<include-html id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-html>`
    
            setup(fragmentId, html, includeTagHTML)
    
            let registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(`fragment`, `TestObject`, { test: `test` })
            let unregisterComponentObjectResult = VanillaComponentLifecycle.unregisterComponentObject(`TestObject`)
            let objectInRegistry = window.$vanilla?.objectRegistry?.has(`TestObject`)
    
            assert(registerComponentObjectResult,                               `Component object registered successfully.`, results)
            assert(unregisterComponentObjectResult,                             `Component object unregistered successfully.`, results)
            assert(!objectInRegistry,                                           `Component object in registry.`, results)
    
            unregisterComponentObjectResult = VanillaComponentLifecycle.unregisterComponentObject(`fragment`, `TestObject`, { test: `test` })
    
            assert(!unregisterComponentObjectResult,                            `Unregistering an object fails when it is already unregistered.`, results)
    
            cleanup(fragmentId)
            setup(fragmentId, html, includeTagHTML)
            unregisterComponentObjectResult = VanillaComponentLifecycle.registerComponentObject()
    
            assert(!unregisterComponentObjectResult,                            `Unegistering an object fails when no component object id is provided.`, results)
    
            cleanup(fragmentId)
    
            return results                                                                    
        }]),
        await test (`Mount component`, `Ensure a component can be successfully mounted.`, [async () => {
            let html = `<vanilla-component><script>
                class TestComponent{
                    className() { return this.constructor.name }
                    initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                    beforeMount() { { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
            let results = []
            const setupComponent = (testIncludeTagId, componentClass, componentObjectId) => {
                let componentObject = VanillaComponentLifecycle.createComponentObject(componentClass, componentObjectId, document.getElementById(testIncludeTagId))
                let registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(componentClass, componentObjectId, componentObject)
                assert(registerComponentObjectResult,                           `Component object registered successfully.`, results)
            }
            const setup = (fragmentId, testIncludeTagId, html, includeTagHTML, componentClass, componentObjectId) => {
                let frag = VanillaComponentLifecycle.compile(html)
                let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
                let testingDOMNode = document.getElementById(`TestingDOM`)
        
                assert(registerResult,                                          `DOM fragment registered successfully.`, results)
                window.beforeMount = false
                window.afterMount = false
                testingDOMNode.append(...new DOMParser().parseFromString(includeTagHTML, `text/html`).body.childNodes)
                setupComponent(testIncludeTagId, componentClass, componentObjectId)
             }
            let fragmentId = `TestComponent`
            let testIncludeTagId = `TestIncludeTag`
            let componentClass = `TestComponent`
            let componentObjectId = `TestComponent1`
            let includeTagHTML = `<include-html id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-html>`
            setup(fragmentId, testIncludeTagId, html, includeTagHTML, componentClass, componentObjectId)
            let mountResult = VanillaComponentLifecycle.mount(componentObjectId)
            let componentObjectInfo = window.$vanilla.objectRegistry.get(componentObjectId)
    
            assert(mountResult,                                                 `Component was mounted.`, results)
            assert(window.beforeMount,                                          `Component's beforeMount() method was called.`, results)
            assert(window.afterMount,                                           `Component's afterMount() method was called.`, results)
            assert(componentObjectInfo?.mounted,                                `Component's marked as mounted.`, results)
    
            cleanup(fragmentId)
            setup(fragmentId, testIncludeTagId, html, includeTagHTML, componentClass, componentObjectId)
            mountResult = VanillaComponentLifecycle.mount()
    
            assert(!mountResult,                                                `Mount fails when no id is provided.`, results)
    
            cleanup(fragmentId)
            setup(fragmentId, testIncludeTagId, html, includeTagHTML, componentClass, `WrongComponentObjectId`)
            mountResult = VanillaComponentLifecycle.mount(componentObjectId)
    
            assert(!mountResult,                                                `Mount fails when component is not registered.`, results)
    
            cleanup(fragmentId)
            setup(fragmentId, testIncludeTagId, html, includeTagHTML, componentClass, componentObjectId)
            window.$vanilla.objectRegistry.set(componentObjectId, componentObjectInfo)
    
            let framentRegisryObject = window.$vanilla.fragmentRegistry.get(componentClass)
    
            window.$vanilla.fragmentRegistry.delete(componentClass)
            mountResult = VanillaComponentLifecycle.mount(componentObjectId)
    
            assert(!mountResult,                                                `Mount fails when fragment is not registered.`, results)
    
            cleanup(fragmentId)
            setup(fragmentId, testIncludeTagId, html, includeTagHTML, componentClass, componentObjectId)
            window.$vanilla.fragmentRegistry.set(componentClass, framentRegisryObject)
    
            let markerElement = document.getElementById(`-VanillaComponentBeginMarkerTestComponent1`)
    
            markerElement.remove()
            mountResult = VanillaComponentLifecycle.mount(`TestComponent1`)
    
            assert(!mountResult,                                                `Mount fails when marker tag is not in DOM.`, results)
    
            let testingDOMNode = document.getElementById(`TestingDOM`)
    
            cleanup(fragmentId)
            return results                                                                    
        }]),
        await test (`Unmount component`, `Ensure a component can be successfully unmounted.`, [async () => {
            let html = `<vanilla-component><script>
                class TestComponent{
                    className() { return this.constructor.name }
                    initialize() { if (window.initialized !== undefined) { window.initialized = true } }
                    beforeMount() { { if (window.beforeMount !== undefined) { window.beforeMount = true } }
                    afterMount() { { if (window.afterMount !== undefined) { window.afterMount = true } }
                    beforeUnmount() { if (window.beforeUnmount !== undefined) { window.beforeUnmount = true } }
                    afterUnmount() { if (window.afterUnmount !== undefined) { window.afterUnmount = true } }
                    vars = { var1: 'value1', var2: 'value2' } 
                    props = { prop1: 'value3', prop2: 'value4' }
                }</script>
                <style>.buttonStyle { color: green; background-color: red; }</style>
                <component-markup>
                    <button id='test-button' name="{var2}" class="buttonStyle" onclick="console.log('clicked')">{var1}</button>
                    <div id='test-div-1'>{var2}</div>
                    <div id='test-div-2'>{prop1}<div id='test-div-3'>{prop2}</div></div>
                </component-markup></vanilla-component>`
            let includeTagHTML = `<include-html id="TestIncludeTag" component="TestComponent" component-id="TestComponent1" src="./components/not-used-for-this-test.html"></include-html>`
            let frag = VanillaComponentLifecycle.compile(html)
            let fragmentId = `TestComponent`
            let registerResult = VanillaComponentLifecycle.registerDOMFragment(fragmentId, frag, false)
            let testingDOMElement = document.getElementById(`TestingDOM`)
            let results = []
    
            window.beforeUnmount = false
            window.afterUnmount = false
            testingDOMElement.append(...new DOMParser().parseFromString(includeTagHTML, `text/html`).body.childNodes)
    
            let componentObject = VanillaComponentLifecycle.createComponentObject(fragmentId, `TestComponent1`, document.getElementById(`TestIncludeTag`))
            let registerComponentObjectResult = VanillaComponentLifecycle.registerComponentObject(fragmentId, `TestComponent1`, componentObject)
            let mountResult = VanillaComponentLifecycle.mount(`TestComponent1`)
            let unmountResult = VanillaComponentLifecycle.unmount(`TestComponent1`)
            let componentObjectInfo = window.$vanilla.objectRegistry.get(`TestComponent1`)
    
            assert(unmountResult,                                               `Component was unmounted.`, results)
            assert(window.beforeUnmount,                                        `Component's beforeUnmount() method was called.`, results)
            assert(window.afterUnmount,                                         `Component's afterUnmount() method was called.`, results)
            assert(!componentObjectInfo?.mounted,                               `Component marked as unmounted.`, results)
    
            unmountResult = VanillaComponentLifecycle.unmount()
    
            assert(!unmountResult,                                              `Unmount fails when no id is provided.`, results)
    
            window.$vanilla.objectRegistry.delete(`TestComponent1`)
            unmountResult = VanillaComponentLifecycle.unmount()
    
            assert(!unmountResult,                                              `Unmount fails when component is not registered.`, results)
    
            window.$vanilla.objectRegistry.set(`TestComponent1`, componentObjectInfo)
    
            let framentRegisryObject = window.$vanilla.fragmentRegistry.get(fragmentId)
    
            window.$vanilla.fragmentRegistry.delete(fragmentId)
            unmountResult = VanillaComponentLifecycle.unmount(`TestComponent1`)
    
            assert(!unmountResult,                                              `Unmount fails when fragment is not registered.`, results)
    
            window.$vanilla.fragmentRegistry.set(fragmentId, framentRegisryObject)
    
            let markerElement = document.getElementById(`-VanillaComponentBeginMarkerTestComponent1`)
    
            markerElement.remove()
            unmountResult = VanillaComponentLifecycle.unmount(`TestComponent1`)
    
            assert(!unmountResult,                                              `Unmount fails when marker tag is not in DOM.`, results)
    
            let testingDOMNode = document.getElementById(`TestingDOM`)
    
            cleanup(fragmentId)
            return results                                                                    
        }]),
    ])
})