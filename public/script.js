document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('/login', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/queue.html'; // Redirect to queue page
        } else {
            document.getElementById('message').innerText = data.message;
        }
    });
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    fetch('/register', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('message').innerText = "Registration successful! Please log in.";
            document.getElementById('registerForm').style.display = "none";
            document.getElementById('loginForm').style.display = "block";
        } else {
            document.getElementById('message').innerText = data.message;
        }
    });
});

// Switch between forms
document.getElementById('switchToRegister').onclick = function() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
};

document.getElementById('switchToLogin').onclick = function() {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
};
