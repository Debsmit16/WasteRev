document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    initializeSchedule();

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Initialize patient monitoring updates
    updatePatientMonitoring();
});

function initializeCharts() {
    // Patient Statistics Chart
    const patientCtx = document.getElementById('patientChart');
    if (patientCtx) {
        new Chart(patientCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'New Patients',
                    data: [65, 78, 90, 85, 95, 100],
                    borderColor: '#4A90E2',
                    tension: 0.4
                }, {
                    label: 'Recovery Rate',
                    data: [55, 65, 75, 72, 80, 85],
                    borderColor: '#34C759',
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

    // Treatment Success Rate Chart
    const treatmentCtx = document.getElementById('treatmentChart');
    if (treatmentCtx) {
        new Chart(treatmentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Successful', 'In Progress', 'Needs Review'],
                datasets: [{
                    data: [75, 20, 5],
                    backgroundColor: [
                        '#34C759',
                        '#4A90E2',
                        '#FF9500'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

function initializeSchedule() {
    const timeline = document.querySelector('.schedule-timeline');
    if (!timeline) return;

    // Sample schedule data
    const appointments = [
        { time: '09:00', patient: 'John Doe', type: 'Check-up' },
        { time: '10:30', patient: 'Jane Smith', type: 'Follow-up' },
        { time: '11:45', patient: 'Mike Johnson', type: 'Consultation' },
        // Add more appointments as needed
    ];

    // Render appointments
    appointments.forEach(apt => {
        const aptElement = document.createElement('div');
        aptElement.className = 'appointment-slot';
        aptElement.innerHTML = `
            <div class="time">${apt.time}</div>
            <div class="details">
                <strong>${apt.patient}</strong>
                <span>${apt.type}</span>
            </div>
        `;
        timeline.appendChild(aptElement);
    });
}

function updatePatientMonitoring() {
    // Simulate real-time updates for patient vitals
    setInterval(() => {
        document.querySelectorAll('.vital .value').forEach(vital => {
            // Random fluctuation in values
            const currentValue = parseInt(vital.textContent);
            const fluctuation = Math.random() * 2 - 1;
            const newValue = Math.round(currentValue + fluctuation);
            
            vital.textContent = `${newValue} ${vital.textContent.split(' ')[1]}`;
            
            // Update status colors based on values
            if (newValue > 25 && vital.textContent.includes('BPM')) {
                vital.classList.add('critical');
            } else if (newValue < 94 && vital.textContent.includes('%')) {
                vital.classList.add('warning');
            } else {
                vital.classList.remove('critical', 'warning');
            }
        });
    }, 5000);
}

// Handle patient card actions
document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', function() {
        const patientId = this.closest('.patient-card').querySelector('.patient-id').textContent;
        console.log(`Viewing details for ${patientId}`);
        // Add navigation to patient details page
    });
});

document.querySelectorAll('.btn-secondary').forEach(btn => {
    btn.addEventListener('click', function() {
        const patientName = this.closest('.patient-card').querySelector('h3').textContent;
        console.log(`Opening communication with ${patientName}`);
        // Add communication functionality
    });
});
