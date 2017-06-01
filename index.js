var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var config = require('./config');

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get("/admin", function(req, res) {
    res.sendFile(__dirname + '/admin.html');
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
});

http.listen(3000, function() {
    console.log("listening on *:3000")
});