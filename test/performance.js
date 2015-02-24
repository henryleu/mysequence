var assert = require("assert");

describe('SequenceGenerator', function(){
    describe('#performance()', function(){
        it("generate 1 millions sequence number", function(done){
            var generator = require('./dependency/generator-prd')();
            generator.init(function(result){
                assert.ok(result);
                var so = generator.get('ComingRequest');
                assert.ok(so.next().val);
                assert.ok(so.next().val);

                var len = 1000000; //1 million
                var map = {};
                var index = 1;
                console.time('time');
                for(var i=0; i<len; i++){
                    //process.nextTick
                    //setImmediate
                    process.nextTick(function(){
                        var val = ''+so.next().val;
                        //if(map[val]){
                        //    console.error('Duplicated: ' + val);
                        //}
                        //else{
                        //    map[val] = val;
                        //}
                        if(index++==len){
                            console.timeEnd('time');
                        }
                    });
                }
                setTimeout(done, 2000);
            });
        });
    }); //end method describe
});//end component describe