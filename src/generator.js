var util = require('util');
var async = require('async');
var SequenceRegistry = require('./registry');
var SequenceObject = require('./sequence');

var _extend = function(obj, source) {
    for (var prop in source) {
        obj[prop] = source[prop];
    }
    return obj;
};

var SequenceGenerator, sg;
SequenceGenerator = sg = function(){
    this.initRegistry();
    this.setBuilder(SequenceObject);
};
util.inherits(SequenceGenerator, SequenceRegistry);

sg.prototype.useLogger = function(logger){
    this.logger = logger;
};

sg.prototype.useStore = function(store){
    this.store = store;
};

sg.prototype.useDefaults = function(defaults){
    this.defaults = _extend({}, {
        key: 'global',
        initialCursor: 0,
        segment: 20000,
        prebook: 10000
    });
    _extend(this.defaults, defaults);
    this.getBuilder().defaults = this.defaults;
};

sg.prototype.next = function(key){
    var so = this.registry[key];
    if(so){
        return so.next();
    }
    else{
        throw new Error('Process ' + process.pid + ': Sequence [' + key + '] is not registered');
    }
};

sg.prototype.init = function(callback){
    var sequences = [];
    var registry = this.registry;
    var limit = 3;
    var times = 0;
    for(var key in registry){
        var so = registry[key];
        sequences.push(so);
    }
    function startup(){
        if(++times>limit) {
            callback(false);
            return;
        }
        console.info('Process ' + process.pid + ': Sequences are initialized for the %d times', times);
        require('async').map(
            sequences,
            function(item, cb){
                item.init(function(status){
                    cb(null, {
                        key: item.state.key,
                        status: status
                    });
                });
            },
            function(err, results){
                sequences.splice(0,sequences.length); //clear array
                for(var i=0; i<results.length; i++){
                    var item = results[i];
                    if(!item.status){
                        sequences.push(registry[item.key]);
                    }
                }
                if(sequences.length==0){
                    callback(true);
                }
                else{
                    startup();
                }
            }
        );
    }
    startup();
};

module.exports = sg;
