document.addEventListener('DOMContentLoaded', async () => {
    suite(`Test Tree`, `Ensure Tree is working.`, [
        await test (`Create`, `Ensure Tree objects are properly created.`, [async () => {
            const tree = new Tree()
            let results = []
    
            assert(tree,                                                        `Tree created.`, results)
            assert(tree.nodes !== undefined,                                    `Tree nodes not undefined.`, results)
            assert(tree.nodes !== null,                                         `Tree nodes not null.`, results)
            assert(tree.nodes.length === 0,                                     `Tree nodes array is empty.`, results)
    
            return results                                                                    
        }]),
        await test (`Add nodes`, `Ensure adding nodes works correctly.`, [async () => {
            const tree = new tree()
            let treeNode = new TreeNode(`TestTreeNode`)
            let results = []
    
            tree.addNode(treeNode);
            assert(tree.nodes.length === 1,                                     `Tree nodes has one child.`, results)
            assert(tree.nodes[0].name === `TestTreeNode`,                       `Tree node is named TestTreeNode.`, results)
            assert(tree.hasNode(`TestTreeNode`),                                `Tree has node TestTreeNode.`, results)
            assert(tree.getNodeByName(`TestTreeNode`).name === `TestTreeNode`,  `Tree can return node object by name.`, results)
    
            return results                                                                    
        }]),
    ])
})