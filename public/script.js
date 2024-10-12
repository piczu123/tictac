const socket = io();
let playerSymbol = '';

// Create room button action
document.getElementById('createRoomBtn').onclick = () => {
    const roomName = document.getElementById('roomName').value;
    socket.emit('createRoom', roomName);
};

// Join room button action
document.getElementById('joinRoomBtn').onclick = () => {
    const roomName = document.getElementById('roomName').value;
    socket.emit('joinRoom', roomName);
};

// Listen for game state updates from the server
socket.on('gameState', (state) => {
    console.log('Received game state:', state);
    if (!document.getElementById('board').hasChildNodes()) createBoard(); // Create board if not already created
    updateBoard(state.board);
    document.getElementById('currentTurn').innerText = `Current Turn: ${state.currentTurn}`;
    document.getElementById('board').style.display = 'grid'; // Show the board

    if (state.players.length === 2) {
        playerSymbol = state.players[0] === socket.id ? 'X' : 'O'; // Assign symbols based on player position
        document.getElementById('currentTurn').innerText += ` - Your Symbol: ${playerSymbol}`;
    }
});

// Create board function
function createBoard() {
    const boardDiv = document.getElementById('board');
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.onclick = () => handleCellClick(i, j);
            boardDiv.appendChild(cell);
        }
    }
}

// Update the board display
function updateBoard(board) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.innerHTML = ''); // Clear previous symbols

    board.forEach((row, i) => {
        row.forEach((cell, j) => {
            const index = i * 15 + j; // Calculate index
            if (cell) {
                cells[index].innerHTML = cell; // Set cell content
                cells[index].classList.add(cell === 'X' ? 'x-symbol' : 'o-symbol'); // Add specific class
            }
        });
    });

    if (board.lastMove) {
        const lastCell = cells[board.lastMove.x * 15 + board.lastMove.y];
        lastCell.classList.add('last-move'); // Highlight last move
    }
}

// Handle cell click
function handleCellClick(x, y) {
    const roomName = document.getElementById('roomName').value;
    socket.emit('makeMove', { roomName, x, y });
}

// Handle game over
socket.on('gameOver', (winner) => {
    document.getElementById('gameOver').innerText = `Player ${winner} wins!`;
    document.getElementById('gameOver').style.display = 'block';
});
