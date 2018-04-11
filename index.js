const express = require('express');
const app = express();
const server = require('http').Server(app);

const io = require('socket.io')(server);

app.set('view engine','ejs');
app.use(express.static('public'));

app.get('/',(request,response)=>{
    response.render('app/index');
});

var clients = {};


io.on('connection',(socket)=>{

    console.log('connect');
    io.to(socket.id).emit('addUsers',clients);

    socket.on('disconnect',()=>{
        console.log("a user disconnected !!!");
        delete clients[socket.id]
        socket.broadcast.emit('addUsers',clients);
    });

    socket.on('changeName',(name)=>{

        if (!socket.client.username) {
            console.log("enter");
            socket.client.username = name;
            clients[socket.id] = name;
            let obj = {username: name,socketID: socket.id}
            socket.broadcast.emit('addUser',obj);
        } else {
            tempName = socket.client.username;
            socket.client.username = name;
            clients[socket.id] = name;
            socket.broadcast.emit('addUsers',clients);
        }
    });

    socket.on('send',(messageList)=>{
        if (messageList.receiver == "all") {
            io.emit('receiveMsg',socket.client.username + " : " + messageList.msg);
        } else {

            Object.keys(clients).forEach((socketID)=>{
                if(socketID == messageList.receiver){

                    io.to(socketID).emit('receiveMsg','from '+ socket.client.username +' to you : '+ messageList.msg);

                    io.to(socket.id).emit('receiveMsg','from you to '+ clients[socketID] +' : '+ messageList.msg);

                }
            });
        }
    });
});

server.listen(9090);
