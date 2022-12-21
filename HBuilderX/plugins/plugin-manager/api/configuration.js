const hx = require("../hbxBridge.js")

const $globalConfiguration = {
    "user":{}
};
module.exports.init = function(connection){
	connection.onRequest("workspace/syncGlobalConfigurations",function(globalConfiguration){
		if(globalConfiguration["default"]){
			$globalConfiguration["default"] = globalConfiguration["default"];
		}
		
		if(globalConfiguration["user"]){
			$globalConfiguration["user"] = globalConfiguration["user"]
		}
        
        if(globalConfiguration["extensionDefault"]){
            $globalConfiguration["extensionDefault"] = globalConfiguration["extensionDefault"]
        }
	});
}

module.exports.Configuration = function(_section,_scope){
	let section = _section;
	let scope = _scope;
	
	function getFullSection(_section){
		if(section !== undefined){
			_section = section + "." + _section;
		}
		return _section;
	}
	
	this.get = function(section,defaultValue){
		let key = getFullSection(section);
		if($globalConfiguration["user"] && $globalConfiguration["user"].hasOwnProperty(key)){
			return $globalConfiguration["user"][key];
		}
		if($globalConfiguration["default"] && $globalConfiguration["default"].hasOwnProperty(key)){
			return $globalConfiguration["default"][key];
		}
        if($globalConfiguration["extensionDefault"] && $globalConfiguration["extensionDefault"].hasOwnProperty(key)){
        	return $globalConfiguration["extensionDefault"][key];
        }
		return defaultValue;
	}
	
	this.update = function(section,value){
		let key = getFullSection(section);
        let result = new Promise((resolve, reject) => {
        	hx.request("configuration.update",{
                section:key,
                value:value
            }).then((success)=>{
        		if(success){
                    $globalConfiguration["user"][key] = value;
                }
        		resolve(success);
        	},reject);
        });
        return result;
	}
}