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
    generator.useDefaults({
        key: 'global',
        initialCursor: 0,
        segment: 20000,
        prebook: 10000
    });

    generator.putAll(
        [{
            key: 'ComingRequest',
            initialCursor: 0,
            segment: 10,
            prebook: 2
        },{
            key: 'TravelTarget',
            initialValue: 2,
            segment: 10,
            prebook: 2
        }]
    );
    return generator;
};