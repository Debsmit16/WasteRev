document.addEventListener('DOMContentLoaded', () => {
    // Handle password visibility toggle
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');

    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Handle form submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        try {
            // Dummy credentials
            const dummyCredentials = {
                email: 'patient@example.com',
                password: 'patient123'
            };

            // Check credentials
            if (email === dummyCredentials.email && password === dummyCredentials.password) {
                // Successful login
                console.log('Login successful');
                window.location.href = 'dashboard.html';
            } else {
                showError('Invalid email or password. Please try again.');
                console.log('Login failed');
            }
        } catch (error) {
            showError('An error occurred during login. Please try again.');
        }
    });

    // Social login handlers
    const googleButton = document.querySelector('.google');
    const appleButton = document.querySelector('.apple');

    googleButton.addEventListener('click', () => {
        // Implement Google OAuth login
        console.log('Google login clicked');
    });

    appleButton.addEventListener('click', () => {
        // Implement Apple OAuth login
        console.log('Apple login clicked');
    });
});

function simulateLogin(email, password, remember) {
    // This is a mock login - replace with actual authentication logic
    console.log('Login attempted:', { email, password, remember });
    
    // Simulate successful login
    if (email && password) {
        // Redirect to dashboard after successful login
        window.location.href = '/Dashboard/patient/dashboard.html';
    } else {
        showError('Please enter both email and password.');
    }
}

function showError(message) {
    // Create and show error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        color: var(--error-color);
        background: rgba(255, 59, 48, 0.1);
        padding: 10px;
        border-radius: 5px;
        margin-bottom: 15px;
        text-align: center;
    `;
    errorDiv.textContent = message;

    const form = document.getElementById('loginForm');
    form.insertBefore(errorDiv, form.firstChild);

    // Remove error message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
