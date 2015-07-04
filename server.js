var http = require('http');
var fs = require('fs');
var url = require('url');

/*
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
        collection = db.collection("data", function (err, coll) {});
        
    }
});*/

createLog();

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
            var ID = Math.floor(Math.random() * 1000); //for now random
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end(ID.toString(), "utf-8");
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
            var data = JSON.parse(body);
            saveData(data);
        });
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.end("");
    }
}).listen(8001);
console.log("server initialized");

function createLog() {
    fs.writeFile("log.csv", "x,y,t,type,id\n", function(err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Log created.");
        }
    });
}

function saveData(data) {
    var id = data["id"];
    var body = "";
    for (var i = 0; i < data["clicks"].length; i++) {
        var line = data["clicks"][i][0] + "," + data["clicks"][i][1] + "," +
                   data["clicks"][i][2] + ",c," + id + "\n";
        body += line;
    }
    for (var i = 0; i < data["moves"].length; i++) {
        var line = data["moves"][i][0] + "," + data["moves"][i][1] + "," +
                   data["moves"][i][2] + ",m," + id + "\n";
        body += line;
    }
    for (var i = 0; i < data["scrolls"].length; i++) {
        var line = "-,-," + data["scrolls"][i][0] + ",s," + id + "\n";
        body += line;
    }
    for (var i = 0; i < data["hovers"].length; i++) {
        var line = data["hovers"][i][0] + ",-," + data["hovers"][i][1] + 
                   ",h," + id + "\n";
        body += line;
    }
    fs.appendFile("log.csv", body, function(err) {
        if (err) {
            return console.log(err);
        } else {
            console.log("Appended.");
        }
    });
}
