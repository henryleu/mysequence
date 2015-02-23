var util = require('util');
var SequenceRegistry = function(){};

SequenceRegistry.prototype.initRegistry = function(){
    this.registry = {};
};

SequenceRegistry.prototype.setBuilder = function(builder){
    this.builder = builder;
};

SequenceRegistry.prototype.getBuilder = function(){
    return this.builder;
};

SequenceRegistry.prototype.putAll = function(configs){
    if(!require('util').isArray(configs)){
        throw new Error('parameter configs should be an array of sequence object configuration');
    }
    for(var i=0; i<configs.length; i++){
        var config = configs[i];
        this.put(config);
    }
};

SequenceRegistry.prototype.put = function(config){
    var key = config.key;
    if(this.registry[key]){
        throw new Error('Duplicated sequence object for the key of ' + key);
    }
    else{
        this.registry[key] = this.builder.build({
            registry: this,
            config: config
        });
    }
};

SequenceRegistry.prototype.get = function(key){
    return this.registry[key];
};

module.exports = SequenceRegistry;
