/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var SnippetVariablesResolver = (function () {
	function SnippetVariablesResolver() { }
    function formatIntegerToString(indata, width){
        if(('' + indata).length >= width) return '' + indata;
        var tmp = '0'.repeat(width) + indata;
        return tmp.substring(tmp.length - width, tmp.length)
    }

	SnippetVariablesResolver.prototype.resolve = function (name) {
		switch (name) {
			case 'SELECTION':
			case 'TM_SELECTED_TEXT': return this._tmSelectedText();
			case 'TM_CURRENT_LINE': return this._tmCurrentLine();
			case 'TM_CURRENT_WORD': return this._tmCurrentWord();
			case 'TM_LINE_INDEX': return this._tmLineIndex();
			case 'TM_LINE_NUMBER': return this._tmLineNumber();
			case 'TM_FILENAME': return this._tmFilename();
			case 'TM_DIRECTORY': return this._tmDirectory();
			case 'TM_FILEPATH': return this._tmFilepath();
            case 'DATE_TIME':    return new Date().toLocaleString();
            case 'y': case 'Y':    return formatIntegerToString((new Date()).getFullYear(), 4);
            case 'mon': case 'MON':    return formatIntegerToString((new Date()).getMonth() + 1, 2);
            case 'mon1': case 'MON1':    return formatIntegerToString((new Date()).getMonth() + 1, 1);
            case 'd': case 'D':    return formatIntegerToString((new Date()).getDay(), 2);
            case 'd1': case 'D1':    return formatIntegerToString((new Date()).getDay(), 1);
            case 'h': case 'H':    return formatIntegerToString((new Date()).getHours(), 2);
            case 'h1': case 'H1':    return formatIntegerToString((new Date()).getHours(), 1);
            case 'm': case 'M':    return formatIntegerToString((new Date()).getMinutes(), 2);
            case 'm1':case 'M1':    return formatIntegerToString((new Date()).getMinutes(), 1);
            case 's': case 'S':    return formatIntegerToString((new Date()).getSeconds(), 2);
            case 's1': case 'S1':    return formatIntegerToString((new Date()).getSeconds(), 1);
		}


		return undefined;
	};
	SnippetVariablesResolver.prototype._tmCurrentLine = function () {
		return "todo_tmCurrentLine";
	};
	SnippetVariablesResolver.prototype._tmCurrentWord = function () {
		return "todo_tmCurrentWord";
	};
	SnippetVariablesResolver.prototype._tmFilename = function () {
		return "todo_tmFilename";
	};
	SnippetVariablesResolver.prototype._tmDirectory = function () {
		return "todo_tmDirectory";
	};
	SnippetVariablesResolver.prototype._tmFilepath = function () {
		return "todo_tmFilepath";
	};
	SnippetVariablesResolver.prototype._tmLineIndex = function () {
		return "todo_tmLineIndex";
	};
	SnippetVariablesResolver.prototype._tmLineNumber = function () {
		return "todo_tmLineNumber";
	};
	SnippetVariablesResolver.prototype._tmSelectedText = function () {
		return "todo_tmSelectedText";
	};
	return SnippetVariablesResolver;
}());
exports.SnippetVariablesResolver = SnippetVariablesResolver;
//# sourceMappingURL=snippetVariables.js.map
