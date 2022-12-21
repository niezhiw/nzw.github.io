const hx = require('../hbxBridge.js');

function _init(connection){
	//TODO 
}

function DiagnosticCollection(name){
    this.name = name;
    this.clear = function(){
        
    }
    
    this.dispose = function(){
        
    }
    
    this.delete = function(uri){
        
    }
    this.set = function(uri,diagnostics){
        let source = this.name;
        hx.request("diagnostics.set",{
            uri:uri,
            source:source,
            diagnostics:diagnostics
        });
    }
}

/**
 * @param {String} name
 * @return {DiagnosticCollection}
 */
function createDiagnosticCollection(name){
    return new DiagnosticCollection(name);
}

/**
 * @param {Uri | undefined} resource
 * @return {Diagnostic[] | [Uri,Diagnostic[]]}
 */
function getDiagnostics(resource){
    
}

module.exports = {
	init:_init,
    createDiagnosticCollection:createDiagnosticCollection,
    getDiagnostics:getDiagnostics
}