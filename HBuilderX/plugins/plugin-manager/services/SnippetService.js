var fs = require('fs');
var path = require('path');
var snippet = require("./snippet/snippet").CodeSnippet;
var SnippetVariablesResolver = require('./snippet/snippetVariables').SnippetVariablesResolver;

function _init(conn){
	conn.onRequest("snippet/parse",function(snippet_path){
		if (!fs.existsSync(snippet_path)) {
		    return {};
		}
		var contents = fs.readFileSync(snippet_path, 'latin1');
		var codeSnippet = snippet.fromTextmate(contents, new SnippetVariablesResolver());
		return codeSnippet;
	});
}
module.exports = {
	init:_init
};