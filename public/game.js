const socket = io();
let board = Array(15).fill(null).map(() => Array(15).fill(null));
let currentPlayer = 'X'; // Or 'O'

function createBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board.forEach((row, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'row';
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.onclick = () => makeMove(rowIndex, colIndex);
            rowElement.appendChild(cellElement);
        });
        boardElement.appendChild(rowElement);
    });
}

function makeMove(rowIndex, colIndex) {
    if (board[rowIndex][colIndex] === null) {
        board[rowIndex][colIndex] = currentPlayer;
        socket.emit('makeMove', { rowIndex, colIndex, player: currentPlayer });
        createBoard();
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Toggle player
    }
}

// Listen for moves from the opponent
socket.on('opponentMove', (data) => {
    board[data.rowIndex][data.colIndex] = data.player;
    createBoard();
});

// Initialize board
createBoard();

// Leave game button
document.getElementById('leaveGame').onclick = function() {
    socket.emit('leaveGame');
    window.location.href = '/queue.html'; // Redirect back to queue
};
