const hx = require("../hbxBridge.js")
const metatypes = require("./metatypes.js");

function Selection(options){
	this.active = options.active;
	this.anchor = options.anchor;
	this.start = Math.min(options.active,options.anchor);
	this.end = Math.max(options.active,options.anchor);
	this.isEmpty = function(){
		return this.active === this.anchor;
	}
}
Selection.prototype.metatype = "Selection";

function TextDocument(options){
    this.fileName = options.fileName;
    this.isDirty = options.isDirty;
    this.isUntitled = options.isUntitled;
    this.languageId = options.languageId;
    this.lineCount = options.lineCount;
    this.uri = new hx.Uri(options.uri.scheme,options.uri.authority,
                            options.uri.path,options.uri.query,options.uri.fragment);
    this.workspaceFolder = metatypes.newObject(options.workspaceFolder);
    
    /**
     * 文档内容
     */
    let _text = options.text;
    
    this.getText = function(range){
        if(range){
			if(range.end > _text.length){
				throw new Error("End postion is larger than document length !");
			}
			return _text.substring(range.start,range.end);
        }
        return _text;
    }
	
	this.lineAt = function(lineNum){
		let docId = this.uri.fsPath ? this.uri.fsPath : this.uri.toString();
		return hx.request("textDocument.lineAt",{
			lineNum:lineNum,
			docId:docId
		});
	}
	
	this.lineFromPosition = function(pos){
        if(typeof pos !== "number"){
            console.error("参数无效：参数pos类型不是期望的number类型。");
            return ;
        }
		let docId = this.uri.fsPath ? this.uri.fsPath : this.uri.toString();
		return hx.request("textDocument.lineFromPosition",{
			pos:pos,
			docId:docId
		});
	}
}
TextDocument.prototype.metatype = "TextDocument";
function TextEdit(range, newText) {
	this.range = range;
	this.newText = newText;
}

TextEdit.replace = function(range, newText) {
	let replaceRange = range;
	if(typeof range === 'number'){
		replaceRange = {
			start:range,
			end:range
		}
	}else if(range.metatype && range.metatype === 'Selection'){
		replaceRange = {
			start:range.start,
			end:range.end
		}
	}
	return new TextEdit(replaceRange, newText);
}

function TextEditorEdit(){
	let edits = [];
	this.delete = function(range){
		edits.push(TextEdit.replace(range,''));
	}
	
	this.insert = function(pos,value){
		edits.push(TextEdit.replace(pos,value));
	}
	
	this.replace = function(pos,value){
		edits.push(TextEdit.replace(pos,value));
	}
	
	this.getEdits = function(){
		return edits;
	}
}

function TextEditor(options){
	this.selection = new Selection(options.selection);
	this.selections = [];
	if(options.selections){
		for(let i = 0;i < options.selections.length;i++){
			this.selections.push(new Selection(options.selections[i]));
		}
	}
	this.document = new TextDocument(options.document);
	this.options = options.options;
    function getEditorId(){
        let uriKey = this.document.uri;
        if(typeof uriKey !== "string"){
            if(uriKey.fsPath){
                uriKey = uriKey.fsPath;
            }else{
                uriKey = uriKey.toString();
            }
        }
        return uriKey;
    }
    
	this.edit = function(callback){
		let editBuilder = new TextEditorEdit();
		callback(editBuilder);
		let edits = editBuilder.getEdits();
		if (edits && edits.length > 0) {
			let uriKey = getEditorId.apply(this) ;
			let applyEdits = {};
			applyEdits[uriKey] = edits;
			hx.request("workspace.applyEdit",applyEdits);
		}
	}
    
    this.setSelection = function(active,anchor){
        return hx.request("texteditor.setSelection",{
            editorId:getEditorId.apply(this),
            active:active,
            anchor:anchor
        });
    }
    this.addSelection = function(active,anchor){
        return hx.request("texteditor.addSelection",{
            editorId:getEditorId.apply(this),
            active:active,
            anchor:anchor
        });
    }
}
TextEditor.prototype.metatype = "TextEditor";

metatypes.registerObject(TextDocument.prototype.metatype,TextDocument);
metatypes.registerObject(TextEditor.prototype.metatype,TextEditor);
metatypes.registerObject(Selection.prototype.metatype,Selection);
metatypes.registerObject("TextDocumentWillSaveEvent",function(options){
	this.document = new TextDocument(options.document);
	this.reason = 1;
});
metatypes.registerObject("TextDocumentChangeEvent",function(options){
	this.document = new TextDocument(options.document);
	this.contentChanges = [];
});
metatypes.registerObject("Uri", function(options){
	return new hx.Uri(options.scheme,options.authority,
		options.path,options.query,options.fragment);
});
module.exports = {
	Selection:Selection,
	TextDocument:TextDocument,
	TextEditor:TextEditor,
	TextEdit:TextEdit
}