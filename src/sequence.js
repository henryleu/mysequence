var _extend = function(obj, source) {
    for (var prop in source) {
        obj[prop] = source[prop];
    }
    return obj;
};

var STATUS = {
    blank: 'blank',
    booked: 'booked',
    overflowing: 'overflowing'
};
var ACTION = {
    initialBook: 'initialBook',
    book: 'book'
};

/**
 *  SequenceObject
 */
var SequenceObject, so;
SequenceObject = so = function(o){
    this.registry = o.registry;
    this.config = o.config;
    this.store = this.registry.store;
    this.logger = this.registry.logger;

    this.state = {};
    this.state.key = this.config.key;
    this.state.segment = this.config.segment;
    this.state.prebook = this.config.prebook;
    this.state.initialCursor = this.config.initialCursor;

    this.state.cursor = null;
    this.state.valve = null;
    this.state.prebookValve = null;
    this.state.nextValve = null;

    this.state.status = STATUS.blank;
    this.state.ready = false;
    this.state.actioning = false;
};
so.STATUS = STATUS;
so.ACTION = ACTION;
so.build = function(o){
    var config = _extend({}, so.defaults);
    o.config = _extend(config, o.config);
    return new so(o);
};

so.prototype.init = function(cb){
    var seq = this;
    this.store.book(this.state, function(action){
        seq.update(action);
        cb(action.successful);
    });
};

so.prototype.book = function(){
    var seq = this;
    this.store.book(this.state, function(action){
        seq.update(action);
    });
};

so.prototype.update = function(action){
    if(action.successful){
        if(action.name==ACTION.initialBook){
            this.state.cursor = this.config.initialCursor;
            this.state.valve = action.valve;
            this.state.prebookValve = this.state.cursor + this.config.prebook;
            this.state.nextValve = null;
        }
        else{
            if(this.state.status==STATUS.blank || this.state.status==STATUS.overflowing ){
                this.state.cursor = action.valve - this.config.segment;
                this.state.valve = action.valve;
                this.state.prebookValve = this.state.cursor + this.config.prebook;
                this.state.nextValve = null;
            }
            else{
                this.state.nextValve = action.valve;
            }
        }
        this.state.ready = true;
        this.state.status = STATUS.booked;
        this.logger.info('Process ' + process.pid + ': The sequence [' + this.state.key + '] successfully booked a new valve ' + action.valve);
    }
    else{
        if(action.name==ACTION.initialBook){
            this.state.ready = false;
        }
        else{
            //leave state as it was
        }
        this.logger.warn('Process ' + process.pid + ': The sequence [' + this.state.key + '] failed to book a new valve. ' +
            'And currently, its valve is ' + this.state.valve + ', and its cursor is ' + this.state.cursor);
    }
    this.state.actioning = false;
};
so.prototype.check = function(){
    if(this.state.status==STATUS.booked){
        if(!this.state.nextValve){
            if(this.state.cursor < this.state.prebookValve){
                //Do nothing
            }
            else if(this.state.cursor < this.state.valve){
                this.book();
            }
            else{
                this.onOverflow();
                this.book();
            }
        }
        else{
            if(this.state.cursor < this.state.valve){
                //Do nothing
            }
            else if(this.state.cursor == this.state.valve){
                this.onStep();
            }
            else{
                this.logger.warn('Process ' + process.pid + ': The sequence [' + this.state.key + '] is in a illegal status ' + this.state.status);
                this.onOverflow();
                this.book();
            }
        }
    }
    else if(this.state.status==STATUS.overflowing){
        if(!this.state.nextValve){
            this.book();
        }
        else{
            this.onStep();
        }
    }
    else{
        this.logger.error('unknown status: ' + this.state.status);
        this.book();
    }
};
so.prototype.onStep = function(){
    this.logger.info('Process ' + process.pid + ': The sequence [' + this.state.key + '] stepped in status ' + this.state.status);
    this.state.cursor = this.state.nextValve - this.config.segment;
    this.state.valve = this.state.nextValve;
    this.state.prebookValve = this.state.cursor + this.config.prebook;
    this.state.nextValve = null;
};
so.prototype.onOverflow = function(){
    this.logger.info('Process ' + process.pid + ': The sequence [' + this.state.key + '] is ' + STATUS.overflowing);
    this.state.status = STATUS.overflowing;
    var base = (new Date().getTime())*1000;
    this.state.cursor = base;
    this.state.valve = base + this.config.segment;
    this.state.nextValve = null;
    this.logger.warn('Process ' + process.pid + ': overflow value ' + this.state.cursor);
};
so.prototype.next = function(){
    if(this.state.ready){
        this.val = this.state.cursor++;
        ////debug
        //if(this.val>10000000){
        //    console.error('Process ' + process.pid + ': overflowed value: ' + this.val);
        //}
        this.check();
        return this;
    }
    else{
        throw new Error('Process ' + process.pid + ': The sequence [' + this.state.key + '] is not ready for generating value');
    }
};

module.exports = so;
