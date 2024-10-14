const socket = io();

// Get username from session (this assumes you have saved it during login)
const username = sessionStorage.getItem('username'); // Store this during login

// Emit event to join the queue
socket.emit('joinQueue', username);

// Listen for matchFound event
socket.on('matchFound', (data) => {
    alert(`Match found with ${data.opponent}`);
    // Redirect to the game page or handle game initialization here
    window.location.href = '/game.html'; // Or any other way you handle game start
});

// Handle leaving the queue
function leaveQueue() {
    socket.emit('leaveQueue', username);
}

// You might want to call leaveQueue() when a user navigates away or clicks a button
