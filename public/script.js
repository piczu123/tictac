const socket = io();
const gameBoard = document.getElementById("gameBoard");
const startGameButton = document.getElementById("startGame");
const messageDiv = document.getElementById("message");

let currentPlayer = "X";
const board = Array(15).fill(null).map(() => Array(15).fill(null));

function createBoard() {
    gameBoard.innerHTML = "";
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", () => handleCellClick(row, col));
            gameBoard.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    if (!board[row][col]) {
        board[row][col] = currentPlayer;
        socket.emit("playerMove", { row, col, player: currentPlayer });
        renderBoard();
        if (checkWinner(currentPlayer)) {
            messageDiv.textContent = `${currentPlayer} wins!`;
            socket.emit("gameOver", currentPlayer);
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
        }
    }
}

function renderBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        cell.textContent = board[row][col] || "";
    });
}

function checkWinner(player) {
    // Check rows, columns and diagonals for a win
    // Implement your win-checking logic here
    return false; // Replace with actual win-checking logic
}

startGameButton.addEventListener("click", () => {
    createBoard();
    messageDiv.textContent = "";
});

socket.on("updateBoard", (data) => {
    board[data.row][data.col] = data.player;
    renderBoard();
});

socket.on("gameOver", (winner) => {
    messageDiv.textContent = `${winner} wins!`;
});
