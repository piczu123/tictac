document.addEventListener('DOMContentLoaded', function () {
  const board = document.getElementById('game-board');
  const playerNameInput = document.getElementById('player-name');
  const startGameButton = document.getElementById('start-game');
  const inviteLinkContainer = document.getElementById('invite-link-container');
  const inviteLinkInput = document.getElementById('invite-link');
  const gameStatus = document.getElementById('game-status');
  
  let currentPlayer = 'X';
  let playerName = '';
  let gameStarted = false;
  
  // Function to create the game board
  function createBoard() {
      board.innerHTML = '';
      for (let i = 0; i < 15 * 15; i++) {
          const cell = document.createElement('div');
          cell.classList.add('cell');
          cell.addEventListener('click', handleCellClick);
          board.appendChild(cell);
      }
  }

  // Handle the player clicking on a cell
  function handleCellClick(event) {
      if (!gameStarted) {
          return alert('Please enter your name and start the game.');
      }
      if (event.target.textContent !== '') return;  // Prevent clicking on filled cells
      
      event.target.textContent = currentPlayer;
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      updateGameStatus();
  }

  // Update the game status
  function updateGameStatus() {
      gameStatus.textContent = `${currentPlayer}'s turn`;
  }

  // Start the game after player enters name
  startGameButton.addEventListener('click', function () {
      playerName = playerNameInput.value.trim();
      if (playerName === '') {
          alert('Please enter your name.');
          return;
      }
      
      gameStarted = true;
      startGameButton.disabled = true;
      playerNameInput.disabled = true;
      inviteLinkContainer.style.display = 'block';
      
      const inviteLink = `${window.location.href}?player=${encodeURIComponent(playerName)}`;
      inviteLinkInput.value = inviteLink;

      updateGameStatus();
      createBoard();
  });
});
