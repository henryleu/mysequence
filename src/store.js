var ACTION = require('./sequence').ACTION;
var SequenceStore = function(o){
    this.logger = o.logger;
    this.redis = o.redis;
    this.keyPrefix = o.keyPrefix;
};

SequenceStore.prototype.book = function(state, callback){
    var redis = this.redis;
    var logger = this.logger;
    var redisKey = state.redisKey || (state.redisKey = this.keyPrefix + state.key);

    /**
     * Make sure only one book action is executing.
     */
    if(state.actioning){
        return;
    }
    else{
        state.actioning = true;
    }

    redis.watch(redisKey);
    redis.get(redisKey, function(err, oldValve){
        if(err){
            logger.error('Process ' + process.pid + ': Fail to  get sequence value: ' + err.message);
            callback({
                successful: false,
                name: state.ready ? ACTION.book : ACTION.initialBook
            });
            redis.unwatch();
            return;
        }

        var multi = redis.multi();
        var newValve = null;
        var actionName = null;

        logger.info('Process ' + process.pid + ': Before booking, the sequence [' + state.key + ']\'s redis key [' + redisKey + ']\'s value is ' + oldValve);
        if(!oldValve){
            actionName = ACTION.initialBook;
            newValve = state.initialCursor + state.segment;
            multi.set(redisKey, newValve);
        }
        else {
            actionName = ACTION.book;
            newValve = Number(oldValve) + state.segment;
            multi.incrby(redisKey, state.segment);
        }
        multi.exec(function(err, result){
            if(err){
                logger.warn('Process ' + process.pid + ': Fail to book sequence value: ' + err.message);
                callback({
                    successful: false,
                    name: actionName
                });
            }
            else{
                if(result){
                    newValve = result=='OK' ? newValve : result;
                    logger.info('Process ' + process.pid + (result=='OK' ? ' set ' : ' incrby ') + redisKey + ' ' + newValve);
                    callback({
                        successful: true,
                        name: actionName,
                        valve: newValve
                    });
                }
                else{
                    logger.warn('Process ' + process.pid + ' conflicts to update ' + redisKey);
                    callback({
                        successful: false,
                        name: actionName
                    });
                }
            }
        });
    });
};

module.exports = SequenceStore;
