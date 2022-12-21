const net = require('net');

let connection;
function _init(_connection){
    connection = _connection;
    if(!connection){
        console.error("严重的错误：进程间通讯服务初始化失败。");
    }
	
	connection.onNotification("startHeartbeat",function(pid){
		//开始心跳检测
		_startHeartbeat(pid);
	});
    const pluginMgr = require("./pluginmanager.js");
	pluginMgr.init(_connection);
	
    const commandMgr = require("./api/commandmanager.js");
	commandMgr.init(_connection);
	
	const win = require("./api/workbenchwindow.js");
	win.init(_connection);
	
	const ws = require("./api/workspace.js");
	ws.init(_connection);
	
	const languages = require("./api/languages.js");
	languages.init(_connection);
    
	const snippets = require("./services/SnippetService.js")
	snippets.init(_connection);
    
    const env = require("./api/env.js");
    env.init(_connection);

   //  const debug = require("./api/debug.js");
   // debug.debug.init(_connection);

}

function _request(method,params){
    //console.error("request " + method + " with params :" + JSON.stringify(params));
    return connection.sendRequest(method, params);
}

function _notifyEvent(event,data){
    connection.sendNotification(event, data);
}

function _onRequest(method,handler){
    connection.onRequest(method,handler);
}

function _onNotify(event,handler){
    connection.onNotification(event,handler);
}

function _qDebug(log) {
    connection.sendRequest("workbench.log", {
        level: "debug",
        log: log
    });
}
function _notifyStarted(){
    connection.sendNotification("started", true);
}

function _startHeartbeat(pid){
    var count = 0;
    function heartbeat(){
        var client = new net.Socket();
        client.connect(pid, function(){
            count = 0;
            client.destroy();
            setTimeout(heartbeat, 2000);
        });
        client.on('error',function(error){
            if(error.code === 'ENOENT'
                || error.code === 'ECONNREFUSED'){
                count++;
            }
			//只允许失败一次
            if(count > 1){
                process.exit(999);
            }else{
                setTimeout(heartbeat, 2000);
            }
        });
    }
    setTimeout(heartbeat, 2000);
}

let HBXProxy = {
    get: function(target, name) {
        if (name in target) {
            return target[name];
        }
        
        let getProperty = {
            window: function() {
                let win = require("./api/workbenchwindow.js");
                return win;
            },
            workspace:function(){
                let ws = require("./api/workspace.js");
                return ws;
            },
            commands:function(){
                let commands = require("./api/commandmanager.js");
                return commands;
            },
            languages:function(){
                let languages = require("./api/languages.js");
                return languages;
            },
            WorkspaceEdit:function(){
                let ws = require("./api/workspace.js");
                return ws.WorkspaceEdit
            },
            TextEdit:function(){
                let ws = require("./api/workspace.js");
                return ws.TextEdit
            },
            Uri: function() {
                let ws = require("./api/uri.js");
                return ws.default;
            },
            env :function(){
                let env = require("./api/env.js");
                return env;
            },
            //debug:function(){
            //    let debug = require('./api/debug.js');
             //   return debug.debug;
           // },
            EventEmitter: function() {
                let ws = require("./api/event.js");
                return ws.Emitter;
            },
            TreeDataProvider:function(){
                let treeModule = require("./api/treeview.js");
                return treeModule.TreeDataProvider;
            }
        }
        if (name in getProperty) {
            let prop = getProperty[name]();
            //缓存下类型
            target[name] = prop;
            return prop;
        }
        return undefined;
    }
}

const hx = new Proxy({
    init:_init,
    qDebug:_qDebug,
    notifyStarted:_notifyStarted,
    request:_request,
    notifyEvent:_notifyEvent,
    onRequest:_onRequest,
    onNotify:_onNotify
},HBXProxy);

module.exports = hx;
