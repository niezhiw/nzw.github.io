const hx = require('../hbxBridge.js');
const Disposable = require("./disposable.js");
const metatypes = require("./metatypes.js");
let commands = {};

function _init(connection){
	connection.onRequest("command/execute", function(param){
		console.log("command/execute:" + param.id);
		executeCommand(param.id,param.params,param.checked)
	    return true
	});
}

function registerCommand(id,handler,thisArg){
    if(commands[id]){
        console.error("command id ["+id+"] already exists.");
        return ;
	}
	if(thisArg){
		handler = handler.bind(thisArg);
	}
    commands[id] = handler;
    return new Disposable(function(){
        commands[id] = undefined;
    });
}

function registerTextEditorCommand(id,handler){
	let disposable = registerCommand(id,handler);
	commands[id].isEditorCommand = true;
    return disposable;
}

function executeCommand(id,params,checked){
    if(commands[id]){
        let result = new Promise((resolve, reject) => {
        	if(commands[id].isEditorCommand){
        		let activeEditor = hx.window.getActiveTextEditor();
        		activeEditor.then(function(editor){
        			commands[id](editor,params,checked);
        		});
        	}else{
        		commands[id](params,checked);
        	}
            resolve();
        });
        return result;
    }else{
        return hx.request("commands.executeCommand",{
            id:id,
            params:params
        });
    }
}

module.exports = {
	init:_init,
    registerCommand:registerCommand,
    executeCommand:executeCommand,
	registerTextEditorCommand:registerTextEditorCommand
}