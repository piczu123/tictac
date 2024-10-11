const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname)); // Serve static files

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("playerMove", (data) => {
        // Broadcast the move to other clients
        socket.broadcast.emit("updateBoard", data);
    });

    socket.on("gameOver", (winner) => {
        // Broadcast game over event
        socket.broadcast.emit("gameOver", winner);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
