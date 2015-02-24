## mysequence

A nodejs sequence generator which generate unique sequential numbers as user-assigned ids for your records/documents.

There are four reasons to use **mysequence** to generate sequences as ids/keys for your records/documents by application itself.
- **Independent**: Our data model and persistence layer can be independent of any RDB & noSQL DB such as **MySQL** auto increment, **MongoDB** ObjectId, **Oracle** sequence, **MS SQL Server** identity, and so on. We can move our data to any store no matter what DB types or providers.
- **Fastest**: It is the fastest id generator in all known solutions including DBMS proprietary features (like Oracle sequence, MySQL auto increment), UUID utilities, and O/R Mapping built-in features (Hibernate hilo, uuid.string and uuid.hex).
- **Unique**: UUID utils and O/R Mapping libs CANNOT guarantee unique ids in **cluster env.**
- **Proactive**: You know your new record id before you create it, so you can use it in frontend layer proactively.

You can deploy it as an id generating service in/with application code together.

## Martin Fowler and peaa
This sequence generator inspired from the design pattern of ***key table*** in chapter [**Identity Field**](http://martinfowler.com/eaaCatalog/identityField.html) in peaa ([Patterns of Enterprise Application Architecture](http://www.amazon.com/exec/obidos/ASIN/0321127420/resourcesforsoft)) by Martin Fowler, the famous OOP master.

Martin contributes his great works to the community, and I pay my respect to martin and contribute this OSS lib to the community.

## Installation

**mysequence** need **redis** as sequence store, by default, but you could also customize your own store.
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

## Performance

Test in my macbook pro 13' (i5 8G), it take ***< one second*** to generate ***1,000,000*** unique numbers using 1000 segment width.

License
-------

MIT License. A copy is included with the source.

Contact
-------

* GitHub ([henryleu](http://github.com/henryleu))
* QQ ([1347653](1347653))
* Email ([henryleu@126.com](mailto:henryleu@126.com))
