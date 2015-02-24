module.exports = function(){
    var SequenceGenerator = require('../../src/generator');
    var SequenceStore = require('../../src/store');
    var redisClient = require('./redis');
    var store = new SequenceStore({
        keyPrefix: 'seq:id:',
        redis: redisClient,
        logger: console
    });

    var generator = new SequenceGenerator();
    generator.useLogger(console);
    generator.useStore(store);
    generator.putAll(
        [{
            key: 'ComingRequest',
            initialCursor: 0,
            segment: 1000,
            prebook: 800
        }]
    );
    return generator;
};