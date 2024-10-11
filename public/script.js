let playerName;
let currentPlayer;
let board = Array(15).fill().map(() => Array(15).fill(''));
let gameActive = false;

document.getElementById('startGame').addEventListener('click', () => {
    playerName = document.getElementById('playerName').value;
    if (!playerName) {
        alert('Please enter your name.');
        return;
    }
    
    document.getElementById('playerSetup').classList.add('hidden');
    document.getElementById('gameBoard').classList.remove('hidden');
    
    currentPlayer = 'X'; // Player 1 starts
    renderBoard();
    generateInviteLink();
});

function generateInviteLink() {
    const inviteLink = `${window.location.href}?player=${encodeURIComponent(playerName)}`;
    document.getElementById('inviteLink').value = inviteLink;
    document.getElementById('inviteLinkContainer').classList.remove('hidden');
}

function renderBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.innerText = cell;
            cellElement.addEventListener('click', () => handleCellClick(rowIndex, colIndex));
            boardElement.appendChild(cellElement);
        });
    });
}

function handleCellClick(row, col) {
    if (!gameActive || board[row][col]) {
        return;
    }
    
    board[row][col] = currentPlayer;
    checkForWinner();
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Switch players
    renderBoard();
}

function checkForWinner() {
    // Check rows, columns, and diagonals for a win
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 11; j++) {
            // Check rows
            if (board[i][j] && board[i].slice(j, j + 5).every(cell => cell === board[i][j])) {
                declareWinner(board[i][j]);
                return;
            }
            // Check columns
            if (board[j][i] && board.slice(j, j + 5).every(row => row[i] === board[j][i])) {
                declareWinner(board[j][i]);
                return;
            }
        }
    }

    // Check diagonals
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
            if (board[i][j] && 
                board[i + 1][j + 1] === board[i][j] && 
                board[i + 2][j + 2] === board[i][j] && 
                board[i + 3][j + 3] === board[i][j] && 
                board[i + 4][j + 4] === board[i][j]) {
                declareWinner(board[i][j]);
                return;
            }
            if (board[i][j + 4] && 
                board[i + 1][j + 3] === board[i][j + 4] && 
                board[i + 2][j + 2] === board[i][j + 4] && 
                board[i + 3][j + 1] === board[i][j + 4] && 
                board[i + 4][j] === board[i][j + 4]) {
                declareWinner(board[i][j + 4]);
                return;
            }
        }
    }

    // Check for a draw
    if (board.flat().every(cell => cell)) {
        document.getElementById('status').innerText = "It's a draw!";
        gameActive = false;
    }
}

function declareWinner(winner) {
    document.getElementById('status').innerText = `${winner} wins!`;
    gameActive = false;
}

// Enable the game
gameActive = true;
