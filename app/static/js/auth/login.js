// Login Form Handler

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // Form validation and submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form inputs
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Reset previous error messages
        errorMessage.style.display = 'none';
        document.getElementById('email-error').textContent = '';
        document.getElementById('password-error').textContent = '';

        // Validate email format
        if (!validateEmail(email)) {
            document.getElementById('email-error').textContent = 'Please enter a valid email address';
            return;
        }

        // Validate password (not empty)
        if (password.length === 0) {
            document.getElementById('password-error').textContent = 'Password is required';
            return;
        }

        // Send login request
        loginUser(email, password);
    });

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function loginUser(email, password) {
        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;

        // Make API request
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })
        .then(response => response.json().then(data => ({status: response.status, body: data})))
        .then(result => {
            if (result.status === 200) {
                // Login successful

                // Store user data and token
                localStorage.setItem('auth_token', result.body.token);
                localStorage.setItem('user_id', result.body.user_id);
                localStorage.setItem('user_email', result.body.email);
                localStorage.setItem('user_name', result.body.name);
                localStorage.setItem('user_role', result.body.role);

                // Redirect based on role
                if (result.body.role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/'; // Redirect to home page for regular users
                }
            } else {
                // Login failed
                errorMessage.textContent = result.body.message || 'Login failed. Please check your credentials.';
                errorMessage.style.display = 'block';

                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error during login:', error);
            errorMessage.textContent = 'A network error occurred. Please try again.';
            errorMessage.style.display = 'block';

            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    }
});
