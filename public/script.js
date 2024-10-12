const socket = io();
let playerSymbol = '';

document.getElementById('createRoomBtn').onclick = () => {
    const roomName = document.getElementById('roomName').value;
    socket.emit('createRoom', roomName);
};

document.getElementById('joinRoomBtn').onclick = () => {
    const roomName = document.getElementById('roomName').value;
    socket.emit('joinRoom', roomName);
};

socket.on('gameState', (state) => {
    console.log('Received game state:', state);
    updateBoard(state.board);
    document.getElementById('currentTurn').innerText = `Current Turn: Player ${state.currentTurn}`;
    document.getElementById('board').style.display = 'grid'; // Show the board

    if (state.players.length === 2) {
        playerSymbol = state.players[0] === socket.id ? 'X' : 'O'; // Assign symbols based on player position
        document.getElementById('currentTurn').innerText = `Your Symbol: ${playerSymbol} - ${state.currentTurn}`;
    }
});

function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear previous board
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.addEventListener('click', () => {
                // Emit the move to the server
                socket.emit('makeMove', { roomName: document.getElementById('roomName').value, x: i, y: j, playerSymbol });
            });
            boardDiv.appendChild(cell);
        }
    }
}

function updateBoard(board) {
    const cells = document.querySelectorAll('.cell');
    board.forEach((row, x) => {
        row.forEach((cell, y) => {
            const index = x * 15 + y;
            cells[index].innerText = cell ? cell : ''; // Update cell with X or O
        });
    });
}

// Create the board on page load
createBoard();
