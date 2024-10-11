const boardSize = 15;
const winCondition = 5; // Change this to 5 for a win condition of 5 in a row
const cells = [];
const gameBoard = document.getElementById('game-board');
const resetButton = document.getElementById('reset-button');
let currentPlayer = 'X';
let board = Array(boardSize * boardSize).fill(null);

// Create the cells for the game board
for (let i = 0; i < boardSize * boardSize; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.dataset.index = i;
  gameBoard.appendChild(cell);
  cells.push(cell);
}

// Function to check for a winner
function checkWinner() {
  // Check rows and columns
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j <= boardSize - winCondition; j++) {
      // Check rows
      if (
        board[i * boardSize + j] && 
        board[i * boardSize + j] === board[i * boardSize + j + 1] && 
        board[i * boardSize + j] === board[i * boardSize + j + 2] && 
        board[i * boardSize + j] === board[i * boardSize + j + 3] && 
        board[i * boardSize + j] === board[i * boardSize + j + 4]
      ) {
        return board[i * boardSize + j]; // Return the winner
      }

      // Check columns
      if (
        board[j * boardSize + i] && 
        board[j * boardSize + i] === board[j + 1 * boardSize + i] && 
        board[j * boardSize + i] === board[j + 2 * boardSize + i] && 
        board[j * boardSize + i] === board[j + 3 * boardSize + i] && 
        board[j * boardSize + i] === board[j + 4 * boardSize + i]
      ) {
        return board[j * boardSize + i]; // Return the winner
      }
    }
  }

  // Check diagonals
  for (let i = 0; i <= boardSize - winCondition; i++) {
    for (let j = 0; j <= boardSize - winCondition; j++) {
      // Main diagonal
      if (
        board[i * boardSize + j] && 
        board[i * boardSize + j] === board[(i + 1) * boardSize + (j + 1)] && 
        board[i * boardSize + j] === board[(i + 2) * boardSize + (j + 2)] && 
        board[i * boardSize + j] === board[(i + 3) * boardSize + (j + 3)] && 
        board[i * boardSize + j] === board[(i + 4) * boardSize + (j + 4)]
      ) {
        return board[i * boardSize + j]; // Return the winner
      }

      // Anti-diagonal
      if (
        board[i * boardSize + (j + winCondition - 1)] && 
        board[i * boardSize + (j + winCondition - 1)] === board[(i + 1) * boardSize + (j + winCondition - 2)] && 
        board[i * boardSize + (j + winCondition - 1)] === board[(i + 2) * boardSize + (j + winCondition - 3)] && 
        board[i * boardSize + (j + winCondition - 1)] === board[(i + 3) * boardSize + (j + winCondition - 4)] && 
        board[i * boardSize + (j + winCondition - 1)] === board[(i + 4) * boardSize + (j + winCondition - 5)]
      ) {
        return board[i * boardSize + (j + winCondition - 1)]; // Return the winner
      }
    }
  }

  return null; // No winner
}

function handleClick(event) {
  const index = event.target.dataset.index;
  if (!board[index]) {
    board[index] = currentPlayer;
    event.target.innerText = currentPlayer;
    let winner = checkWinner();
    if (winner) {
      alert(`${winner} wins!`);
      resetGame();
    } else if (!board.includes(null)) {
      alert('It\'s a draw!');
      resetGame();
    }
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }
}

function resetGame() {
  board.fill(null);
  cells.forEach(cell => cell.innerText = '');
  currentPlayer = 'X';
}

// Add event listeners
cells.forEach(cell => cell.addEventListener('click', handleClick));
resetButton.addEventListener('click', resetGame);