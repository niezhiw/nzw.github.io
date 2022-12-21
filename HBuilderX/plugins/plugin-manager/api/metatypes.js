let constructors = {}
module.exports = {
	newObject:function(obj){
		if(!obj){
			return undefined;
		}
		if(!obj.metatype){
			return obj;
		}
		if(obj.metatype in constructors){
			return new constructors[obj.metatype](obj);
		}
		return obj;
	},
	registerObject:function(metatype,constructor){
		constructors[metatype] = constructor;
		constructor.prototype.metatype = metatype;
	}
}