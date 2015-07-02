var http = require('http');
var fs = require('fs');
var url = require('url');
/*var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;

var dburl = 'mongodb://localhost:27017/database';

var DB;
var collection;

MongoClient.connect(dburl, function(err, db) {
    if(err) {
        return console.log(err);
    } else {
        console.log("connected");
        DB = db;
        collection = db.collection("test");
    }
});*/

fs.writeFile("log.txt", "", function(err) {
    if (err) {
        return console.log(err);
    } else {
        console.log("Log created.");
    }
});
//handle the case when data is received before the file is created


http.createServer(function(request, response){
    var parsed = url.parse(request.url);
    if (request.method == 'GET') {
        console.log("GET request recieved");
        if (parsed.pathname == '/') {
            fs.readFile('./index.html', function(err, file) {
                if(err) {
                    return console.log(err);
                }
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end(file, "utf-8");
            });
        }
        if (parsed.pathname == "//getid") {
            var id = Math.floor(Math.random() * 1000); //for now random
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end(id.toString(), "utf-8");
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
            var moves = jsonData["moves"];
            var save = "";
            for (var i = 0; i < moves.length; i++) {
                var line = moves[i][0] + " " + moves[i][1] + " " +
                           moves[i][2] + "\n";
                save += line;
            }
            console.log(save);
            fs.appendFile("log.txt", save, function(err) {
                if (err) {
                    return console.log(err);
                } else {
                    //console.log("Data written.");
                }
            });
        });
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("");
    }

}).listen(8001);
console.log("server initialized");
