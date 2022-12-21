
class TreeDataProvider{
    constructor() {
        
    }
    getChildren(element) {
        throw new Error("TreeDataProvider must implements getChildren function。");
    }
    getTreeItem(element) {
        throw new Error("TreeDataProvider must implements getTreeItem function。");
    }
}

module.exports = {
    TreeDataProvider:TreeDataProvider
}