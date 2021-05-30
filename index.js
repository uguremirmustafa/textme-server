const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');
// app init
const app = express();
// create http server
const server = http.createServer(app);

let corsOptions = {
  cors: true,
  origins: ['http://localhost:3000', 'https://textyme.netlify.app/'],
};
// init socket
const io = socketio(server, corsOptions);

io.on('connection', (socket) => {
  console.log('we have a new connection!!!!!');

  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to the room ${user.room}`,
    });

    socket.broadcast
      .to(user.room)
      .emit('message', { user: 'admin', text: `${user.name}, has joined` });

    socket.join(user.room);

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    console.log(message);
    io.to(user.room).emit('message', { user: user.name, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    console.log('user had left');
  });
});

// routes;
app.use(router);
app.use(cors());
// listen
server.listen(PORT, () => {
  console.log(`server has started on port ${PORT}`);
});
