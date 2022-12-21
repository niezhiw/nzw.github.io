const hbx = require("../hbxBridge.js")
module.exports.OutputChannel = function(name){
	this.name = name;
	this.show = function(){
		return hbx.request("window.showOutputView");
	}
	
	this.appendLine = function(line){
		let channelName = this.name;
		return hbx.request("output.appendLine",{
			channel:channelName,
			line:line
		});
	}
}