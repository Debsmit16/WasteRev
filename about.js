document.addEventListener('DOMContentLoaded', function() {
    // Handle header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Handle login modal
    const loginBtn = document.querySelector('.login-btn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');

    loginBtn?.addEventListener('click', () => {
        loginModal.style.display = 'flex';
        setTimeout(() => {
            loginModal.classList.add('active');
        }, 10);
    });

    closeModal?.addEventListener('click', () => {
        loginModal.classList.remove('active');
        setTimeout(() => {
            loginModal.style.display = 'none';
        }, 300);
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 300);
        }
    });
});
