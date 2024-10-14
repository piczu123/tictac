document.addEventListener('DOMContentLoaded', () => {
    const username = document.getElementById('username');
    username.textContent = sessionStorage.getItem('username') || 'Guest';

    document.getElementById('leaveQueue').addEventListener('click', () => {
        // Logic to leave the queue
        alert('Leaving the queue...');
        // Implement actual logic to disconnect from socket and redirect
    });
});
