const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  socket.on('joinGame', ({ playerName }) => {
    console.log(`${playerName} joined the game.`);
  });

  socket.on('move', (data) => {
    socket.broadcast.emit('opponentMove', data);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
