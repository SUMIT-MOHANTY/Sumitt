document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registration-form');
    const errorContainer = document.getElementById('error-container');

    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    function handleRegistration(event) {
        event.preventDefault();

        // Clear previous errors
        errorContainer.style.display = 'none';
        errorContainer.innerHTML = '';

        // Get form data
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        // Perform client-side validation
        const validationErrors = validateForm(email, password, confirmPassword);

        if (validationErrors.length > 0) {
            displayErrors(validationErrors);
            return;
        }

        // Submit registration data to API
        submitRegistration(email, password, confirmPassword);
    }

    function validateForm(email, password, confirmPassword) {
        const errors = [];

        // Email validation
        if (!email) {
            errors.push('Email is required');
        } else if (!isValidEmail(email)) {
            errors.push('Please enter a valid email address');
        }

        // Password validation
        if (!password) {
            errors.push('Password is required');
        } else {
            if (password.length < 8) {
                errors.push('Password must be at least 8 characters long');
            }
            if (!/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            if (!/[0-9]/.test(password)) {
                errors.push('Password must contain at least one number');
            }
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }

        return errors;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function displayErrors(errors) {
        const errorList = document.createElement('ul');

        errors.forEach(error => {
            const listItem = document.createElement('li');
            listItem.textContent = error;
            errorList.appendChild(listItem);
        });

        errorContainer.appendChild(errorList);
        errorContainer.style.display = 'block';
    }

    function submitRegistration(email, password, confirmPassword) {
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                confirm_password: confirmPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                displayErrors(data.details || [data.error]);
            } else {
                // Store JWT token in localStorage
                localStorage.setItem('auth_token', data.token);

                // Redirect to dashboard
                window.location.href = '/dashboard';
            }
        })
        .catch(error => {
            displayErrors(['An error occurred. Please try again.']);
            console.error('Registration error:', error);
        });
    }
});
