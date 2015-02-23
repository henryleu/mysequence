var http = require("http");
var port = 10071;
var url  = require("url");

var startHttpServer = function(){
    var generator = require('./generator')();

    function onrequest(request,response){
        var pathname = url.parse(request.url).pathname;
        var key = pathname && pathname.substr(1);
        if(key=='favicon.ico'){
            response.end();
            return;
        }

        var so = generator.get(key);
        if(so){
            var val = ''+so.next().val;
            response.write(val);
        }
        response.end();
    }

    generator.init(function(result){
        if(result){
            var server = http.createServer(onrequest);
            server.listen(port);
            console.log('Server listening on port ' + port);
        }
        else{
            console.error('Generator is NOT ready!');
        }
    });
};

var cluster = require('cluster');
if (cluster.isMaster) {
    require('os').cpus().forEach(function(){
        cluster.fork();
    });
    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });
    cluster.on('listening', function(worker, address) {
        console.log("A worker with #"+worker.id+" is now connected to " +
        address.address +
        ":" + address.port);
    });
    //setTimeout(function(){
    //    process.exit(0);
    //}, 5000);
} else {
    startHttpServer();
    //setTimeout(function(){
    //    process.exit(0);
    //}, 4000);
}
