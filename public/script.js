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

socket.on('roomExists', () => {
    alert('Room already exists. Please choose another name.');
});

socket.on('roomCreated', (roomName) => {
    alert(`Room ${roomName} created!`);
    createBoard();
});

socket.on('playerJoined', (players) => {
    console.log('Players in the room:', players);
});

socket.on('gameState', (state) => {
    updateBoard(state.board);
});

socket.on('updateBoard', (board) => {
    updateBoard(board);
});

socket.on('gameOver', (winner) => {
    document.getElementById('message').innerText = `Player ${winner} wins!`;
});

function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear previous board
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', () => makeMove(i, j));
            boardDiv.appendChild(cell);
        }
    }
}

function makeMove(x, y) {
    const roomName = document.getElementById('roomName').value;
    socket.emit('makeMove', { roomName, x, y });
}

function updateBoard(board) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const x = cell.dataset.x;
        const y = cell.dataset.y;
        cell.textContent = board[x][y] || '';
    });
}
