const socket = io();

document.getElementById('start-game').addEventListener('click', () => {
  const playerName = document.getElementById('player-name').value;
  if (playerName) {
    document.getElementById('welcome-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    socket.emit('joinGame', { playerName });

    // Generate invite link
    const inviteButton = document.getElementById('invite-link');
    inviteButton.addEventListener('click', () => {
      const inviteLink = `${window.location.origin}?gameId=${socket.id}`;
      prompt('Invite another player using this link:', inviteLink);
    });
  }
});

// Create game board
const boardSize = 15;
const gameBoard = document.getElementById('game-board');
let gameState = Array(boardSize).fill().map(() => Array(boardSize).fill(''));
let currentPlayer = 'X';

for (let i = 0; i < boardSize; i++) {
  for (let j = 0; j < boardSize; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.row = i;
    cell.dataset.col = j;
    gameBoard.appendChild(cell);

    cell.addEventListener('click', () => {
      if (gameState[i][j] === '') {
        cell.textContent = currentPlayer;
        gameState[i][j] = currentPlayer;
        checkWinner(i, j, currentPlayer);

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        socket.emit('move', { row: i, col: j, player: currentPlayer });
      }
    });
  }
}

// Listen for other players' moves
socket.on('opponentMove', ({ row, col, player }) => {
  const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
  cell.textContent = player;
  gameState[row][col] = player;
  currentPlayer = player === 'X' ? 'O' : 'X';
});

function checkWinner(row, col, player) {
  // Winning logic for 5 in a row
  const directions = [
    { dx: 1, dy: 0 }, // Horizontal
    { dx: 0, dy: 1 }, // Vertical
    { dx: 1, dy: 1 }, // Diagonal down-right
    { dx: 1, dy: -1 } // Diagonal down-left
  ];

  for (const { dx, dy } of directions) {
    let count = 1;
    for (let i = 1; i < 5; i++) {
      const r = row + i * dy, c = col + i * dx;
      if (r >= 0 && c >= 0 && r < boardSize && c < boardSize && gameState[r][c] === player) count++;
      else break;
    }
    for (let i = 1; i < 5; i++) {
      const r = row - i * dy, c = col - i * dx;
      if (r >= 0 && c >= 0 && r < boardSize && c < boardSize && gameState[r][c] === player) count++;
      else break;
    }
    if (count >= 5) {
      alert(`${player} wins!`);
      resetBoard();
      break;
    }
  }
}

function resetBoard() {
  gameState = Array(boardSize).fill().map(() => Array(boardSize).fill(''));
  document.querySelectorAll('.cell').forEach(cell => {
    cell.textContent = '';
  });
}
