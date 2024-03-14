const testCreateTreeNode = {
    name: `Create`,
    description: `Ensure Tree objects are properly created.`,
    test: async () => {
        let treeNode = new TreeNode(`TestTreeNode`)
        let results = []
    
        assert(treeNode,                                                    `TreeNode created.`, results)
        assert(treeNode.name == `TestTreeNode`,                             `TreeNode name set.`, results)
        assert(treeNode.children !== undefined,                             `TreeNode children not undefined.`, results)
        assert(treeNode.children !== null,                                  `TreeNode children not null.`, results)
        assert(treeNode.children.length === 0,                              `TreeNode children array is empty.`, results)
        assert(treeNode.parent === null,                                    `TreeNode has no parent.`, results)
    
        return results
    }
}
const testAddChildTreeNode = {
    name: `Add Child`,
    description: `Ensure child nodes are properly added.`,
    test: async () => {
        let treeNode = new TreeNode(`TestTreeNode`)
        let results = []
    
        treeNode.addChild(`TestTreeNodeChild`)
        assert(treeNode.children.length === 1,                              `TreeNode children has one child.`, results)
        assert(treeNode.children[0].name === `TestTreeNodeChild`,           `TreeNode child is named TestTreeNodeChild.`, results)
        assert(treeNode.parent === null,                                    `TreeNode has no parent.`, results)
        assert(treeNode.children[0].parent === treeNode,                    `Child's parent is TreeNode.`, results)
        assert(treeNode.hasChild(`TestTreeNodeChild`),                      `TreeNode has child TestTreeNodeChild.`, results)
        assert(treeNode.getChildByName(`TestTreeNodeChild`).name ===        `TestTreeNodeChild`,
                                                                            `TreeNode can return child node object by name.`, results)
    
        return results                                                                    
    }
}
const testTreeNodeAncestors = {
    name: `Ancestors`,
    description: `Ensure ancestor nodes work properly.`,
    test: async () => {
        let treeNode = new TreeNode(`TestTreeNode`)
        let results = []
    
        treeNode.addChild(`TestTreeNodeChild`)
        treeNode.children[0].addChild(`TestTreeNodeGrandchild`)
        const child = treeNode.children[0]
        const grandchild = child.children[0]
    
        assert(treeNode.children.length === 1,                              `TreeNode children has one child.`, results)
        assert(treeNode.children[0].name ===                                `TestTreeNodeChild`, `TreeNode child is named TestTreeNodeChild.`, results)
        assert(treeNode.parent === null,                                    `TreeNode has no parent.`, results)
        assert(treeNode.children[0].parent === treeNode,                    `Child's parent is TreeNode.`, results)
        assert(treeNode.hasChild(`TestTreeNodeChild`),                      `TreeNode has child TestTreeNodeChild.`, results)
        assert(treeNode.getChildByName(`TestTreeNodeChild`).name ===        `TestTreeNodeChild`,
                                                                            `TreeNode can return child node object by name.`, results)
        assert(child.children.length === 1,                                 `TestTreeNodeChild children has one child.`, results)
        assert(child.children[0].name ===                                   `TestTreeNodeGrandchild`, `TestTreeNodeChild child is named TestTreeNodeGrandchild.`, results)
        assert(child.parent === treeNode,                                   `TestTreeNodeChild parent is TestTreeNode.`, results)
        assert(child.children[0].parent === child,                          `Grandchild's parent is TestTreeNodeChild.`, results)
        assert(child.hasChild(`TestTreeNodeGrandchild`),                    `TestTreeNodeChild has child TestTreeNodeGrandchild.`, results)
        assert(child.getChildByName(`TestTreeNodeGrandchild`).name ===      `TestTreeNodeGrandchild`,
                                                                            `TestTreeNodeChild can return child node object by name.`, results)
        assert(grandchild.children.length === 0,                            `TestTreeNodeGrandchild children has no children.`, results)
        assert(grandchild.parent === child,                                 `TestTreeNodeGrandchild parent is TestTreeNodeChild.`, results)
        assert(grandchild.hasAncestor(`TestTreeNodeChild`),                 `TestTreeNodeGrandchild has ancestor TestTreeNodeChild.`, results)
        assert(grandchild.hasAncestor(`TestTreeNode`),                      `TestTreeNodeGrandchild has ancestor TestTreeNode.`, results)
        assert(grandchild.getAncestor(`TestTreeNode`) === treeNode,         `TestTreeNodeGrandchild returns ancestor TestTreeNodeChild.`, results)
        assert(grandchild.getAncestor(`TestTreeNodeChild`) === child,       `TestTreeNodeGrandchild returns ancestor TestTreeNodeChild.`, results)
        assert(child.hasAncestor(`TestTreeNode`),                           `TestTreeNodeChild has ancestor TestTreeNode.`, results)
        assert(child.getAncestor(`TestTreeNode`) === treeNode,              `TestTreeNodeChild returns ancestor TestTreeNode.`, results)
    
        return results  
    }
}
const testTreeNodeDescendants = {
    name: `Descendants`,
    description: `Ensure descendant nodes work properly.`,
    test: async () => {
        let treeNode = new TreeNode(`TestTreeNode`)
        let results = []
    
        treeNode.addChild(`TestTreeNodeChild`)
        treeNode.children[0].addChild(`TestTreeNodeGrandchild`)
        const child = treeNode.children[0]
        const grandchild = child.children[0]
    
        assert(treeNode.hasDescendant(`TestTreeNodeChild`),                 `TestTreeNodeGrandchild has ancestor TestTreeNodeChild.`, results)
        assert(treeNode.hasDescendant(`TestTreeNodeGrandchild`),            `TestTreeNodeGrandchild has ancestor TestTreeNode.`, results)
        assert(treeNode.getDescendant(`TestTreeNodeChild`) === child,       `TestTreeNodeGrandchild has ancestor TestTreeNodeChild.`, results)
        assert(treeNode.getDescendant(`TestTreeNodeGrandchild`) === grandchild,  
                                                                            `TestTreeNodeGrandchild has ancestor TestTreeNodeChild.`, results)
    
        return results                                                                    
    }
}
const testTreeNodeSuite = {
    name: `TreeNode`,
    description: `Ensure TreeNodes work properly.`,
    tests: [testCreateTreeNode, testAddChildTreeNode, testTreeNodeAncestors, testTreeNodeDescendants]
}

export const getTestSuite = () => { return testTreeNodeSuite }