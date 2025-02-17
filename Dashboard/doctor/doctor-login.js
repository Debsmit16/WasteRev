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

        const doctorId = document.getElementById('doctorId').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;

        try {
            // Dummy credentials for doctor
            const dummyCredentials = {
                doctorId: 'DOC123',
                password: 'doctor123'
            };

            // Check credentials
            if (doctorId === dummyCredentials.doctorId && password === dummyCredentials.password) {
                // Successful login
                console.log('Doctor login successful');
                window.location.href = 'dashboard.html';
            } else {
                showError('Invalid Doctor ID or password. Please try again.');
                console.log('Login failed');
            }
        } catch (error) {
            showError('An error occurred during login. Please try again.');
        }
    });

    // Handle verification options
    const hospitalIdButton = document.querySelector('.hospital-id');
    const medicalLicenseButton = document.querySelector('.medical-license');

    hospitalIdButton.addEventListener('click', () => {
        showError('Hospital ID verification coming soon');
    });

    medicalLicenseButton.addEventListener('click', () => {
        showError('Medical License verification coming soon');
    });
});

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
