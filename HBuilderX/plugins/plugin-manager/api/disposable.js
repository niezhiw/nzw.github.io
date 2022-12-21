module.exports = function(callOnDispose){
	this.dispose = function(){
		callOnDispose();
	}
}