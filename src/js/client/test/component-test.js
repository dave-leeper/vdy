document.addEventListener('DOMContentLoaded', async () => {
    suite(`Test Vanilla`, `Ensure Vanilla utility class is working.`, [
        await test (`Get component fragment`, `Ensure component fragments can be retrieved from the component fragment registry.`, [async () => {
            window.$vanilla = {}
            window.$vanilla.fragmentRegistry = new Map()
            window.$vanilla.fragmentRegistry.set(`TestFragment`, { data: 'data'})
    
            let fragment =  Vanilla.getComponentFragment(`TestFragment`)
            let results = []
    
            assert(fragment,                                                    `An object was retrieved from the component fragment registry.`, results)
            assert(fragment.data === 'data',                                    `Correct object retrieved from the component fragment registry.`, results)
    
            fragment =  Vanilla.getComponentFragment()
    
            assert(!fragment,                                                   `Get component fragment fails when no id is provided.`, results)
    
            window.$vanilla.fragmentRegistry.delete(`TestFragment`)
            fragment = Vanilla.getComponentFragment(`TestFragment`)
    
            assert(!fragment,                                                   `Get component fragment fails when object not in the component fragment registry.`, results)
    
            return results                                                                    
        }]),
        await test (`Get component object`, `Ensure component objects can be retrieved from the component object registry.`, [async () => {
            window.$vanilla = {}
            window.$vanilla.objectRegistry = new Map()
            window.$vanilla.objectRegistry.set(`TestObject`, { componentObject: { data: 'data'}})
    
            let object =  Vanilla.getComponentObject(`TestObject`)
            let results = []
    
            assert(object,                                                      `An object was retrieved from the component object registry.`, results)
            assert(object.data === 'data',                                      `Correct object retrieved from the component object registry.`, results)
    
            object =  Vanilla.getComponentObject()
    
            assert(!object,                                                     `Get component object fails when no id is provided.`, results)
    
            window.$vanilla.objectRegistry.delete(`TestObject`)
            object =  Vanilla.getComponentFragment(`TestObject`)
    
            assert(!object,                                                     `Get component object fails when object not in the component object registry.`, results)
    
            return results                                                                    
        }]),
    ])
    suite(`Test Loader`, `Ensure Loader correctly processes include files.`, [
        await test (`Load file`, `Ensure files can be loaded.`, [async () => {
            let file = `./support-files/text.txt`
            let text = await Loader.loadFile(file)
            let results = []
    
            assert(text === `Text`,                                             `Text read from file.`, results)
    
            try {
                text = await Loader.loadFile(`no-such.file`)
            } catch (e) {
                assert(true,                                                    `Loading non-existant file throws an error.`, results)
            }
    
            return results                                                                    
        }]),    
        await test (`Update include tree`, `Ensure include tree works correctly.`, [async () => {
            Loader.includeTree = new IncludeTree()
    
            let results = []
            let newChildNode = Loader.updateIncludeTree(`parent`, `child`)
    
            assert(newChildNode,                                                `Include tree was successfully updated.`, results)
            assert(Loader.tree.nodes.length === 1,                              `Node added to include tree.`, results)
            assert(Loader.tree.nodes[0].name === `parent`,                      `Parent added to include tree.`, results)
    
            let parent = Loader.includeTree.getNodeByName(`parent`)
            let child = Loader.includeTree.getNodeByName(`child`)
    
            assert(parent,                                                      `Parent is in the tree.`, results)
            assert(child,                                                       `Child is in the tree.`, results)
            assert(!parent.parent,                                              `Parent does not have a parent.`, results)
            assert(parent.children.length === 1,                                `Parent has one child.`, results)
            assert(parent.children[0] === child,                                `Parent's child is the child node.`, results)
            assert(child.parent,                                                `Child has a parent.`, results)
            assert(child.parent === parent,                                     `Child's parent is the parent node.`, results)
            assert(child.children.length === 0,                                 `Child has no children.`, results)
    
            newChildNode = Loader.updateIncludeTree(`parent`, `child2`)
    
            let child2 = Loader.includeTree.getNodeByName(`child2`)
    
            assert(newChildNode,                                                `Node added to the tree.`, results)
            assert(child2,                                                      `Child2 is in the tree.`, results)
            assert(parent.children.length === 2,                                `Parent has two children.`, results)
            assert(parent.children[1] === child2,                               `Parent's second child is the child2 node.`, results)
            assert(child2.parent,                                               `Child2 has a parent.`, results)
            assert(child2.parent === parent,                                    `Child2's parent is the parent node.`, results)
    
            newChildNode = Loader.updateIncludeTree(`parent2`, `child3`)
    
            let parent2 = Loader.includeTree.getNodeByName(`parent2`)
            let child3 = Loader.includeTree.getNodeByName(`child3`)
    
            assert(Loader.tree.nodes.length === 2,                              `Node added to tree.`, results)
            assert(newChildNode,                                                `Node added to the tree.`, results)
            assert(parent2,                                                     `Parent2 is in the tree.`, results)
            assert(child3,                                                      `Child3 is in the tree.`, results)
            assert(parent2.children.length === 1,                               `Parent2 has one child.`, results)
            assert(parent2.children[0] === child3,                              `Parent2's child is the child3 node.`, results)
            assert(child3.parent,                                               `Child3 has a parent.`, results)
            assert(child3.parent === parent2,                                   `Child3's parent is the parent2 node.`, results)
    
            newChildNode = Loader.updateIncludeTree(`child`, `grandchild`)
    
            let grandchild = Loader.includeTree.getNodeByName(`grandchild`)
    
            assert(newChildNode,                                                `Node added to the tree.`, results)
            assert(grandchild,                                                  `Grandchild added to the tree.`, results)
            assert(child.children.length === 1,                                 `Child has one child.`, results)
            assert(child.children[0] === grandchild,                            `Child's child is the grandchild node.`, results)
            assert(grandchild.parent,                                           `Grandchild has a parent.`, results)
            assert(grandchild.parent === child,                                 `Grandchild's parent is the child node.`, results)
    
            newChildNode = Loader.updateIncludeTree(`child`, `parent`)
    
            assert(!newChildNode,                                               `Node not added to the tree when it causes recursion.`, results)
    
            newChildNode = Loader.updateIncludeTree(`child2`, `parent`)
    
            assert(!newChildNode,                                               `Node not added to the tree when it causes recursion.`, results)
    
            newChildNode = Loader.updateIncludeTree(`grandchild`, `parent`)
    
            assert(!newChildNode,                                               `Node not added to the tree when it causes recursion.`, results)
    
            return results                                                                    
        }]),
        await test (`Validate include attributes`, `Ensure include tag attributes are correctly validated.`, [async () => {
            let results = []
            let div = document.createElement('div')
    
            div.setAttribute(`src`, `src value`)
            div.setAttribute(`include-in`, `include-in value`)
    
            let [src, includeIn, componentClass, componentObjectId, repeat] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src == `src value`,                                          `Src value read correctly.`, results)
            assert(includeIn == `include-in value`,                             `Include-in value read correctly.`, results)
            assert(componentClass === undefined,                                `No component-class attribute handled correctly.`, results)
            assert(componentObjectId === undefined,                             `No component-id attribute handled correctly.`, results)
            assert(repeat === 1,                                                `Repeat defaults to 1.`, results)
    
            div.removeAttribute(`src`)
    
            let [src1, includeIn1, componentClass1, componentObjectId1, repeat1] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src1 == null,                                                `Src is null when src is missing.`, results)
            assert(includeIn1 == null,                                          `Include-in is null when src is missing.`, results)
            assert(componentClass1 === null,                                    `component-class is null when src is missing.`, results)
            assert(componentObjectId1 === null,                                 `component-id is null when src is missing.`, results)
            assert(repeat1 === null,                                            `Repeat is null when src is missing.`, results)
    
            div.setAttribute(`src`, `src value`)
            div.removeAttribute(`include-in`)
    
            let [src2, includeIn2, componentClass2, componentObjectId2, repeat2] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src2 == null,                                                `Src is null when include-in is missing.`, results)
            assert(includeIn2 == null,                                          `Include-in is null when include-in is missing.`, results)
            assert(componentClass2 === null,                                    `Component-class is null when include-in is missing.`, results)
            assert(componentObjectId2 === null,                                 `Component-id is null when include-in is missing.`, results)
            assert(repeat2 === null,                                            `Repeat is null when include-in is missing.`, results)
    
            div.setAttribute(`include-in`, `include-in value`)
            div.setAttribute(`component-class`, `component-class value`)
            div.setAttribute(`component-id`, `component-id value`)
    
            let [src3, includeIn3, componentClass3, componentObjectId3, repeat3] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src3 == `src value`,                                         `Src value read correctly.`, results)
            assert(includeIn3 == `include-in value`,                            `Include-in value read correctly.`, results)
            assert(componentClass3 === `component-class value`,                 `Component-class value read correctly.`, results)
            assert(componentObjectId3 === `component-id value`,                 `Component-id value read correctly.`, results)
            assert(repeat3 === 1,                                               `Repeat defaults to 1.`, results)
    
            div.removeAttribute(`component-class`)
    
            let [src4, includeIn4, componentClass4, componentObjectId4, repeat4] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src4 == null,                                                `Src is null when component-class is missing and component-id exists.`, results)
            assert(includeIn4 == null,                                          `Include-in is null when component-class is missing and component-id exists.`, results)
            assert(componentClass4 === null,                                    `component-class is null when component-class is missing and component-id exists.`, results)
            assert(componentObjectId4 === null,                                 `component-id is null when component-class is missing and component-id exists.`, results)
            assert(repeat4 === null,                                            `Repeat is null when component-class is missing and component-id exists.`, results)
    
            div.setAttribute(`component-class`, `component-class value`)
            div.removeAttribute(`component-id`)
    
            let [src5, includeIn5, componentClass5, componentObjectId5, repeat5] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src5 == null,                                                `Src is null when component-class is exists and component-id is missing.`, results)
            assert(includeIn5 == null,                                          `Include-in is null when component-class exists and component-id is missing.`, results)
            assert(componentClass5 === null,                                    `component-class is null when component-class exists and component-id is missing.`, results)
            assert(componentObjectId5 === null,                                 `component-id is null when component-class exists and component-id is missing.`, results)
            assert(repeat5 === null,                                            `Repeat is null when component-class exists and component-id is missing.`, results)
    
            div.removeAttribute(`component-class`)
            div.removeAttribute(`component-id`)
            div.setAttribute(`repeat`, `5`)
    
            let [src6, includeIn6, componentClass6, componentObjectId6, repeat6] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src6 == `src value`,                                         `Src value read correctly.`, results)
            assert(includeIn6 == `include-in value`,                            `Include-in value read correctly.`, results)
            assert(componentClass6 === undefined,                               `No component-class attribute handled correctly.`, results)
            assert(componentObjectId6 === undefined,                            `No component-id attribute handled correctly.`, results)
            assert(repeat6 === 5,                                               `Repeat attribute read correctly.`, results)
    
            div.setAttribute(`repeat`, `JUNK`)
    
            let [src7, includeIn7, componentClass7, componentObjectId7, repeat7] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src7 == null,                                                `Src is null when repeat is NaN.`, results)
            assert(includeIn7 == null,                                          `Include-in is null when repeat is NaN.`, results)
            assert(componentClass7 === null,                                    `component-class is null when repeat is NaN.`, results)
            assert(componentObjectId7 === null,                                 `component-id is null when repeat is NaN.`, results)
            assert(repeat7 === null,                                            `Repeat is null when repeat is NaN.`, results)
    
            div.setAttribute(`repeat`, `0`)
    
            let [src8, includeIn8, componentClass8, componentObjectId8, repeat8] = Loader.validateIncludeAttributes(div.attributes)
    
            assert(src8 == null,                                                `Src is null when repeat is less than 1.`, results)
            assert(includeIn8 == null,                                          `Include-in is null when repeat is less than 1.`, results)
            assert(componentClass8 === null,                                    `component-class is null when repeat is less than 1.`, results)
            assert(componentObjectId8 === null,                                 `component-id is null when repeat is less than 1.`, results)
            assert(repeat8 === null,                                            `Repeat is null when repeat is less than 1.`, results)
    
            return results                                                                    
        }]),    
        await test (`Load include`, `Ensure basic include tags are loaded correctly.`, [async () => {
            let results = []
            let include = document.createElement('div')
            let testingDOMNode = document.getElementById(`TestingDOM`)
    
            include.id = `include-here`
            include.setAttribute(`src`, `./support-files/footer.html`)
            include.setAttribute(`include-in`, `include.test.js`)
    
            testingDOMNode.appendChild(include)
            await Loader.loadInclude(include)
    
            let footer = testingDOMNode.querySelector(`footer`)
            let includeCheck = testingDOMNode.querySelector(`div`)
    
            assert(footer,                                                      `Footer added to document.`, results)
            assert(!includeCheck,                                               `Include tag removed from document.`, results)
    
            footer.remove()
            include.setAttribute(`src`, `./support-files/footer.html`)
            include.setAttribute(`include-in`, `looping-footer.js`)
            include.id = `include-here`
            testingDOMNode.appendChild(include)
            await Loader.loadInclude(include)
            footer = testingDOMNode.querySelector(`footer`)
    
            assert(footer,                                                      `Loader does not load nested includes.`, results)
    
            footer.remove()
            include.removeAttribute(`src`)
            include.id = `include-here`
            testingDOMNode.appendChild(include)
            await Loader.loadInclude(include)
            footer = testingDOMNode.querySelector(`footer`)
    
            assert(!footer,                                                     `Loader does not include when src attribute is missing.`, results)
    
            include.setAttribute(`src`, `./support-files/footer.html`)
            include.removeAttribute(`include-in`)
            include.id = `include-here`
            testingDOMNode.appendChild(include)
            await Loader.loadInclude(include)
            footer = testingDOMNode.querySelector(`footer`)
    
            assert(!footer,                                                     `Loader does not include when include-in attribute is missing.`, results)
    
            window.$vanilla = undefined
            while (testingDOMNode.firstChild) {
                testingDOMNode.removeChild(testingDOMNode.firstChild)
            }
    
            return results                                                                    
        }]),    
        await test (`Load include component`, `Ensure component include tags are loaded correctly.`, [async () => {
            let results = []
            let include = document.createElement('div')
            let testingDOM = document.getElementById(`TestingDOM`)
    
            include.id = `include-here`
            include.setAttribute(`src`, `./support-files/test-button-component.html`)
            include.setAttribute(`include-in`, `include.test.js`)
            include.setAttribute(`component-class`, `Button`)
            include.setAttribute(`component-id`, `Button1`)
            testingDOM.appendChild(include)
            await Loader.loadInclude(include)
    
            assert(testingDOM.children[0],                                      `An element was inserted.`, results)
            assert(testingDOM.children[0].tagName == 'SCRIPT',                  `The marker tag was inserted`, results)
            assert(testingDOM.children[1],                                      `An second element was inserted.`, results)
            assert(testingDOM.children[1].tagName == 'BUTTON',                  `The component's button tag was inserted.`, results)
            assert(testingDOM.children[1].innerText == 'Button',                `Button's inner text replaced with the value of var x.`, results)
            assert(testingDOM.children[2],                                      `An third element was inserted.`, results)
            assert(testingDOM.children[2].tagName == 'DIV',                     `The component's first div tag was inserted.`, results)
            assert(testingDOM.children[2].innerText == 'Y',                     `First div's inner text replaced with the value of var y.`, results)
            assert(testingDOM.children[3],                                      `An fourth element was inserted.`, results)
            assert(testingDOM.children[3].tagName == 'DIV',                     `The component's second div tag was inserted.`, results)
            assert(testingDOM.children[3].innerText.indexOf(`value1`) === 0,    `First div's inner text replaced with the value of prop prop1.`, results)
            assert(testingDOM.children.length == 4,                             `There are 4 'top level' elements for the component.`, results)
            assert(testingDOM.children[3].children[0].tagName == `DIV`,         `The second div tag has a child.`, results)
            assert(testingDOM.children[3].children[0].innerText == `value2`,    `The second div's inner text replaced with the value of prop prop2.`, results)
            assert(testingDOM.children[3].children.length == 1,                 `The second div tag has only 1 child.`, results)
    
            window.$vanilla = undefined
            while (testingDOM.firstChild) {
                testingDOM.removeChild(testingDOM.firstChild)
            }
    
            return results                                                                    
        }]),    
    ])
})