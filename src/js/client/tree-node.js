/**
 * Class representing a node in a tree data structure. 
 * Provides methods for traversing and manipulating the tree.
 */
class TreeNode {
    /**
     * Constructor for TreeNode instances.
     * 
     * @param {string} name - The name of the tree node.
     * @returns {TreeNode} The new TreeNode instance.
     */
    constructor(name) {
        this.name = name
        this.children = []
        this.parent = null
    }
    /**
     * Adds a new child node with the given name to this node's children.
     * Creates a new TreeNode instance for the child, sets this node as its parent,
     * and adds it to this node's children array. Returns the new child node.
     */
    addChild(child) {
        let childNode = new TreeNode(child)
        childNode.parent = this
        this.children.push(childNode)
        return childNode
    }
    /**
     * Checks if this node has a child with the given name.
     * 
     * @param {string} name - The name of the child to check for.
     * @returns {boolean} True if a child with the given name exists, false otherwise.
     */
    hasChild(name) {
        let node = this.getChildByName(name)
        return (null !== node)
    }
    /**
     * Searches this node's children for a node with the given name.
     * 
     * @param {string} name - The name to search for.
     * @returns {TreeNode|null} The node if found, null if not.
     */
    getChildByName(name) {
        for (let node of this.children) {
            if (node.name === name) { return node }
        }
        return null
    }
    /**
     * Checks if this node has the specified ancestor node.
     * 
     * @param {string} ancestorName - The name of the ancestor node to check for.
     * @returns {boolean} True if the ancestor node exists, false otherwise.
     */
    hasAncestor(ancestorName) {
        let node = this.getAncestor(ancestorName)
        return (null !== node)
    }
    /**
     * Recursively checks if this node has the specified ancestor node.
     * 
     * Traverses up the tree by recursively calling getAncestor on each parent node.
     * Returns the ancestor node if found, null if not.
     * 
     * This is an internal recursive helper function.
     *  
     * @param {string} ancestorName - The name of the ancestor node to check for.
     * @returns {TreeNode|null} The ancestor node if found, null if not.
     */
    getAncestor(ancestorName) {
        if (!this.parent) { return null }
        if (this.parent.name === ancestorName) { return this.parent }
        return this.parent.getAncestor(ancestorName)
    }
    /**
     * Checks if this node has the specified descendant node.
     * 
     * @param {string} descendantName - The name of the descendant node to check for.
     * @returns {boolean} True if the descendant node exists, false otherwise.
     */
    hasDescendant(descendantName) {
        let node = this.getDescendant(descendantName)
        return (null !== node)
    }
    /**
     * Recursively checks if this node has the specified descendant node.
     * 
     * Traverses down the tree by recursively calling getDescendant on each child node.
     * Returns the descendant node if found, null if not.
     */
    getDescendant(descendantName) {
        for (let node of this.children) {
            if (node.name === descendantName) { return node }
            let descendant = node.getDescendant(descendantName)
            if (descendant) { return descendant }
        }
        return null
    }
    /**
     * Generates a string representation of this node and its descendants.
     * 
     * Recursively traverses down the tree, appending each node's name and parent to the result string, with indentation to show the tree structure.
     */
    toString(prefix) {
        let cleanPrefix = (prefix) ? prefix : ``
        let result = `${cleanPrefix}${this.name} (parent: ${this.parent?.name})\n`
        cleanPrefix += `\t`
        for (let node of this.children) {
            result += node.toString(cleanPrefix)
        }
        return result
    }
}