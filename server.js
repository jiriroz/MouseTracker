var http = require('http');
var fs = require('fs');
var url = require('url');
var mongojs = require('mongojs');

http.createServer(function(request, response){
    var path = url.parse(request.url).pathname;
    if (request.method == 'GET') {
        console.log("GET request recieved");
        if (path == '/') {
            fs.readFile('./index.html', function(err, file) {
                if(err) {
                    // write an error response or nothing here  
                    return;
                }
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.end(file, "utf-8");
            });
        }
    }
    if (request.method == 'POST') {
        console.log("POST request received");
        body = "";
        request.on('data', function (data) {
            body += data;
            if (body.length > 1e6)
                request.connection.destroy();
        });
        request.on('end', function () {
            console.log(JSON.parse(body));
        });
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("");
    }

}).listen(8001);
console.log("server initialized");
