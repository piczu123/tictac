const socket = io();

// Get username from session
const username = sessionStorage.getItem('username');

// Emit event to join the queue
socket.emit('joinQueue', username);

// Listen for matchFound event
socket.on('matchFound', (data) => {
    alert(Match found with ${data.opponent});
    // Redirect to the game page
    window.location.href = '/game.html'; 
});

// Handle leaving the queue
function leaveQueue() {
    socket.emit('leaveQueue', username);
}

// Call leaveQueue() when a user navigates away or clicks a button