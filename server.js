var http = require('http');
var fs = require('fs');
var url = require('url');
var mongojs = require('mongojs');

var uri = "mongodb://localhost:8001/database";

var db = mongojs.connect(uri,["inventory"]);

doc = db.inventory.find({});

fs.writeFile("log.txt", "", function(err) {
    if (err) {
        return console.log(err);
    } else {
        console.log("Log created.");
    }
});
//handle the case when data is received before the file is created


http.createServer(function(request, response){
    var path = url.parse(request.url).pathname;
    if (request.method == 'GET') {
        console.log("GET request recieved");
        if (path == '/') {
            fs.readFile('./index.html', function(err, file) {
                if(err) {
                    return console.log(err);
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
            var jsonData = JSON.parse(body);
            fs.appendFile("log.txt", body + "\n", function(err) {
                if (err) {
                    return console.log(err);
                } else {
                    console.log("Data written.");
                }
            });
        });
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("");
    }

}).listen(8001);
console.log("server initialized");
