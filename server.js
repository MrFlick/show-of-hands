var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
//var io = require('socket.io')(http);
var config = require('./config');

var http_port = config.port || 41742;
var data = require("./data-layer").getDataStore(config.db_path);

app.use(express.static(__dirname + '/build'))
app.get("*", function(req, res) {
    res.sendFile(__dirname + '/build/index.html');
});

function getSocketIP(socket) {
    return socket.handshake.headers['x-forwarded-for'] || 
        socket.handshake.address.address
}

var getClientIDByIP = (function() {
    var clients = new Map();
    return function (socket, cb) {
        let clientIP = getSocketIP(socket);
        let clientID = 0;
        if (clients.has(clientIP)) {
            clientID = clients.get(clientIP);
        } else {
            clientID = clients.size+1;
            clients.set(clientIP, clientID);
        }
        if (cb) {cb(clientID);}
    }
})();

var getClientIDBySocket = (function() {
    //just for testing
    var nextClient = 0;
    return function (socket, cb) {
        nextClient += 1;
        if (cb) {cb(nextClient)}
    }
})();

var getClientIDByGUID = (function() {
    function helloParse(msg) {
        var guid = msg.client_id;
        return guid;
    }
    return function(socket, cb) {
        socket.once("hello", function(msg) {
            cb(helloParse(msg))
        })
    }
})();


let user_count = 0;
io.on('connection', function(socket) {
    user_count++;
    let remote_ip = getSocketIP(socket)
    let clientID = -1;
    console.log("a user connected (" + user_count + ") " + remote_ip);
    socket.on("disconnect", function() {
        user_count--;
        console.log("a user disconnected (" + user_count + ")");
    });
    socket.emit("who are you")
    getClientIDByGUID(socket, function(id) {
        clientID = id
        socket.emit("you are", {id: clientID})
    });
    socket.on("add poll", function(msg) {
        data.addPoll(msg).then((poll) => {
            io.emit("new poll", poll)
        })
    });
    socket.on("open poll", function(msg) {
        data.openPoll(msg).then((poll) => {
            io.emit("open poll", poll)
        })
    });
    socket.on("close poll", function(msg) {
        data.closePoll(msg).then((poll) => {
            io.emit("close poll", poll)
        })
    });
    socket.on("update poll", function(msg) {
        data.updatePoll(msg).then((poll) => {
            io.emit("update poll", poll)
        })
    });
    socket.on("delete poll", function(msg) {
        data.deletePoll(msg).then(() => {
            io.emit("remove poll", msg)
        })
    });
    socket.on("add snippet", function(msg) {
        data.addSnippet(msg).then((snip) => {
            io.emit("new snippet", snip)
        })
    });
    socket.on("open snippet", function(msg) {
        data.openSnippet(msg).then((snip) => {
            io.emit("open snippet", snip)
        })
    });
    socket.on("close snippet", function(msg) {
        data.closeSnippet(msg).then((snip) => {
            io.emit("close snippet", snip)
        })
    });
    socket.on("remove snippet", function(msg) {
        data.deleteSnippet(msg).then(() => {
            io.emit("remove snippet", msg)
        })
    });
    socket.on("poll response", function(msg) {
        msg.client_id = clientID;
        data.addPollResponse(msg).then((resp) => {
            io.emit("new poll response", resp)
        })
    });
    socket.on("request poll detail", function(msg) {
        data.getPoll(msg.poll_id).then((resp) => {
            socket.emit("poll detail", resp)
        });
    });
    socket.on("request poll responses list", function(msg) {
        data.getPollResponses(msg).then((resp) => {
            socket.emit("poll responses list", resp)
        })
    });
    socket.on("request prompt list", function() {
        data.getPrompts().then((prompts) => {
            socket.emit("prompt list", prompts)
        });
    });
    socket.on("request poll list", function() {
        data.getPolls().then((polls) => {
            socket.emit("poll list", polls)
        });
    });
    socket.on("request poll list all", function() {
        data.getPolls(true).then((polls) => {
            socket.emit("poll list", polls)
        });
    });
    socket.on("request snippet list", function() {
        data.getSnippets().then((snips) => {
            socket.emit("snippet list", snips)
        });
    });
    socket.on("request snippet list all", function() {
        data.getSnippets(true).then((snips) => {
            socket.emit("snippet list", snips)
        });
    });
});

http.listen(http_port, function() {
    console.log("listening on *:" + http_port)
});
