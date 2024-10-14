// Assuming you have a user model or a way to access your database
const User = require('./models/User'); // Import your user model

// Registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ success: false, message: 'Username already taken. Please choose another one.' });
        }

        // Create a new user
        const newUser = new User({ username, password }); // Hash password if you are using bcrypt
        await newUser.save();

        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: 'An error occurred during registration.' });
    }
});
