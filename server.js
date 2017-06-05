var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var config = require('./config');


app.use(express.static(__dirname + '/build'))
app.get("*", function(req, res) {
    res.sendFile(__dirname + '/build/index.html');
});

io.on('connection', function(socket) {
    console.log("a user connected");
    socket.on("new poll", function(msg) {
        io.emit("new poll", msg);
        console.log("new poll:" + msg);
    })
    socket.on("disconnect", function() {
        console.log("user disconnected");
    })
    socket.on("loaded", function() {
        console.log("loaded");
    })
});

http.listen(3000, function() {
    console.log("listening on *:3000")
});
