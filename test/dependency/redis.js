var settings = {
    host: '127.0.0.1',
    port: 6379
};
var logger = console;
var redis = require("redis");
var redisClient = redis.createClient(settings.port, settings.host, {} );

var infolog = function (msg) {
    return function() {
        logger.info(msg, arguments);
    }
};
var warnlog = function (msg) {
    return function() {
        logger.warn(msg, arguments);
    }
};
var errorlog = function (msg) {
    return function() {
        logger.error(msg, arguments);
    }
};

var url = 'redis://' + redisClient.address;
//redisClient.on('connect'     , infolog('Redis is connecting to ' + url));
//redisClient.on('ready'       , infolog('Redis is ready'));
//redisClient.on('reconnecting', warnlog('Redis is reconnecting to ' + url));
//redisClient.on('error'       , errorlog('Redis error happens'));
//redisClient.on('end'         , infolog('Redis is ended'));

module.exports = redisClient;
