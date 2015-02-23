var assert = require("assert");

describe('SequenceGenerator', function(){
    describe('#init()', function(){
        it("generator#init is not invoked, so next method should throw Error", function(done){
            var generator = require('./dependency/generator')();
            var so = generator.get('ComingRequest');
            assert.ok(so);
            assert.throws(
                function() {
                    so.next();
                },
                Error
            );
            done();
        });

        it("generator#init should initialize well with true populated in callback", function(done){
            var generator = require('./dependency/generator')();
            generator.init(function(result){
                assert.ok(result);
                done();
            });
        });
        it("after generator#init is invoked and work well, so's next should return value", function(done){
            var generator = require('./dependency/generator')();
            generator.init(function(result){
                assert.ok(result);
                var so = generator.get('ComingRequest');
                assert.ok(so.next().val);
                assert.ok(so.next().val);

                so = generator.get('TravelTarget');
                assert.ok(so);
                assert.ok(so.next().val);
                assert.ok(so.next().val);

                so = generator.get('User');
                assert.ok(!so);

                done();
            });
        });

    });

    describe('#next()', function(){

        before(function(done){
            require("./dependency/sequence-server");
            setTimeout(done, 300);
        });

        it("sequence-server should response unique values", function(done){
            var http = require("http");
            var port = 10071;
            var key = 'ComingRequest';
            var options = {
                hostname: '127.0.0.1',
                port: port,
                path: '/'+key,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            var map = {};
            var arr = [];
            var total = 0;
            var duplicates = 0;
            var next = function(){
                var req = http.request(options, function(res) {
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        total++;
                        arr.push(chunk);
                        if(map[chunk]){
                            console.error('duplicated: ' + chunk);
                            duplicates++;
                        }
                        else{
                            map[chunk] = true;
                        }
                    });
                });

                req.on('error', function(e) {
                    console.log('problem with request: ' + e.message);
                });
                req.end();
            };
            setTimeout(function(){
                var len = 1000;
                var i = 0;
                function get(){
                    if(i++>=len) {
                        return;
                    }
                    next();
                    setTimeout(function(){
                        get();
                    }, 3);
                }
                get();
                setTimeout(function(){
                    var list = arr.sort();
                    var count = list.length;
                    assert.equal(duplicates, 0);
                    assert.equal(total, len);
                    assert.equal(count, len);

                    console.info('all requested sequences are unique');
                    console.info('total requested sequence: ' + total);
                    console.info('total counted sequence: ' + count);
                    for(var index=0;index<count-1; index++){
                        if(list[index]!=list[index+1]-1){
                            console.error('not counted up: ' + list[index]);
                        }
                    }
                    done();
                }, 5000);
            }, 300);

        });

    });
});