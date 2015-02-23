# node-sequence

A nodejs sequence generator which generate unique sequential numbers as user-assigned ids for your records/documents.

There are five reasons to use **mysequence** to generate sequences as ids/keys for your records/documents by application itself.
- **Independent**: Data model and persistence layer are independent of Oracle sequence, mysql increment, and Mongodb ObjectId
- **Fastest**: it is faster than Oracle sequence, mysql auto increment, UUID, and Hibernate hex table.
- **Unique**: UUID and Hibernate cannot guarantee unique ids in cluster env.
- **Proactive**: You know your new record id before you create it, so you can use it in frontend layer proactively.
- **Reliable**: Persistently provide unique sequences as ids for your app in cluster deployment.

You can deploy it as an id generating service in/with application code together.

This sequence generator inspired from the design pattern of sequence in peaa (Patterns of Enterprise Application Architecture) by Martin Fowler, the famous OOP master.

## Installation

**mysequence** need **redis** as store, by default, but you could also customize your own store.
```javascript
npm install mysequence

```

## Quick Start

```javascript
    var SequenceGenerator = require('mysequence').SequenceGenerator;
    var SequenceStore = require('mysequence').SequenceStore;
    var redisClient = require('./redis');
    var store = new SequenceStore({
        keyPrefix: 'seq:id:',
        redis: redisClient,
        logger: console
    });

    var generator = new SequenceGenerator();
    generator.useLogger(console); //set logger here, or just use console as logger
    generator.useStore(store);    //set store here, here we use default redis store

    /*
     * set default sequence config in case of client don't config it.
     */
    generator.useDefaults({
        initialCursor: 0, //default start number for a new sequence
        segment: 20000,   //default segment width which a sequence apply once
        prebook: 18000    //default prebook point when a sequence start to apply a segment in advance
    });

    /**
     * put each of sequence config here
     */
    generator.putAll(
        [{
            key: 'Employee', //the sequence's name which is store in redis.
            initialCursor: 0,     //the sequence's initial value to start from
            segment: 100,         //a number width to increase before sequence touch the segment end.
            prebook: 60           //It means when to book segment. the value is normally
                                  //between half segment (50) and near segment end (90).
        },{
            key: 'User',
            //initialValue: 100,  //by default, use 0
            //segment: 1000,      //by default, use 20000
            //prebook: 500        //by default, use 18000
        }]
    );

    /*
     * Invoke #init method to initialize/sync all sequence to store(redis) until callback
     * is invoked with true parameter.
     */
    generator.init(function(result){
        if(!result){
            throw new Error('generator is not ready');
        }
        var so = generator.get('Employee'); //get a ready sequence object.
        console.log(so.next().val); //get and output a new sequence number
        console.log(so.next().val); //get and output a another sequence number
    });
```