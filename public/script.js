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

socket.on('gameOver', (winner) => {
    alert(`Game over! Player ${winner} wins!`);
    document.getElementById('board').style.display = 'none'; // Hide the board after the game ends
});

// Create the game board
function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear existing board
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => makeMove(i, j)); // Register click event
            boardDiv.appendChild(cell);
        }
    }
}

// Update the board based on the current state
function updateBoard(board) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const x = Math.floor(index / 15);
        const y = index % 15;
        cell.innerText = board[x][y] === null ? '' : board[x][y];
    });
}

// Make a move in the game
function makeMove(x, y) {
    const roomName = document.getElementById('roomName').value;
    const currentPlayer = document.getElementById('currentTurn').innerText.split(' ')[2]; // Get current player
    if (currentPlayer === 'X' || currentPlayer === 'O') {
        socket.emit('makeMove', { roomName, x, y });
    } else {
        alert("It's not your turn!");
    }
}
