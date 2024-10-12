const socket = io();
let playerSymbol = '';

document.getElementById('createRoomBtn').onclick = () => {
    const roomName = document.getElementById('roomName').value;
    socket.emit('createRoom', roomName);
};

document.getElementById('joinRoomBtn').onclick = () => {
    const roomName = document.getElementById('roomName').value;
    socket.emit('joinRoom', roomName);
};

// Listen for game state updates from the server
socket.on('gameState', (state) => {
    console.log('Received game state:', state);
    updateBoard(state.board);
    document.getElementById('currentTurn').innerText = `Your Symbol: ${playerSymbol} - Current Turn: ${state.currentTurn}`;
    document.getElementById('board').style.display = 'grid'; // Show the board

    if (state.players.length === 2) {
        playerSymbol = state.players[0] === socket.id ? 'X' : 'O'; // Assign symbols based on player position
        document.getElementById('currentTurn').innerText = `Your Symbol: ${playerSymbol}`;
    }
});

// Create board function
function createBoard() {
    const boardDiv = document.getElementById('board');
    boardDiv.innerHTML = ''; // Clear previous board
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.addEventListener('click', () => {
                // Emit the move to the server
                socket.emit('makeMove', { roomName: document.getElementById('roomName').value, x: i, y: j, playerSymbol });
            });
            boardDiv.appendChild(cell);
        }
    }
}

// Update the board based on the state from the server
function updateBoard(board) {
    const cells = document.querySelectorAll('.cell');
    board.forEach((row, x) => {
        row.forEach((cell, y) => {
            const index = x * 15 + y;
            cells[index].innerText = cell ? cell : ''; // Update cell with X or O
        });
    });
    
    // Highlight last move
    if (board.lastMove) {
        const lastMoveCell = cells[board.lastMove.x * 15 + board.lastMove.y];
        lastMoveCell.classList.add('last-move');
    }
}

// Handle game over
socket.on('gameOver', (winner) => {
    document.getElementById('gameOver').innerText = `Player ${winner} wins!`;
    document.getElementById('gameOver').style.display = 'block';
    drawWinningLine(winner);
});

// Draw winning line function
function drawWinningLine(winner) {
    const winningCells = findWinningCells(winner);
    if (winningCells.length > 0) {
        const boardDiv = document.getElementById('board');
        const line = document.createElement('div');
        line.className = 'winning-line';
        line.style.width = '5px';
        line.style.height = '40px'; // Change height for horizontal line
        line.style.position = 'absolute';

        if (winningCells[0].x === winningCells[1].x) {
            // Horizontal win
            const yPosition = winningCells[0].y * 40; // Calculate y position
            line.style.left = winningCells[0].x * 40 + 'px'; // Set x position
            line.style.top = yPosition + 'px';
            boardDiv.appendChild(line);
        } else if (winningCells[0].y === winningCells[1].y) {
            // Vertical win
            const xPosition = winningCells[0].x * 40; // Calculate x position
            line.style.height = '5px';
            line.style.width = '100%';
            line.style.top = winningCells[0].y * 40 + 'px'; // Set y position
            line.style.left = xPosition + 'px';
            boardDiv.appendChild(line);
        } else {
            // Diagonal win (handle both directions)
            const start = winningCells[0];
            const end = winningCells[4];
            const xDiff = end.x - start.x;
            const yDiff = end.y - start.y;

            if (Math.abs(xDiff) === Math.abs(yDiff)) {
                const isLeftDiagonal = xDiff > 0 && yDiff > 0;

                // For diagonals, adjust the line position
                if (isLeftDiagonal) {
                    line.style.width = '5px';
                    line.style.height = '5px';
                    line.style.transform = 'rotate(45deg)';
                    line.style.left = start.x * 40 + 15 + 'px'; // Adjust x position
                    line.style.top = start.y * 40 + 15 + 'px'; // Adjust y position
                } else {
                    line.style.width = '5px';
                    line.style.height = '5px';
                    line.style.transform = 'rotate(-45deg)';
                    line.style.left = start.x * 40 + 15 + 'px'; // Adjust x position
                    line.style.top = start.y * 40 + 15 + 'px'; // Adjust y position
                }
                boardDiv.appendChild(line);
            }
        }
    }
}

// Function to find winning cells (for demo purposes)
function findWinningCells(winner) {
    // Logic to find and return the coordinates of winning cells
    // This is a placeholder. You should implement logic to track winning combinations
    return [];
}

// Create the board on page load
createBoard();

// Handle error messages from the server
socket.on('error', (message) => {
    alert(message); // Display the error message to the player
});
