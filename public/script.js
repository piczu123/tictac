const socket = io();

document.getElementById('createRoom').addEventListener('click', () => {
    const roomName = document.getElementById('roomName').value;
    if (roomName) {
        socket.emit('createRoom', roomName);
    } else {
        alert('Please enter a room name.');
    }
});

document.getElementById('joinRoom').addEventListener('click', () => {
    const roomName = document.getElementById('roomName').value;
    if (roomName) {
        socket.emit('joinRoom', roomName);
    } else {
        alert('Please enter a room name.');
    }
});

// Listen for various events from the server
socket.on('roomExists', () => {
    alert('Room already exists. Please choose another name.');
});

socket.on('roomFull', () => {
    alert('The room is full. Please try another room.');
});

socket.on('roomNotFound', () => {
    alert('Room not found. Please check the name and try again.');
});

socket.on('roomCreated', (roomName) => {
    alert(`Room ${roomName} created!`);
    createBoard(); // Show the board for the creator
    document.getElementById('board').style.display = 'grid'; // Show the board
});

socket.on('playerJoined', (players) => {
    console.log('Players in the room:', players);
    document.getElementById('board').style.display = 'grid'; // Show the board for both players
});

socket.on('gameState', (state) => {
    updateBoard(state.board);
    document.getElementById('board').style.display = 'grid'; // Show the board for the joining player
});

socket.on('updateBoard', (board) => {
    updateBoard(board);
});

socket.on('updateTurn', (turn) => {
    document.getElementById('currentTurn').innerText = `Current Turn: Player ${turn}`;
});

// Function to create the board
function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear previous board
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.addEventListener('click', () => {
                // Emit the move to the server
                socket.emit('makeMove', { roomName: document.getElementById('roomName').value, x: i, y: j });
            });
            boardDiv.appendChild(cell);
        }
    }
}

// Function to update the board UI
function updateBoard(board) {
    const cells = document.querySelectorAll('.cell');
    board.forEach((row, x) => {
        row.forEach((cell, y) => {
            const index = x * 15 + y;
            cells[index].innerText = cell ? cell : ''; // Set cell text to X or O
        });
    });
}
