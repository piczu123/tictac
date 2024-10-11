const socket = io();

// When the player connects, receive their symbol (X or O)
socket.on('playerSymbol', function (symbol) {
    playerSymbol = symbol;
    document.getElementById('game-status').textContent = `You are playing as ${playerSymbol}`;
});

// When the board is updated, update the game board on the client
socket.on('boardUpdate', function (newBoardState, currentTurn) {
    boardState = newBoardState;
    currentPlayer = currentTurn;
    updateGameBoard();
    updateGameStatus();
});

// Handle the player clicking on a cell
function handleCellClick(event) {
    const cellIndex = event.target.getAttribute('data-index');

    if (!gameStarted || currentPlayer !== playerSymbol || boardState[cellIndex] !== null) {
        return;
    }

    socket.emit('makeMove', cellIndex); // Send the move to the server
}

// Update the game board to reflect the current state
function updateGameBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = boardState[index];
    });
}

function updateGameStatus() {
    document.getElementById('game-status').textContent = `${currentPlayer}'s turn`;
}
