/**
 * Represents a tree data structure. 
 * Provides methods to add, search for, and traverse nodes in the tree.
*/
class Tree {
    /**
     * Initializes the nodes array to store tree nodes.
     */
    constructor() {
        this.nodes = []
    }
    /**
     * Adds a node to the tree if it does not already exist.
     * 
     * @param {Object} node - The node to add.
     */
    addNode(node) {
        if (this.hasNode(node.name)) { return }
        this.nodes.push(node)
    }
    /**
     * Checks if a node with the given name exists in the tree.
     * 
     * @param {string} name - The name of the node to check for.
     * @returns {boolean} - True if a node with the given name exists, false otherwise.
     */
    hasNode(name) {
        let node = this.getNodeByName(name)
        return (null !== node)
    }
    /**
     * Searches for a node in the tree by the given name.
     * 
     * Iterates through all nodes in the tree and checks if the name matches.
     * Also recursively searches through child nodes.
     * 
     * @param {string} name - The name of the node to find.
     * @returns {Object|null} - The node object if found, null otherwise.
     */
    getNodeByName(name) {
        for (let node of this.nodes) {
            if (node.name === name) { return node }
            let descendant = node.getDescendant(name)
            if (descendant) { return descendant }
        }
        return null
    }
    /**
     * Converts the tree to a string representation by recursively calling toString() 
     * on each node and appending the results.
     *
     * @param {string} prefix - A prefix to add before each line of output.
     * @returns {string} A string representation of the tree structure.
     */
    toString(prefix) {
        let result = ``
        for (let node of this.nodes) {
            result += node.toString(prefix)
        }
        return result
    }
}