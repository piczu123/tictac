const socket = io();
const usernameInput = document.getElementById('username');
const joinGameButton = document.getElementById('joinGame');
const waitingDiv = document.getElementById('waiting');
const gameDiv = document.getElementById('game');
const gameBoard = document.getElementById('gameBoard');
const statusDiv = document.getElementById('status');

joinGameButton.onclick = () => {
    const username = usernameInput.value;
    if (username) {
        socket.emit('joinGame', username);
        waitingDiv.style.display = 'block';
        document.getElementById('menu').style.display = 'none';
    }
};

socket.on('waitingForOpponent', () => {
    waitingDiv.style.display = 'block';
});

socket.on('startGame', (data) => {
    waitingDiv.style.display = 'none';
    gameDiv.style.display = 'block';
    startGame(data.opponent);
});

const startGame = (opponent) => {
    gameBoard.innerHTML = '';
    const gameState = Array(15).fill(null).map(() => Array(15).fill(null));
    let currentPlayer = 'X'; // Example symbol for the first player

    for (let i = 0; i < 15 * 15; i++) {
        const cell = document.createElement('div');
        cell.onclick = () => handleCellClick(i, currentPlayer);
        gameBoard.appendChild(cell);
    }

    const handleCellClick = (index, player) => {
        const row = Math.floor(index / 15);
        const col = index % 15;

        if (!gameState[row][col]) {
            gameState[row][col] = player;
            cell.textContent = player;
            socket.emit('makeMove', { index, player, opponentId: opponent, board: gameState });
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Toggle player
        }
    };
};

socket.on('moveMade', (data) => {
    const cell = gameBoard.children[data.index];
    cell.textContent = data.player;
    // Toggle current player if needed
});

socket.on('gameOver', (data) => {
    alert(`Game Over! ${data.winner} wins!`);
});
