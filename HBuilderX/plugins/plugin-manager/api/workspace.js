const hx = require("../hbxBridge.js");
const metatypes = require("./metatypes.js");
const Disposable = require("./disposable.js");
const TextDocument = require("./texteditor.js").TextDocument;
const TextEdit = require("./texteditor.js").TextEdit;
const configService = require("./configuration.js");
let hasInited = false;
let documentListeners = {
	willSaveTextDocument: [],
	didChangeTextDocument: [],
	onDidSaveTextDocument:[],
    onDidOpenTextDocument:[],
    onDidChangeWorkspaceFolders:[],
    onDidChangeConfiguration:[]
}

function _init(connection) {
	if (hasInited) {
		return;
	}
	hasInited = true;
	configService.init(connection);
	connection.onRequest("sendEvent", function(event) {
		let eventId = event.id;
		if (eventId in documentListeners) {
			let listeners = documentListeners[eventId];
			let doc = metatypes.newObject(event.data);
			for (let i = 0; i < listeners.length; i++) {
				let listener = listeners[i];
				if (listener) {
					listener(doc);
				}
			}
		}
		return true
	});
	connection.onNotification("postEvent", function(event) {
		let eventId = event.id;
		if (eventId in documentListeners) {
			let listeners = documentListeners[eventId];
			let doc = metatypes.newObject(event.data);
			for (let i = 0; i < listeners.length; i++) {
				let listener = listeners[i];
				if (listener) {
					listener(doc);
				}
			}
		}
	});
}


function WorkspaceFolder(options){
    this.name = options.name;
    this.nature = options.nature;
    this.id = options.id;
    this.uri = new hx.Uri(options.uri.scheme,options.uri.authority,
                        options.uri.path,options.uri.query,options.uri.fragment);
}
WorkspaceFolder.prototype.metatype = "WorkspaceFolder";

metatypes.registerObject(WorkspaceFolder.prototype.metatype,WorkspaceFolder);
metatypes.registerObject("WorkspaceFoldersChangeEvent",function(options){
    if(options.added){
        this.added = options.added.map(function(item){
            return metatypes.newObject(item);
        });
    }
    if(options.removed){
        this.removed = options.removed.map(function(item){
            return metatypes.newObject(item);
        });
    }
});

metatypes.registerObject("ConfigurationChangeEvent",function(options){
    this.section = options.section || '';
    this.affectsConfiguration = function(section){
        return this.section == section;
    }
});

function WorkspaceEdit() {
	let entries = {};

	this.set = function(uri, edits) {
		let uriKey = uri;
		if (typeof uri !== "string") {
            if(uri.fsPath){
                uriKey = uri.fsPath;
            }else{
                uriKey = uri.toString();
            }
		}
		entries[uriKey] = edits;
	}

	this.entries = function() {
		return entries;
	}
}

function onWillSaveTextDocument(listener) {
	documentListeners.willSaveTextDocument.push(listener);
    return new Disposable(function(){
        let index = documentListeners.willSaveTextDocument.indexOf(listener);
        if(index > -1){
            documentListeners.willSaveTextDocument.splice(index,1);
        }
    });
}
function onDidChangeWorkspaceFolders(listener){
    documentListeners.onDidChangeWorkspaceFolders.push(listener);
    return new Disposable(function(){
        let index = documentListeners.onDidChangeWorkspaceFolders.indexOf(listener);
        if(index > -1){
            documentListeners.onDidChangeWorkspaceFolders.splice(index,1);
        }
    });
}

function onDidChangeTextDocument(listener) {
	documentListeners.didChangeTextDocument.push(listener);
    return new Disposable(function(){
        let index = documentListeners.didChangeTextDocument.indexOf(listener);
        if(index > -1){
            documentListeners.didChangeTextDocument.splice(index,1);
        }
    });
}
//onDidSaveTextDocument
function onDidSaveTextDocument(listener) {
	documentListeners.onDidSaveTextDocument.push(listener);
    return new Disposable(function(){
        let index = documentListeners.onDidSaveTextDocument.indexOf(listener);
        if(index > -1){
            documentListeners.onDidSaveTextDocument.splice(index,1);
        }
    });
}

function onDidOpenTextDocument(listener){
    documentListeners.onDidOpenTextDocument.push(listener);
    return new Disposable(function(){
        let index = documentListeners.onDidOpenTextDocument.indexOf(listener);
        if(index > -1){
            documentListeners.onDidOpenTextDocument.splice(index,1);
        }
    });
}

function onDidChangeConfiguration(listener){
    documentListeners.onDidChangeConfiguration.push(listener);
    return new Disposable(function(){
        let index = documentListeners.onDidChangeConfiguration.indexOf(listener);
        if(index > -1){
            documentListeners.onDidChangeConfiguration.splice(index,1);
        }
    });
}

/**
 * 修改文档
 * @param {WorkspaceEdit} edit
 */
function applyEdit(edit) {
	if (edit) {
		hx.request("workspace.applyEdit", edit.entries());
	}
}

function openTextDocument(uri){
	return hx.request("workspace.openTextDocument",uri);
}

/**
 * 获取当前项目
 * @param {Uri} uri
 */
function getWorkspaceFolder(uri){
	return hx.request("workspace.getWorkspaceFolder",{
	    uri:uri
	});
}

function getWorkspaceFolders() {
	return hx.request("workspace.getWorkspaceFolders");
}

/**
 * @param {String} section
 * @param {ConfigurationScope} scope
 */
function getConfiguration(section, scope) {
	return new configService.Configuration(section, scope);
}

/**
 * 
 * @param {String} uri 
 */
function closeTextDocument(uri) {
	return hx.request("workspace.closeTextDocument", {
		uri: uri
	});
}

module.exports = {
	init: _init,
	fs: {},
	getWorkspaceFolders: getWorkspaceFolders,
    onDidChangeWorkspaceFolders:onDidChangeWorkspaceFolders,
    onDidChangeConfiguration:onDidChangeConfiguration,
	onWillSaveTextDocument: onWillSaveTextDocument,
	onDidChangeTextDocument: onDidChangeTextDocument,
	onDidSaveTextDocument:onDidSaveTextDocument,
    onDidOpenTextDocument:onDidOpenTextDocument,
	openTextDocument:openTextDocument,
	applyEdit: applyEdit,
	getWorkspaceFolder: getWorkspaceFolder,
	getConfiguration: getConfiguration,
	WorkspaceEdit: WorkspaceEdit,
	TextEdit: TextEdit,
	closeTextDocument: closeTextDocument
}
