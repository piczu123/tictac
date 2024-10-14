let users = []; // Temporary user storage

function login(req, res) {
    const { username, password } = req.body;
    // Check if the user exists in the temporary storage
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        req.session.username = username; // Store username in session
        res.json({ success: true }); // Respond with success
    } else {
        res.json({ success: false, message: 'Invalid credentials' }); // Respond with an error message
    }
}

function register(req, res) {
    const { username, password } = req.body;
    // Check if the username already exists
    if (users.some(user => user.username === username)) {
        res.json({ success: false, message: 'Username already exists' }); // Respond with an error if exists
    } else {
        users.push({ username, password }); // Add the new user to temporary storage
        res.json({ success: true }); // Respond with success
    }
}

module.exports = { login, register };
