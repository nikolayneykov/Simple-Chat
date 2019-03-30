const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
let users = [];
let connections = [];
const port=Number(process.env.PORT || 3000);

server.listen(port);
console.log(`Server running...`);


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

io.sockets.on('connection', function (socket) {
    if (!connections.includes(socket)) {
        connections.push(socket);
        updateUsernames();
    }

    console.log('Connected: %s sockets connected', connections.length);

    //Disconnected
    socket.on('disconnect', function (data) {

        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket), 1);
        updateUsernames();
        console.log('Disconnected: %s sockets connected', connections.length);
    });

    //Send Message
    socket.on('send message', function (data) {
        io.sockets.emit('new message', { msg: data, user: socket.username });
        console.log(data);
    });

    //New User

    socket.on('new user', function (data, callback) {
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    })

    function updateUsernames() {
        console.log(users);

        io.sockets.emit('get users', users);
    }
});