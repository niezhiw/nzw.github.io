const hx = require("../hbxBridge.js");

WebView = class{
    constructor(id) {
        this._id = id;
        this._msgListeners = [];
        this._html = ""
    }
    get id() {
        return this._id;
    }
    
    set html(content){
        this._html = content;
        hx.request("webviewpanel.refresh", this._id);
    }

    get html(){
        return this._html;
    }

    postMessage(params){
        let message = {viewId: this._id, message: params};
        hx.request("webviewpanel.postMessage", message);
    }

    onDidReceiveMessage(listener){
        this._msgListeners.push(listener);
    }

    dispatchMessage(msg){
        for (let i = 0; i < this._msgListeners.length; i++) {
            let listener = this._msgListeners[i];
            if (listener) {
                listener(msg);
            }
        }
    }
}

WebViewPanel = class{
    constructor(id, options) {
        this._viewId = id;
        this._webView = new WebView(id);
        this._options = options;
    }

    get viewId(){
        return this._viewId;
    }

    get webView(){
        return this._webView;
    }

    get options(){
        return this._options;
    }

    dispose(){
        hx.request("webviewpanel.close", this._viewId);
    }
}

module.exports = WebViewPanel;