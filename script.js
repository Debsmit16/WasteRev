// Testimonial data
const testimonials = [
    {
        name: "Dr. Sarah Johnson",
        role: "Pulmonologist",
        text: "This system has revolutionized how we monitor respiratory health. The real-time data helps us make better decisions.",
        image: "doctor-sarah.jpg"
    },
    {
        name: "Michael Chen",
        role: "Patient",
        text: "Managing my asthma has never been easier. The alerts have literally been a lifesaver.",
        image: "patient-michael.jpg"
    },
    {
        name: "Emily Rodriguez",
        role: "Healthcare Provider",
        text: "The analytics and reporting features help us provide better care to our patients.",
        image: "nurse-emily.jpg"
    }
];

function renderTestimonial(index) {
    const testimonial = testimonials[index];
    const newTestimonial = document.createElement('div');
    newTestimonial.className = 'testimonial';
    newTestimonial.style.opacity = '0';
    
    newTestimonial.innerHTML = `
        <img src="${testimonial.image}" alt="${testimonial.name}">
        <p>${testimonial.text}</p>
        <h4>${testimonial.name}</h4>
        <span class="role">${testimonial.role}</span>
    `;
    
    const carousel = document.querySelector('.testimonial-carousel');
    carousel.innerHTML = '';
    carousel.appendChild(newTestimonial);
    
    // Update nav dots
    document.querySelectorAll('.nav-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    // Fade in animation
    setTimeout(() => {
        newTestimonial.style.opacity = '1';
    }, 50);
}

function initTestimonialCarousel() {
    let currentIndex = 0;
    
    // Auto rotate testimonials
    setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        renderTestimonial(currentIndex);
    }, 5000);
    
    // Click handlers for nav dots
    document.querySelectorAll('.nav-dot').forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            renderTestimonial(currentIndex);
        });
    });
    
    // Initial render
    renderTestimonial(currentIndex);
}

// Handle newsletter form submission
document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    alert(`Thank you for subscribing with: ${email}`);
    e.target.reset();
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initTestimonialCarousel();
    
    // Animate features on scroll
    const features = document.querySelectorAll('.feature-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    features.forEach(feature => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateY(20px)';
        observer.observe(feature);
    });

    animateStats();
    initTabs();
});

// Add header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Stats counter animation
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const increment = target / 200;
        let current = 0;

        const updateCount = () => {
            if(current < target) {
                current += increment;
                stat.textContent = Math.ceil(current);
                setTimeout(updateCount, 10);
            } else {
                stat.textContent = target;
            }
        };

        updateCount();
    });
}

// Tabs functionality
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => {
                p.classList.remove('active');
                p.style.opacity = '0';
            });
            
            // Add active class to clicked button and corresponding panel
            btn.classList.add('active');
            const panel = document.querySelector(`#${btn.dataset.tab}`);
            panel.classList.add('active');
            
            // Trigger opacity transition after a small delay
            setTimeout(() => {
                panel.style.opacity = '1';
            }, 50);
        });
    });
}

// Login Modal Functionality
const loginBtn = document.querySelector('.login-btn');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');

loginBtn.addEventListener('click', () => {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

closeModal.addEventListener('click', () => {
    loginModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal.classList.contains('active')) {
        loginModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});
