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
    document.getElementById('currentTurn').innerText = `Your Symbol: ${playerSymbol} - Current Turn: ${state.currentTurn}`;
    document.getElementById('board').style.display = 'grid'; // Show the board

    if (state.players.length === 2) {
        playerSymbol = state.players[0] === socket.id ? 'X' : 'O';
        document.getElementById('currentTurn').innerText = `Your Symbol: ${playerSymbol}`;
    }
});

function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.addEventListener('click', () => {
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
            cells[index].innerText = cell ? cell : '';
        });
    });
    if (board.lastMove) {
        const lastMoveCell = cells[board.lastMove.x * 15 + board.lastMove.y];
        lastMoveCell.classList.add('last-move');
    }
}

socket.on('gameOver', (winner) => {
    document.getElementById('gameOver').innerText = `Player ${winner} wins!`;
    document.getElementById('gameOver').style.display = 'block';
});

createBoard();
