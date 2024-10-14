const socket = io();

// Display player info
socket.on('playerInfo', (playerName) => {
    document.getElementById('playerInfo').innerText = `You are playing as: ${playerName}`;
});

// Wait for an opponent
socket.on('opponentFound', () => {
    document.getElementById('board').style.display = 'block';
    document.getElementById('gameInfo').innerText = "Opponent found! Your turn.";
});

// Leave queue button
document.getElementById('leaveQueue').onclick = function() {
    socket.emit('leaveQueue');
    window.location.href = '/index.html'; // Redirect back to login/register
};
