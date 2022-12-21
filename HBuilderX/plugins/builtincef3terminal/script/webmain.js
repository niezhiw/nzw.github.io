import * as Terminal from 'xterm/dist/xterm';
import * as fullscreen from 'xterm/dist/addons/fullscreen/fullscreen'; //引入全屏插件，否则的话大小变化时不会刷新
import * as attach from 'xterm/dist/addons/attach/attach';
import * as fit from 'xterm/dist/addons/fit/fit';

//监听鼠标右键执行复制所选文字操作
document.getElementById("terminal").addEventListener('contextmenu', function (e) {
	var on = xterm.getOption("rightClickSelectsWord")
	if (!on && e.button == 2 && !e.ctrlKey && !e.shiftKey && !e.metaKey && !e.altKey)
	{
		if (xterm.hasSelection())
		{
			console.log("copy");
			document.execCommand('copy');
			xterm.clearSelection();
			e.preventDefault();
			e.stopPropagation();
		}
	}
});

Terminal.applyAddon(fullscreen);
Terminal.applyAddon(attach);
Terminal.applyAddon(fit);

const xterm = new Terminal({cols:200, rows:8});
xterm.open(document.getElementById('terminal'));
xterm.toggleFullScreen(true);
xterm.fit();
xterm.focus();
xterm.setOption('cursorBlink',true)//设置光标闪烁
xterm.setOption('cursorStyle','underline')//设置光标样式
xterm.setOption("lineHeight",1.0);

var port = getUrlParms("port");
var id = getUrlParms("id");
var cwd = getUrlParms("cwd");

var fontsize = getUrlParms("fontSize");
if(fontsize != null)
	xterm.setOption("fontSize", fontsize);
var fontfamily = getUrlParms("fontFamily");
if (fontfamily != null)
	xterm.setOption("fontFamily", fontfamily);


const socket = new WebSocket("ws://127.0.0.1:" + port + "?id=" + id + "&cwd=" + cwd);
socket.onopen = runRealTerminal;

function runRealTerminal() {
    xterm.attach(socket, false);	//第二个参数false, 表示不自动发送数据	
}

function getUrlParms(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null)
        return decodeURIComponent(r[2]);
    return null;
}

//通过第一个字符的值标识是按键或者resize
var txtencoder = new TextEncoder();
xterm.on('resize', size => {
	try {
		socket.send(txtencoder.encode("\x01" + JSON.stringify([size.cols, size.rows])));
	} catch (error) {}
});
xterm.on('data', d => {
		try {
			socket.send(txtencoder.encode("\x00" + d));	//手动发送
		} catch (error) { }
	}
);

//监听ctrl+c ctrl+v按键
xterm.attachCustomKeyEventHandler(
	function (d) {
		if (d.ctrlKey && !d.shiftKey && !d.altKey)
		{
			if (d.keyCode == 67 && xterm.hasSelection())
			{
				document.execCommand('copy');
				return false;
			}
			if (d.keyCode == 86)
			{
				document.execCommand('paste');
				return false;
			}
		}
		return true;
	}
);


function resize(){//重定义大小
	var terminalDiv = document.getElementById("terminal");
	terminalDiv.style.width = document.documentElement.clientWidth + "px";
	terminalDiv.style.heigth = document.documentElement.clientHeight + "px";
	xterm.fit();
}

function setTheme(theme,isfocus){//设置皮肤
	if(theme =='default'){
			xterm.setOption("theme", {
				"background":"#FFFCF3",
				"foreground":"#444444",
				"selection": "rgba(188,214,141, 0.4)",
				"cursor":"#41A863",
				"yellow":"#657B83",
				"brightYellow":"#657B83"
			});
		__changestyle__(theme);//修改滚动条样式
		}else if(theme =='black'){
			xterm.setOption("theme", {
				"background":"#666666",
				"foreground":"#FFFFFF",
				"selection": "rgba(188,214,141, 0.4)",
				"cursor":"white",
				"black":"#333333",
				"blue":"#6A7EC8",
				"brightBlack":"#666666",
				"brightBlue":"#819aff",
				"brightCyan":"#66D9EF",
				"brightGreen":"#A6E22E",
				"brightMagenta":"#AE81FF",
				"brightRed":"#ffbc86",
				"brightWhite":"#f8f8f2",
				"brightYellow":"#e2e22e",
				"cyan":"#56ADBC",
				"green":"#86B42B",
				"magenta":"#8C6BC8",
				"white":"#e3e3dd",
				"yellow":"#B3B42B",
				"red":"#ffbc86"
			});
			__changestyle__(theme);//修改滚动条样式
		} else{
			var themeObj = JSON.parse(theme);
			xterm.setOption("theme", {
			"background":themeObj.background,
			"black":themeObj.black,
			"blue":themeObj.blue,
			"brightBlack":themeObj.brightBlack,
			"brightBlue":themeObj.brightBlue,
			"brightCyan":themeObj.brightCyan,
			"brightGreen":themeObj.brightGreen,
			"brightMagenta":themeObj.brightMagenta,
			"brightRed": themeObj.brightRed,
			"brightWhite": themeObj.brightWhite,
			"brightYellow": themeObj.brightYellow,
			"cursor":themeObj.cursor,
			"cursorAccent": themeObj.cursorAccent,
			"cyan": themeObj.cyan,
			"foreground": themeObj.foreground,
			"green": themeObj.green,
			"magenta" : themeObj.magenta,
			"red": themeObj.red,
			"selection": themeObj.selection,
			"white" : themeObj.white,
			"yellow" :themeObj.yellow
				});
			__changestyle_new__(themeObj.background,themeObj.scrollHoverBackground);//修改滚动条样式
		}

	if(isfocus){
		xterm.focus()
	}else{
		xterm.blur()
	}
	// xterm.refresh(0,xterm.rows-1)
	xterm.fit();
	// xterm.blur();
}


function writecmd(cmd){//暴露向终端写入方法，供HX静默调用
	if(xterm.getSelection().trim()==''){
		xterm.emit('data',cmd);
	}else{
		return xterm.getSelection();
	}
	xterm.focus()
}

setTheme(getUrlParms("theme"),true);
resize()


window.writecmd = writecmd;
window.setTheme = setTheme;
window.onresize = resize;
//
// xterm.on('data', (data) => {
// 	xterm.write(data);
// });
