let currentPlayer = 'X';
let board = Array(3).fill(null).map(() => Array(3).fill(null));
let playerId = null;

function showRegister() {
    document.getElementById('register').style.display = 'block';
    document.getElementById('login').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'none';
}

function hideRegister() {
    document.getElementById('register').style.display = 'none';
}

function showLogin() {
    document.getElementById('login').style.display = 'block';
    document.getElementById('register').style.display = 'none';
}

function hideLogin() {
    document.getElementById('login').style.display = 'none';
}

function showLeaderboard() {
    document.getElementById('leaderboard').style.display = 'block';
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => {
            const leaderboardList = document.getElementById('leaderboard-list');
            leaderboardList.innerHTML = '';
            data.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.username} - Wins: ${user.wins}, Losses: ${user.losses}`;
                leaderboardList.appendChild(li);
            });
        });
}

function hideLeaderboard() {
    document.getElementById('leaderboard').style.display = 'none';
}

function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(response => response.json())
      .then(data => {
          alert('Registered successfully!');
          hideRegister();
      }).catch(err => alert(err.message));
}

function login() {
    const username = document.getElementById('log-username').value;
    const password = document.getElementById('log-password').value;
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    }).then(response => response.json())
      .then(data => {
          playerId = data.id;
          alert('Logged in successfully!');
          document.getElementById('game').style.display = 'block';
          createBoard();
      }).catch(err => alert(err.message));
}

function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = '';
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.onclick = () => makeMove(row, col);
            boardDiv.appendChild(cell);
        }
    }
}

function makeMove(row, col) {
    if (board[row][col] || !playerId) return;
    board[row][col] = currentPlayer;
    const cell = document.querySelectorAll('.cell')[row * 3 + col];
    cell.textContent = currentPlayer;

    if (checkWinner()) {
        alert(`Player ${currentPlayer} wins!`);
        updateGame(playerId);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function checkWinner() {
    // Check rows, columns, and diagonals for a win
    for (let i = 0; i < 3; i++) {
        if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
            return true;
        }
        if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) {
            return true;
        }
    }
    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        return true;
    }
    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        return true;
    }
    return false;
}

function updateGame(winnerId) {
    fetch('/update-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            winnerId: playerId,
            player1Id: playerId,
            player2Id: 2 // Replace this with the actual player 2 ID if you implement multiple players
        })
    }).then(response => response.json())
      .then(data => {
          console.log('Game updated:', data);
      }).catch(err => console.error(err));
}
