document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations with intersection observer
    const cards = document.querySelectorAll('.feature-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.2
    });

    cards.forEach(card => observer.observe(card));

    // Enhanced tab switching with smooth transitions
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;
            const targetPanel = document.getElementById(targetId);

            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => {
                p.style.opacity = '0';
                setTimeout(() => {
                    p.classList.remove('active');
                    if (p.id === targetId) {
                        p.classList.add('active');
                        setTimeout(() => {
                            p.style.opacity = '1';
                        }, 50);
                    }
                }, 300);
            });

            tab.classList.add('active');
        });
    });

    // Initialize demo slider
    initializeDemoSlider();
    
    // Initialize login modal
    initializeLoginModal();
});

function initializeLoginModal() {
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

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
            setTimeout(() => {
                loginModal.style.display = 'none';
            }, 300);
        }
    });
}

// Add Demo Functionality
function initializeDemo() {
    const demoSteps = document.querySelectorAll('.demo-step');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('[data-dir="prev"]');
    const nextBtn = document.querySelector('[data-dir="next"]');
    let currentStep = 0;

    function showStep(index) {
        demoSteps.forEach(step => step.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        demoSteps[index].classList.add('active');
        dots[index].classList.add('active');
    }

    prevBtn?.addEventListener('click', () => {
        currentStep = (currentStep - 1 + demoSteps.length) % demoSteps.length;
        showStep(currentStep);
    });

    nextBtn?.addEventListener('click', () => {
        currentStep = (currentStep + 1) % demoSteps.length;
        showStep(currentStep);
    });
}

// Add Comparison Slider
function initializeComparisonSlider() {
    const slider = document.querySelector('.comparison-slider');
    const handle = document.querySelector('.slider-handle');
    let isDown = false;

    handle?.addEventListener('mousedown', () => isDown = true);
    document.addEventListener('mouseup', () => isDown = false);
    document.addEventListener('mousemove', (e) => {
        if (!isDown || !slider || !handle) return;
        
        const rect = slider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        
        handle.style.left = `${position}%`;
        document.querySelector('.traditional').style.width = `${position}%`;
    });
}
