const board = document.getElementById('game-board');
const leaderboardList = document.getElementById('leaderboard-list');
let currentPlayer = 'X';
let playerName = prompt("Enter your name:");

// Initialize game board
function initGameBoard() {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.addEventListener('click', () => handleCellClick(i));
        board.appendChild(cell);
    }
}

// Handle cell clicks
function handleCellClick(index) {
    const cell = board.children[index];
    if (!cell.textContent) {
        cell.textContent = currentPlayer;

        // Check for win or draw
        if (checkWin()) {
            alert(`${currentPlayer} wins!`);
            updateStats(currentPlayer, currentPlayer === 'X' ? 'O' : 'X');
            resetGame();
        } else if (isDraw()) {
            alert("It's a draw!");
            resetGame();
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        }
    }
}

// Check win logic
function checkWin() {
    const winPatterns = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    return winPatterns.some(pattern => {
        return pattern.every(index => board.children[index].textContent === currentPlayer);
    });
}

// Check draw logic
function isDraw() {
    return Array.from(board.children).every(cell => cell.textContent);
}

// Reset game
function resetGame() {
    Array.from(board.children).forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
}

// Fetch and display leaderboard
function fetchLeaderboard() {
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => {
            leaderboardList.innerHTML = ''; // Clear existing list
            data.forEach(player => {
                const listItem = document.createElement('li');
                listItem.textContent = `${player.name}: Wins: ${player.wins}, Losses: ${player.losses}, Elo: ${player.elo}`;
                leaderboardList.appendChild(listItem);
            });
        });
}

// Call init and fetchLeaderboard on page load
initGameBoard();
fetchLeaderboard();

// Update player stats
function updateStats(winner, loser) {
    fetch('/updateStats', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ winner, loser })
    })
    .then(response => {
        if (response.ok) {
            fetchLeaderboard(); // Refresh leaderboard
        }
    });
}
