const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const playerNameElement = document.getElementById("playerName");
const playerEloElement = document.getElementById("playerElo");
const statusElement = document.getElementById("status");
const boardElement = document.getElementById("board");
const gameElement = document.getElementById("game");
const menuElement = document.getElementById("menu");

let currentPlayer;
let playerElo = 100;
let board = Array(15).fill(null).map(() => Array(15).fill(null));
let currentTurn = 'X';
let gameActive = false;

function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    
    if (board[row][col] || !gameActive) return;

    board[row][col] = currentTurn;
    event.target.textContent = currentTurn;

    if (checkWin(row, col)) {
        statusElement.textContent = `${currentTurn} wins!`;
        gameActive = false;
        updateElo(currentTurn === 'X' ? 10 : -10);
    } else if (board.flat().every(cell => cell)) {
        statusElement.textContent = "It's a draw!";
        gameActive = false;
    } else {
        currentTurn = currentTurn === 'X' ? 'O' : 'X';
        statusElement.textContent = `It's ${currentTurn}'s turn.`;
    }
}

function checkWin(row, col) {
    // Check for winning logic (horizontal, vertical, diagonal)
    const directions = [
        [[0, 1], [0, -1]], // Horizontal
        [[1, 0], [-1, 0]], // Vertical
        [[1, 1], [-1, -1]], // Diagonal \
        [[1, -1], [-1, 1]] // Diagonal /
    ];

    for (const direction of directions) {
        let count = 1;

        for (const [dx, dy] of direction) {
            let r = row;
            let c = col;

            while (true) {
                r += dx;
                c += dy;
                if (r < 0 || r >= 15 || c < 0 || c >= 15 || board[r][c] !== currentTurn) break;
                count++;
            }
        }

        if (count >= 5) return true;
    }
    return false;
}

function updateElo(delta) {
    playerElo += delta;
    playerEloElement.textContent = playerElo;
}

loginBtn.addEventListener("click", () => {
    const username = document.getElementById("username").value;
    if (username) {
        currentPlayer = username;
        playerNameElement.textContent = currentPlayer;
        gameElement.style.display = 'block';
        menuElement.style.display = 'none';
        createBoard();
        gameActive = true;
        statusElement.textContent = `It's ${currentTurn}'s turn.`;
    }
});

registerBtn.addEventListener("click", () => {
    const username = document.getElementById("registerUsername").value;
    if (username) {
        alert(`Registered ${username}. You can now log in!`);
        document.getElementById("registerUsername").value = '';
    }
});
