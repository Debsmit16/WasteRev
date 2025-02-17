document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    initializeMobileMenu();
});

function initializeCharts() {
    // Performance Chart
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'CPU Usage',
                    data: [30, 35, 45, 55, 70, 45],
                    borderColor: '#3498DB',
                    tension: 0.4
                }, {
                    label: 'Memory Usage',
                    data: [45, 50, 55, 60, 65, 55],
                    borderColor: '#2ECC71',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // User Activity Chart
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Users',
                    data: [820, 950, 900, 1100, 1050, 750, 700],
                    backgroundColor: '#3498DB'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }
}

function initializeMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Handle notifications
document.querySelector('.notifications')?.addEventListener('click', () => {
    // Add notification panel logic here
    console.log('Notifications clicked');
});

// Handle user profile
document.querySelector('.user-profile')?.addEventListener('click', () => {
    // Add profile menu logic here
    console.log('Profile clicked');
});

// Sample function to update stats
function updateSystemStats() {
    setInterval(() => {
        // Simulate real-time updates
        const cpuUsage = Math.floor(Math.random() * 20) + 80;
        const memoryUsage = Math.floor(Math.random() * 15) + 75;
        
        // Update values if elements exist
        document.querySelector('.system .value')?.textContent = `${cpuUsage}%`;
        document.querySelector('.security .details')?.textContent = 'Last scan: Just now';
    }, 5000);
}

// Initialize real-time updates
updateSystemStats();
