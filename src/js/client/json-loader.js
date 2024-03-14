class JSONLoader {
    static async loadComponents(parentId, components) {
        for (let component of components) {
            if (!component.src) { 
                console.error(`loadComponents: No src provided.`) 
                return false
            }
            if (!component.id) { 
                console.error(`loadComponents: No id provided.`) 
                return false
            }

            const parent = document.getElementById(parentId)

            if (!parent) { 
                console.error(`loadComponents: parent element ${parentId} not found.`) 
                return false
            }

            if (component.src.endsWith(`.html`)) {
                const newInclude = Component.createComponentInclude(component.src, component.id, component.props, component.vars, null, component.style, component.attributes)

                parent.appendChild(newInclude)
                await Loader.loadInclude(newInclude)    
            } else if (component.src.endsWith(`.json`)) {
                await JSONLoader.loadFromJSON(component.id, component.src)
            }

            if (component.children) { await JSONLoader.loadComponents(component.id, component.children) }
        }
    }
    static async loadFromJSON(parentId, filename) {
        try {
            const text = await Loader.loadFile(filename)
            const config = JSON.parse(text)
    
            if (!config.components) { 
                console.error(`loadFromJSON: No components provided.`) 
                return false
            }

            return JSONLoader.loadComponents(parentId, config.components)
        } catch(e) {
            let error = `loadFromJSON: Error loading JSON config. ${e}.`
            return false
        }
    }
}
