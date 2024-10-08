const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const { JOIN, JOINED, DISCONNECTED, CODE_CHANGE, SYNC_CODE } = require('./src/Actions');
const path = require('path');


const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('build'));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
    
})

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId]
        }
    });
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);
    socket.on(JOIN, ({roomId, username}) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({socketId}) => {
            io.to(socketId).emit(JOINED,{
                clients,
                username,
                socketId: socket.id
            })
        })
    });

    socket.on(CODE_CHANGE, ({roomId, code}) => {
        socket.in(roomId).emit(CODE_CHANGE, {
            code
        });
    });

    socket.on(SYNC_CODE, ({socketId, code}) => {
        io.to(socketId).emit(CODE_CHANGE, {
            code
        });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(DISCONNECTED,{
                socketId: socket.id,
                username: userSocketMap[socket.id]
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    })
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
