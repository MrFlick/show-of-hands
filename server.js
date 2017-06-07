var express = require('express');
var app = express();
var http = require('http').createServer(app);
//var io = require('socket.io')(http, {transports: ["polling"]});
var io = require('socket.io')(http);
var config = require('./config');

var http_port = config.port || 41742;
var data = require("./data-layer").getDataStore(config.db_path);

app.use(express.static(__dirname + '/build'))
app.get("*", function(req, res) {
    res.sendFile(__dirname + '/build/index.html');
});

var getClientID = (function() {
    var clients = new Map();
    return function getClientID(socket) {
        let clientIP = socket.request.connection.remoteAddress;
        let clientID = 0;
        if (clients.has(clientIP)) {
            clientID = clients.get(clientIP);
        } else {
            clientID = Map.length;
            clients.set(clientIP, clientID);
        }
        return clientID
    }
})();

io.on('connection', function(socket) {
    console.log("a user connected");
    let clientID = getClientID(socket);
    socket.emit("you are", {id: clientID});
    socket.on("add poll", function(msg) {
        data.addPoll(msg).then((poll) => {
            io.emit("new poll", poll);
        })
    });
    socket.on("open poll", function(msg) {
        data.openPoll(msg).then((poll) => {
            io.emit("open poll", poll);
        })
    });
    socket.on("close poll", function(msg) {
        data.closePoll(msg).then((poll) => {
            io.emit("close poll", poll);
        })
    });
    socket.on("add snippet", function(msg) {
        data.addSnippet(msg).then((snip) => {
            io.emit("new snippet", snip);
        })
    });
    socket.on("poll response", function(msg) {
        msg.client_id = clientID;
        data.addPollResponse(msg).then((resp) => {
            io.emit("new poll response", resp);
        })
    });
    socket.on("disconnect", function() {
        console.log("user disconnected");
    });
    socket.on("request prompt list", function() {
        data.getPrompts().then((prompts) => {;
            socket.emit("prompt list", prompts);
        });
    });
    socket.on("request poll list", function() {
        data.getPolls().then((polls) => {;
            socket.emit("poll list", polls);
        });
    });
    socket.on("request poll list all", function() {
        data.getPolls(true).then((polls) => {;
            socket.emit("poll list", polls);
        });
    });
    socket.on("request snippet list", function() {
        data.getSnippets().then((snips) => {;
            socket.emit("snippet list", snips);
        });
    });
});

http.listen(http_port, function() {
    console.log("listening on *:" + http_port)
});
