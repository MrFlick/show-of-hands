var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var config = require('./config');


var data = require("./data-layer").getDataStore(config.db_path);

app.use(express.static(__dirname + '/build'))
app.get("*", function(req, res) {
    res.sendFile(__dirname + '/build/index.html');
});

io.on('connection', function(socket) {
    console.log("a user connected");
    socket.on("add poll", function(msg) {
        data.addPoll(msg).then((poll) => {
            io.emit("new poll", poll);
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
});

http.listen(3000, function() {
    console.log("listening on *:3000")
});
