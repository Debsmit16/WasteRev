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

        const adminId = document.getElementById('adminId').value;
        const password = document.getElementById('password').value;
        const securityKey = document.getElementById('securityKey').value;
        const remember = document.getElementById('remember').checked;

        try {
            // Dummy credentials for admin
            const dummyCredentials = {
                adminId: 'ADMIN123',
                password: 'admin123',
                securityKey: 'SEC789'
            };

            // Check credentials
            if (adminId === dummyCredentials.adminId && 
                password === dummyCredentials.password &&
                securityKey === dummyCredentials.securityKey) {
                // Log login attempt
                console.log('Admin login successful');
                logLoginAttempt(adminId, true);
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError('Invalid credentials. Please verify all fields.');
                logLoginAttempt(adminId, false);
            }
        } catch (error) {
            showError('System error. Please contact IT support.');
            console.error('Login error:', error);
        }
    });

    // Additional security features
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // Clear sensitive fields when tab/window is not visible
            document.getElementById('password').value = '';
            document.getElementById('securityKey').value = '';
        }
    });
});

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        color: var(--error-color);
        background: rgba(231, 76, 60, 0.1);
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 15px;
        text-align: center;
        font-weight: 500;
    `;
    errorDiv.textContent = message;

    const form = document.getElementById('loginForm');
    form.insertBefore(errorDiv, form.firstChild);

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

function logLoginAttempt(adminId, success) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        adminId,
        timestamp,
        success,
        userAgent: navigator.userAgent,
        location: window.location.href
    };
    
    console.log('Login attempt logged:', logEntry);
    // In a real application, send this to your logging service
}
