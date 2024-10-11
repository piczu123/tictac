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
    document.getElementById('message').innerText = `Player ${winner} wins!`;
    document.getElementById('board').style.display = 'none'; // Hide the board when the game is over
});

// Create the game board
function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear previous cells
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', () => makeMove(i, j));
            boardDiv.appendChild(cell);
        }
    }
}

// Update the board display
function updateBoard(board) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const x = cell.dataset.x;
        const y = cell.dataset.y;
        cell.innerText = board[x][y] || '';
    });
}

// Make a move
function makeMove(x, y) {
    const roomName = document.getElementById('roomName').value;
    socket.emit('makeMove', { roomName, x, y });
}
