const hx = require("../hbxBridge.js");

let _appName,_appRoot,_appData,_appVersion;

function init(conn){
    conn.onRequest("env/syncInfos",function(infos){
        console.log("appInfos",JSON.stringify(infos))
        _appName = infos.appName;
        _appRoot = infos.appRoot;
        _appData = infos.appData;
        _appVersion = infos.appVersion;
    });
}
const clipboardInstance = {
    readText:function(){
        return hx.request("clipboard.readText");
    },
    writeText:function(value){
        return hx.request("clipboard.writeText",value);
    }
}

function openExternal(url){
    let urlvalue = url;
    if(typeof url !== 'string'){
        urlvalue = url.toString();
    }
    return hx.request("env.openExternal",urlvalue);
}

let envApi = new Proxy({
    init:init,
    clipboard:clipboardInstance,
    openExternal:openExternal
},{
    get:function(target,name){
        if (name in target) {
            return target[name];
        }
        let proxyInfo = {
            appName:_appName,
            appRoot:_appRoot,
            appVersion:_appVersion,
            appData:_appData
        }
        if(name in proxyInfo){
            return proxyInfo[name];
        }
    }
});

module.exports = envApi;