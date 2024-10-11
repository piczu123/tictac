const socket = io();
let symbol = null;
let isTurn = false;
let playerName = prompt('Enter your name:');
const urlParams = new URLSearchParams(window.location.search);
const roomId = window.location.pathname.replace('/', '');

if (playerName) {
    socket.emit('joinRoom', { roomId, playerName });
}

const board = document.getElementById('board');
const cells = [];

// Create the 15x15 grid dynamically
for (let row = 0; row < 15; row++) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');
    
    for (let col = 0; col < 15; col++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = row;
        cell.dataset.col = col;
        
        cell.addEventListener('click', () => {
            if (isTurn && !cell.textContent) {
                socket.emit('makeMove', { row, col });
            }
        });
        
        rowDiv.appendChild(cell);
        cells.push(cell);
    }
    
    board.appendChild(rowDiv);
}

// Listen for symbol assignment (X or O)
socket.on('assignSymbol', (assignedSymbol) => {
    symbol = assignedSymbol;
    alert(`You are player ${symbol}`);
    if (symbol === 'X') {
        isTurn = true; // Player X starts first
    }
});

// Listen for game readiness
socket.on('gameReady', ({ playerX, playerO }) => {
    alert(`${playerX} (X) vs ${playerO} (O) - Game is starting!`);
});

// Listen for board updates
socket.on('updateBoard', ({ row, col, symbol }) => {
    const cell = cells.find(c => c.dataset.row == row && c.dataset.col == col);
    if (cell) {
        cell.textContent = symbol;
    }

    // Check if it's our turn
    if (symbol === symbol) {
        isTurn = false;
    } else {
        isTurn = true;
    }
});

// Handle disconnection of other player
socket.on('playerDisconnected', () => {
    alert('The other player has disconnected. The game will reset.');
    location.reload();
});
