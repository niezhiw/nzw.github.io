const os = require('os');
const pty = require('node-pty');
const fs = require("fs");
const net = require('net');
const WebSocket = require('ws');
const { URLSearchParams } = require('url');

process.stdin.setEncoding('utf8');

var port = process.argv.length>3 ? process.argv[3] : "48080";

const wss = new WebSocket.Server({ port: port, host: "127.0.0.1" });
var isWin = os.platform() === 'win32';
// var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
var shell;
if(isWin){
	shell = 'powershell.exe';
	var osRelease = os.release();
	var dotIndex = osRelease.indexOf('.');
	if(dotIndex>0){
		var fv = osRelease.substring(0,dotIndex);
		if(fv>6){
			shell = 'powershell.exe';
		}else{
			shell = 'cmd.exe';
			var ov = osRelease.substring(dotIndex);
			dotIndex = ov.indexOf('.');
			if(dotIndex>0){
				var sv = ov.substring(0,dotIndex);
				if(sv>1){
					shell = 'powershell.exe';
				}
			}
		}
	}
}else{
	shell = 'bash';
}
// 下面这行日志不能删除，用于判断是否为powershell
console.log("powershell:"+(shell=='powershell.exe'));
var terminals = {};
var commands = {};

wss.on('connection', function(ws, req) {
	try{
		var params = new URLSearchParams(req.url.substr(1)),
			id = params.get('id'),
			cwd = decodeURIComponent(params.get('cwd'));
		var term = pty.spawn(shell, [], {
				name: 'xterm-color',
				cols: 120,
				rows: 8,
				cwd: cwd,
				env: process.env
			});
		
		var inited = false;
		terminals[id] = term;
		term.on('data', function(data) {
			try {
                console.log("hbuilderx:"+id+":"+data);//此日志不能删除，vue项目需要解析日志获取url
				ws.send(data);
				if (!inited)
				{
					inited = true;
					term.resize(120, 8);	//降低首次显示不全频率
				}
			} catch (ex) {
			}
		});
		ws.on('message', function(msg) {	//处理客户端发送过来的数据
            console.log("hbuilderx:"+id+":"+msg);//此日志不能删除，vue项目需要解析日志获取url
			data = msg;
			switch (data[0]) {
				case 0:
					term.write(data.slice(1));	//按键数据
					break;
				case 1:
					sizeobj = JSON.parse(data.slice(1));	//reisze数据
					if (inited)
						term.resize(120, sizeobj[1]);
					break;
			}
		});
		ws.on('close', function () {
			if(terminals[id]){
				term.kill();
				delete terminals[id];
				delete commands[id];
				console.log('close terminal ' + id);
			}
		});
		
		if(commands[id]){
			term.write(commands[id]);
			delete commands[id];
		}
	}catch(e){
		console.error(e);
	}

});

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
		var strs = chunk.toString().split('|');
		if(strs.length<2){
			return;
		}
		var flag = strs[0],
			id = strs[1],
			term = terminals[id];
		if(id.length===0){
			return;
		}
		if(flag === 'stop'){
			term && term.kill();
			delete terminals[id];
			if(Object.getOwnPropertyNames(terminals).length===0){
				console.log('terminals is empty, exit');
				process.exit();
			}
		}else if(flag === 'write'){
			if(strs.length >=3){
				var command = strs.slice(2).join('|');
				term?term.write(command):commands[id]=command;
			}
		}
    }
});

if(process.argv.length>2){
	var localServer = process.argv[2];
	var count = 0;
	function checkMain() {
		var client = new net.Socket();
		client.connect(localServer, function () {
			count = 0;
			client.destroy();
			setTimeout(checkMain, 2000);
		});
		client.on('error', function (error) {
			if(error.code === 'ENOENT'){
				count++;
			}
			if(count>=2){
				console.error(error);
				console.log('connect lockserver faild, exit');
				process.exit();
			}else{
				setTimeout(checkMain, 2000);
			}
		});
	}
	setTimeout(checkMain, 2000);
}
