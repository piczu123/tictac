const socket = io();

// Get the board element
const board = document.getElementById('board');
const playerNames = document.getElementById('playerNames');
const resetButton = document.getElementById('resetButton');

let currentPlayer = '';
let currentSymbol = '';
let boardState = Array(15).fill(null).map(() => Array(15).fill(null));
let gameActive = true;
let playerOne, playerTwo;

// Create the board dynamically
for (let row = 0; row < 15; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');
    for (let col = 0; col < 15; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener('click', handleCellClick);
        rowDiv.appendChild(cell);
    }
    board.appendChild(rowDiv);
}

// Listen for the startGame event
socket.on('startGame', (otherPlayer) => {
    const username = document.querySelector('input[name="username"]').value;
    playerOne = username;
    playerTwo = otherPlayer;
    currentPlayer = Math.random() < 0.5 ? playerOne : playerTwo;
    currentSymbol = currentPlayer === playerOne ? 'X' : 'O';
    playerNames.innerHTML = `${playerOne} (X) vs ${playerTwo} (O)`;
    alert(`You are ${currentSymbol}. It's your turn.`);
});

// Handle cell click
function handleCellClick(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    if (boardState[row][col] || !gameActive) {
        return; // Ignore if the cell is already filled or game is not active
    }

    boardState[row][col] = currentSymbol;
    event.target.textContent = currentSymbol;

    if (checkWin(row, col)) {
        alert(`${currentPlayer} wins!`);
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
        currentSymbol = currentPlayer === playerOne ? 'X' : 'O';
        alert(`It's now ${currentPlayer}'s turn.`);
    }

    // Emit the updated board state
    socket.emit('updateBoard', { row, col, symbol: currentSymbol });
}

// Check for a win condition
function checkWin(row, col) {
    const symbol = boardState[row][col];
    return checkDirection(row, col, symbol, 1, 0) || // Horizontal
           checkDirection(row, col, symbol, 0, 1) || // Vertical
           checkDirection(row, col, symbol, 1, 1) || // Diagonal /
           checkDirection(row, col, symbol, 1, -1);   // Diagonal \
}

// Check a specific direction for a win
function checkDirection(row, col, symbol, rowIncrement, colIncrement) {
    let count = 1;

    for (let i = 1; i < 5; i++) {
        const r = row + rowIncrement * i;
        const c = col + colIncrement * i;
        if (r < 0 || r >= 15 || c < 0 || c >= 15 || boardState[r][c] !== symbol) {
            break;
        }
        count++;
    }

    for (let i = 1; i < 5; i++) {
        const r = row - rowIncrement * i;
        const c = col - colIncrement * i;
        if (r < 0 || r >= 15 || c < 0 || c >= 15 || boardState[r][c] !== symbol) {
            break;
        }
        count++;
    }

    return count >= 5; // 5 in a row
}

// Listen for board updates from the server
socket.on('boardUpdated', ({ row, col, symbol }) => {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.textContent = symbol;
});

// Reset game functionality
resetButton.addEventListener('click', () => {
    boardState = Array(15).fill(null).map(() => Array(15).fill(null));
    gameActive = true;
    currentPlayer = Math.random() < 0.5 ? playerOne : playerTwo;
    currentSymbol = currentPlayer === playerOne ? 'X' : 'O';
    playerNames.innerHTML = `${playerOne} (X) vs ${playerTwo} (O)`;
    Array.from(document.querySelectorAll('.cell')).forEach(cell => {
        cell.textContent = '';
    });
    alert(`New game started! You are ${currentSymbol}.`);
});
