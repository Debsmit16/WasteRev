document.addEventListener('DOMContentLoaded', function() {
    // Initialize Charts
    initializeCharts();

    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Handle notifications
    const notifications = document.querySelector('.notifications');
    notifications?.addEventListener('click', () => {
        // Add notification panel logic here
        console.log('Notifications clicked');
    });

    // Handle user profile
    const userProfile = document.querySelector('.user-profile');
    userProfile?.addEventListener('click', () => {
        // Add profile menu logic here
        console.log('Profile clicked');
    });

    // Symptom Logger Functionality
    const symptomModal = document.getElementById('symptomModal');
    const openSymptomBtn = document.getElementById('openSymptomLogger');
    const closeSymptomBtn = document.querySelector('#symptomModal .close-modal');
    const cancelSymptomBtn = document.getElementById('cancelSymptom');
    const symptomForm = document.getElementById('symptomForm');
    const severityInput = document.getElementById('severity');
    const severityValue = document.querySelector('.severity-value');

    // Open modal
    openSymptomBtn?.addEventListener('click', () => {
        symptomModal.style.display = 'flex';
    });

    // Close modal
    const closeSymptomModal = () => {
        symptomModal.style.display = 'none';
        symptomForm.reset();
    };

    closeSymptomBtn?.addEventListener('click', closeSymptomModal);
    cancelSymptomBtn?.addEventListener('click', closeSymptomModal);
    window.addEventListener('click', (e) => {
        if (e.target === symptomModal) closeSymptomModal();
    });

    // Update severity value
    severityInput?.addEventListener('input', (e) => {
        severityValue.textContent = e.target.value;
    });

    // Handle form submission
    symptomForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const symptomData = {
            type: document.getElementById('symptomType').value,
            severity: document.getElementById('severity').value,
            duration: document.getElementById('duration').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };

        // Add to symptoms timeline
        addSymptomToTimeline(symptomData);
        
        // Close modal and reset form
        closeSymptomModal();
    });

    // Initialize Online Consultation Features
    const consultationModal = document.getElementById('consultationModal');
    const openConsultationBtn = document.getElementById('openConsultationModal');
    const closeConsultationBtn = document.querySelector('#consultationModal .close-modal');
    const cancelConsultationBtn = document.getElementById('cancelConsultation');
    const consultationForm = document.getElementById('consultationForm');
    const specializationSelect = document.getElementById('specialization');
    const doctorSelect = document.getElementById('doctor');
    const dateInput = document.getElementById('consultationDate');

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;

    // Open modal
    openConsultationBtn?.addEventListener('click', () => {
        consultationModal.style.display = 'block';
    });

    // Close modal
    const closeModal = () => {
        consultationModal.style.display = 'none';
        consultationForm.reset();
    };

    closeConsultationBtn?.addEventListener('click', closeModal);
    cancelConsultationBtn?.addEventListener('click', closeModal);

    // Handle specialization change
    specializationSelect?.addEventListener('change', (e) => {
        const specialization = e.target.value;
        if (specialization) {
            doctorSelect.disabled = false;
            populateDoctors(specialization);
        } else {
            doctorSelect.disabled = true;
            doctorSelect.innerHTML = '<option value="">First select specialization</option>';
        }
    });

    // Handle date change
    dateInput?.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        const doctorId = doctorSelect.value;
        if (selectedDate && doctorId) {
            populateTimeSlots(doctorId, selectedDate);
        }
    });

    // Handle form submission
    consultationForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const consultationData = {
            specialization: specializationSelect.value,
            doctor: doctorSelect.value,
            date: dateInput.value,
            timeSlot: document.querySelector('.time-slot.selected')?.dataset.time,
            notes: document.getElementById('consultationNotes').value,
            type: document.querySelector('input[name="type"]:checked').value
        };

        // Add consultation to list
        addConsultationToList(consultationData);
        
        // Close modal and reset form
        closeModal();
    });

    // Initialize Appointments
    const appointmentsSection = document.querySelector('.appointments-section');
    const appointmentsList = appointmentsSection.querySelector('.appointments-list');
    
    // Add "Schedule New Appointment" button if it doesn't exist
    if (!appointmentsList.querySelector('.add-appointment-btn')) {
        const addAppointmentBtn = document.createElement('button');
        addAppointmentBtn.className = 'add-appointment-btn';
        addAppointmentBtn.innerHTML = '<i class="fas fa-plus"></i> Schedule New Appointment';
        appointmentsList.insertBefore(addAppointmentBtn, appointmentsList.firstChild);
        
        addAppointmentBtn.addEventListener('click', () => {
            let modal = document.getElementById('appointmentModal');
            if (!modal) {
                modal = createAppointmentModal();
            }
            modal.style.display = 'flex';  // Changed from 'block' to 'flex'
            initializeAppointmentModal(modal);
        });
    }

    initializeAppointments();
    // Show skeleton loading first
    showSkeletonLoading();

    // Initialize health metrics after a short delay
    setTimeout(() => {
        // Remove skeleton loading
        document.querySelectorAll('.health-card').forEach(card => {
            card.innerHTML = card.dataset.originalContent || card.innerHTML;
        });
        
        // Start updating metrics
        updateHealthMetrics();
    }, 1500);
});

function initializeCharts() {
    // Health Trends Chart
    const healthCtx = document.getElementById('healthChart');
    if (healthCtx) {
        new Chart(healthCtx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Respiratory Rate',
                    data: [18, 17, 19, 18, 16, 17, 18],
                    borderColor: '#FF69B4',
                    tension: 0.4
                }, {
                    label: 'Heart Rate',
                    data: [72, 75, 73, 70, 74, 72, 71],
                    borderColor: '#FF3B30',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Weekly Health Trends'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Activity Levels Chart
    const activityCtx = document.getElementById('activityChart');
    if (activityCtx) {
        new Chart(activityCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Activity Level',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    backgroundColor: '#FFB6C1',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Daily Activity Levels'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// Handle appointment actions
document.querySelectorAll('.btn-reschedule').forEach(btn => {
    btn.addEventListener('click', function() {
        // Add rescheduling logic here
        console.log('Reschedule appointment');
    });
});

document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', function() {
        // Add cancellation logic here
        console.log('Cancel appointment');
    });
});

// Handle medication actions
document.querySelectorAll('.btn-take').forEach(btn => {
    btn.addEventListener('click', function() {
        // Add medication tracking logic here
        console.log('Medication taken');
        this.textContent = 'Taken';
        this.classList.add('taken');
    });
});

// Add real-time updates for health metrics
function updateHealthMetrics() {
    // Add mock data initialization
    const mockData = {
        respiratory: { value: 18, trend: 'stable' },
        heart: { value: 75, trend: 'up' },
        oxygen: { value: 98, trend: 'stable' },
        temperature: { value: 36.8, trend: 'stable' }
    };

    // Update each health card with mock data
    Object.entries(mockData).forEach(([key, data]) => {
        const card = document.querySelector(`.health-card[data-type="${key}"]`);
        if (card) {
            const valueElement = card.querySelector('.value');
            const trendElement = card.querySelector('.trend');
            
            if (valueElement) {
                valueElement.textContent = data.value + (key === 'temperature' ? '°C' : '');
            }
            if (trendElement) {
                trendElement.innerHTML = getTrendHTML(data.trend);
            }
        }
    });

    const healthCards = {
        respiratory: {
            value: { min: 12, max: 20, unit: ' BPM' },
            element: document.querySelector('.health-card[data-type="respiratory"] .value'),
            trend: document.querySelector('.health-card[data-type="respiratory"] .trend')
        },
        heart: {
            value: { min: 60, max: 100, unit: ' BPM' },
            element: document.querySelector('.health-card[data-type="heart"] .value'),
            trend: document.querySelector('.health-card[data-type="heart"] .trend')
        },
        oxygen: {
            value: { min: 95, max: 100, unit: '%' },
            element: document.querySelector('.health-card[data-type="oxygen"] .value'),
            trend: document.querySelector('.health-card[data-type="oxygen"] .trend')
        },
        temperature: {
            value: { min: 36.1, max: 37.2, unit: '°C' },
            element: document.querySelector('.health-card[data-type="temperature"] .value'),
            trend: document.querySelector('.health-card[data-type="temperature"] .trend')
        }
    };

    const previousValues = {};

    function updateCard(key, card) {
        if (!card.element || !card.trend) {
            console.error(`Elements not found for ${key}`);
            return;
        }

        const range = card.value.max - card.value.min;
        const newValue = (card.value.min + Math.random() * range).toFixed(1);
        const oldValue = previousValues[key] || newValue;
        const change = (newValue - oldValue).toFixed(1);

        card.element.textContent = `${newValue}${card.value.unit}`;
        card.trend.innerHTML = getTrendHTML(change);
        previousValues[key] = newValue;

        // Debug log
        console.log(`Updated ${key}:`, { newValue, oldValue, change });
    }

    // Initial update
    Object.entries(healthCards).forEach(([key, card]) => {
        updateCard(key, card);
    });

    // Regular updates
    setInterval(() => {
        Object.entries(healthCards).forEach(([key, card]) => {
            updateCard(key, card);
        });
    }, 5000);
}

function getTrendHTML(change) {
    const value = Math.abs(change);
    if (Number(change) > 0) {
        return `<span class="trend up">
            <i class="fas fa-arrow-up"></i> ${value}
        </span>`;
    } else if (Number(change) < 0) {
        return `<span class="trend down">
            <i class="fas fa-arrow-down"></i> ${value}
        </span>`;
    }
    return `<span class="trend stable">
        <i class="fas fa-equals"></i> Stable
    </span>`;
}

function addSymptomToTimeline(symptom) {
    const timeline = document.querySelector('.symptoms-timeline');
    const entry = document.createElement('div');
    entry.className = 'symptom-entry';
    
    const severity = parseInt(symptom.severity);
    const severityColor = severity > 7 ? '#FF3B30' : severity > 4 ? '#FF9500' : '#34C759';
    
    entry.innerHTML = `
        <div class="symptom-icon" style="color: ${severityColor}">
            <i class="fas fa-heartbeat"></i>
        </div>
        <div class="symptom-details">
            <h4>${formatSymptomType(symptom.type)}</h4>
            <p>Severity: ${symptom.severity}/10</p>
            <p>Duration: ${formatDuration(symptom.duration)}</p>
            ${symptom.notes ? `<p class="notes">${symptom.notes}</p>` : ''}
            <span class="timestamp">${formatTimestamp(symptom.timestamp)}</span>
        </div>
        <button class="delete-symptom" title="Delete symptom">
            <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Add delete functionality
    const deleteBtn = entry.querySelector('.delete-symptom');
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this symptom entry?')) {
            entry.classList.add('fade-out');
            setTimeout(() => {
                entry.remove();
                // Here you would also delete from backend/storage
            }, 300);
        }
    });
    
    timeline.insertBefore(entry, timeline.firstChild);
}

function formatSymptomType(type) {
    return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatDuration(duration) {
    return duration.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

function populateDoctors(specialization) {
    // This would typically fetch from an API
    const doctorsBySpecialization = {
        general: [
            { id: 1, name: 'Dr. John Smith' },
            { id: 2, name: 'Dr. Sarah Johnson' }
        ],
        pulmonologist: [
            { id: 3, name: 'Dr. Michael Chen' },
            { id: 4, name: 'Dr. Emily Brown' }
        ],
        // Add more specializations
    };

    const doctors = doctorsBySpecialization[specialization] || [];
    const doctorSelect = document.getElementById('doctor');
    
    doctorSelect.innerHTML = `
        <option value="">Select doctor</option>
        ${doctors.map(doctor => 
            `<option value="${doctor.id}">${doctor.name}</option>`
        ).join('')}
    `;
}

function populateTimeSlots(doctorId, date) {
    // This would typically fetch from an API
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    const slotsContainer = document.querySelector('.time-slots');
    slotsContainer.innerHTML = `
        <div class="slots-grid">
            ${timeSlots.map(time => `
                <div class="time-slot" data-time="${time}">
                    ${time}
                </div>
            `).join('')}
        </div>
    `;

    // Add click handlers for time slots
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
            document.querySelectorAll('.time-slot').forEach(s => 
                s.classList.remove('selected'));
            slot.classList.add('selected');
        });
    });
}

function addConsultationToList(consultation) {
    const consultationList = document.querySelector('.consultation-list');
    const consultationElement = document.createElement('div');
    consultationElement.className = 'consultation-card';
    
    const typeIcon = {
        video: 'fa-video',
        audio: 'fa-phone',
        chat: 'fa-comments'
    }[consultation.type];

    consultationElement.innerHTML = `
        <div class="consultation-type-icon">
            <i class="fas ${typeIcon}"></i>
        </div>
        <div class="consultation-info">
            <h4>${document.getElementById('doctor').options[document.getElementById('doctor').selectedIndex].text}</h4>
            <div class="consultation-meta">
                <span><i class="far fa-calendar"></i> ${formatDate(consultation.date)}</span>
                <span><i class="far fa-clock"></i> ${consultation.timeSlot}</span>
            </div>
        </div>
        <div class="consultation-actions">
            <button class="join-btn" style="display: none;">
                <i class="fas ${typeIcon}"></i> Join
            </button>
            <button class="cancel-btn">Cancel</button>
        </div>
    `;

    // Show join button 5 minutes before consultation
    const consultationTime = new Date(`${consultation.date} ${consultation.timeSlot}`);
    const now = new Date();
    const timeUntilConsultation = consultationTime - now;
    
    if (timeUntilConsultation > 0) {
        setTimeout(() => {
            const joinBtn = consultationElement.querySelector('.join-btn');
            joinBtn.style.display = 'flex';
            
            // Add join functionality
            joinBtn.addEventListener('click', () => {
                // Implement video/audio/chat functionality
                console.log('Joining consultation...');
            });
        }, timeUntilConsultation - 5 * 60 * 1000); // 5 minutes before
    }

    consultationList.insertBefore(consultationElement, consultationList.firstChild);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function initializeAppointments() {
    // Keep the event handling
    document.querySelector('.add-appointment-btn')?.addEventListener('click', showAppointmentModal);
}

// Add appointment modal HTML dynamically
function createAppointmentModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'appointmentModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Schedule Appointment</h2>
                <span class="close-modal">&times;</span>
            </div>
            <form id="appointmentForm">
                <div class="form-group">
                    <label for="appointmentType">Appointment Type</label>
                    <select id="appointmentType" required>
                        <option value="">Select type</option>
                        <option value="checkup">Regular Checkup</option>
                        <option value="followup">Follow-up</option>
                        <option value="consultation">Consultation</option>
                        <option value="test">Medical Test</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="appointmentDate">Date</label>
                    <input type="date" id="appointmentDate" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="appointmentTime">Preferred Time</label>
                    <select id="appointmentTime" required>
                        <option value="">Select time</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="appointmentNotes">Notes</label>
                    <textarea id="appointmentNotes" rows="3" placeholder="Any specific concerns or notes..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Schedule Appointment</button>
                    <button type="button" class="btn-secondary" id="cancelAppointment">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function showAppointmentModal() {
    let modal = document.getElementById('appointmentModal');
    if (!modal) {
        modal = createAppointmentModal();
    }
    modal.style.display = 'block';
    
    // Initialize time slots based on date
    const dateInput = document.getElementById('appointmentDate');
    const timeSelect = document.getElementById('appointmentTime');
    
    dateInput.addEventListener('change', () => updateTimeSlots(timeSelect));
    
    // Add event listeners
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('#cancelAppointment');
    const appointmentForm = modal.querySelector('#appointmentForm');
    
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    appointmentForm.addEventListener('submit', handleAppointmentSubmit);
}

function updateTimeSlots(timeSelect) {
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    timeSelect.innerHTML = `
        <option value="">Select time</option>
        ${timeSlots.map(time => `
            <option value="${time}">${time}</option>
        `).join('')}
    `;
}

function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const appointmentData = {
        type: document.getElementById('appointmentType').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        notes: document.getElementById('appointmentNotes').value,
    };
    
    addAppointmentToList(appointmentData);
    document.getElementById('appointmentModal').style.display = 'none';
    e.target.reset();
}

function addAppointmentToList(appointment) {
    const appointmentsList = document.querySelector('.appointments-list');
    const appointmentCard = document.createElement('div');
    appointmentCard.className = 'appointment-card';
    
    const date = new Date(appointment.date);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        day: 'numeric',
        month: 'short'
    }).format(date);
    
    appointmentCard.innerHTML = `
        <div class="appointment-date">
            <span class="day">${formattedDate.split(' ')[1]}</span>
            <span class="month">${formattedDate.split(' ')[0]}</span>
        </div>
        <div class="appointment-info">
            <h3>${formatAppointmentType(appointment.type)}</h3>
            <p>${appointment.notes || 'No additional notes'}</p>
            <span class="time">${appointment.time}</span>
        </div>
        <div class="appointment-actions">
            <button class="btn-reschedule">Reschedule</button>
            <button class="btn-cancel">Cancel</button>
        </div>
    `;
    
    // Add event listeners for the new appointment card
    const rescheduleBtn = appointmentCard.querySelector('.btn-reschedule');
    const cancelBtn = appointmentCard.querySelector('.btn-cancel');
    
    rescheduleBtn.addEventListener('click', () => handleReschedule(appointmentCard));
    cancelBtn.addEventListener('click', () => handleCancel(appointmentCard));
    
    // Insert the new appointment card after the "Add Appointment" button
    const addButton = document.querySelector('.add-appointment-btn');
    addButton.insertAdjacentElement('afterend', appointmentCard);
}

function formatAppointmentType(type) {
    const types = {
        checkup: 'Regular Checkup',
        followup: 'Follow-up Appointment',
        consultation: 'Consultation',
        test: 'Medical Test'
    };
    return types[type] || type;
}

function handleReschedule(appointmentCard) {
    // Show appointment modal with current values pre-filled
    showAppointmentModal();
    // Remove the old appointment card after rescheduling
    appointmentCard.remove();
}

function handleCancel(appointmentCard) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        appointmentCard.classList.add('fade-out');
        setTimeout(() => {
            appointmentCard.remove();
        }, 300);
    }
}

function initializeAppointmentModal(modal) {
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('#cancelAppointment');
    const appointmentForm = modal.querySelector('#appointmentForm');
    const dateInput = modal.querySelector('#appointmentDate');
    const timeSelect = modal.querySelector('#appointmentTime');

    // Set minimum date to today
    dateInput.min = new Date().toISOString().split('T')[0];

    // Update time slots when date changes
    dateInput.addEventListener('change', () => updateTimeSlots(timeSelect));

    // Close modal handlers
    const closeModal = () => {
        modal.style.display = 'none';
        appointmentForm.reset();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Form submission
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const appointmentData = {
            type: document.getElementById('appointmentType').value,
            date: dateInput.value,
            time: timeSelect.value,
            notes: document.getElementById('appointmentNotes').value
        };

        addAppointmentToList(appointmentData);
        closeModal();
    });
}

// Add loading state handlers
function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Store the original HTML of health cards before showing skeleton loading
function showSkeletonLoading() {
    const cards = document.querySelectorAll('.health-card');
    cards.forEach(card => {
        // Explicitly store the original HTML structure
        const originalContent = `
            <div class="card-icon ${card.dataset.type}">
                <i class="fas ${getIconClass(card.dataset.type)}"></i>
            </div>
            <div class="card-info">
                <h3>${getCardTitle(card.dataset.type)}</h3>
                <p class="value">--</p>
                <span class="trend">
                    <i class="fas fa-minus"></i> Loading...
                </span>
            </div>
        `;
        card.dataset.originalContent = originalContent;
        
        // Show skeleton loading
        card.innerHTML = `
            <div class="skeleton" style="width: 60px; height: 60px; border-radius: 15px;"></div>
            <div style="flex: 1">
                <div class="skeleton" style="width: 100px; height: 20px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 60px; height: 30px; margin-bottom: 8px;"></div>
                <div class="skeleton" style="width: 80px; height: 15px;"></div>
            </div>
        `;
    });
}

function getIconClass(type) {
    const icons = {
        respiratory: 'fa-lungs',
        heart: 'fa-heartbeat',
        oxygen: 'fa-wind',
        temperature: 'fa-thermometer-half'
    };
    return icons[type] || 'fa-chart-line';
}

function getCardTitle(type) {
    const titles = {
        respiratory: 'Respiratory Rate',
        heart: 'Heart Rate',
        oxygen: 'Oxygen Level',
        temperature: 'Temperature'
    };
    return titles[type] || 'Measurement';
}

// Enhance form submissions with loading states
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', async (e) => {
        if (!form.hasAttribute('data-no-loading')) {
            const submitBtn = form.querySelector('[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Processing...';
            
            try {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
                // Your form submission logic here
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });
});

// Add smooth transitions for modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    });
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.opacity = '0';
    modal.querySelector('.modal-content').style.transform = 'translateY(20px)';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Initialize transitions
document.addEventListener('DOMContentLoaded', () => {
    // Show skeleton loading
    showSkeletonLoading();
    
    // Simulate data loading
    setTimeout(() => {
        initializeCharts();
        updateHealthMetrics();
    }, 1500);

    // Add transition classes
    document.querySelectorAll('.health-card, .symptom-entry, .appointment-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, Math.random() * 500);
    });
});

document.querySelector('a[href="#genetic-testing"]').addEventListener('click', (e) => {
    e.preventDefault();
    showGeneticTestingSection();
});

function showGeneticTestingSection() {
    // Hide other sections
    const sections = document.querySelectorAll('.dashboard-content > section');
    sections.forEach(section => section.style.display = 'none');

    // Show genetic testing section
    let geneticSection = document.querySelector('.genetic-testing-section');
    if (!geneticSection) {
        geneticSection = createGeneticTestingSection();
    }
    geneticSection.style.display = 'block';

    // Update active tab
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    document.querySelector('a[href="#genetic-testing"]').parentElement.classList.add('active');
}

function createGeneticTestingSection() {
    const section = document.createElement('section');
    section.className = 'genetic-testing-section';
    section.innerHTML = `
        <h2><i class="fas fa-dna"></i> Genetic Testing</h2>
        <div class="genetic-tests-grid">
            <div class="test-card new-test">
                <div class="test-icon">
                    <i class="fas fa-plus"></i>
                </div>
                <div class="test-info">
                    <h3>Request New Test</h3>
                    <p>Explore your genetic profile</p>
                    <button class="btn-primary">Start Request</button>
                </div>
            </div>
            <div class="test-card">
                <div class="test-icon">
                    <i class="fas fa-dna"></i>
                </div>
                <div class="test-info">
                    <h3>Comprehensive Genome Analysis</h3>
                    <p>Full genetic profile analysis</p>
                    <span class="test-status pending">Pending</span>
                    <button class="btn-secondary">View Details</button>
                </div>
            </div>
        </div>
    `;

    document.querySelector('.dashboard-content').appendChild(section);
    return section;
}

// Add this to your event listeners
document.querySelector('a[href="#breathing-exercises"]')?.addEventListener('click', (e) => {
    window.location.href = 'breathing-exercises.html';
});

// Initialize breathing exercises
document.addEventListener('DOMContentLoaded', () => {
    const exercisesList = document.querySelector('.exercise-cards');
    if (exercisesList) {
        // Add example exercise cards
        exercisesList.innerHTML = `
            <div class="exercise-card" data-exercise="relaxation">
                <div class="exercise-header">
                    <h3>4-7-8 Relaxation Breath</h3>
                    <span class="difficulty easy">Easy</span>
                </div>
                <p>A simple relaxing breathing pattern to reduce anxiety</p>
                <button class="btn-primary start-exercise">Start Exercise</button>
            </div>
            <div class="exercise-card" data-exercise="pursedLips">
                <div class="exercise-header">
                    <h3>Pursed Lip Breathing</h3>
                    <span class="difficulty easy">Easy</span>
                </div>
                <p>Helps control breathlessness and improve ventilation</p>
                <button class="btn-primary start-exercise">Start Exercise</button>
            </div>
            <div class="exercise-card" data-exercise="diaphragmatic">
                <div class="exercise-header">
                    <h3>Diaphragmatic Breathing</h3>
                    <span class="difficulty medium">Medium</span>
                </div>
                <p>Strengthens the diaphragm and reduces oxygen demand</p>
                <button class="btn-primary start-exercise">Start Exercise</button>
            </div>
        `;

        // Add click handlers for exercise cards
        document.querySelectorAll('.start-exercise').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.exercise-card');
                const exerciseType = card.dataset.exercise;
                breathingExercises.startExercise(exerciseType);
            });
        });
    }
});
