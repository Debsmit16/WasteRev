class EmergencyService {
    constructor() {
        this.userLocation = null;
        this.vitalSigns = null;
        this.medicalHistory = null;
        this.currentMedications = [];
        this.emergencyContacts = {
            primary: null,
            secondary: null,
            familyDoctor: null,
            specialists: []
        };
        this.init();
        this.setupVoiceControl();
    }

    async init() {
        await this.updateLocation();
        await this.findNearestHospital();
    }

    setupVoiceControl() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            this.recognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
                if (command.includes('emergency') || command.includes('help')) {
                    this.triggerEmergency();
                }
            };

            // Start listening
            this.recognition.start();
        }
    }

    async loadPatientData() {
        try {
            // Load vital signs from health monitoring devices
            this.vitalSigns = await this.getLatestVitalSigns();
            
            // Load medical history
            this.medicalHistory = await this.getMedicalHistory();
            
            // Load current medications
            this.currentMedications = await this.getCurrentMedications();
            
            // Load emergency contacts
            const contacts = await this.loadEmergencyContacts();
            this.emergencyContacts = { ...this.emergencyContacts, ...contacts };
        } catch (error) {
            console.error('Error loading patient data:', error);
        }
    }

    async updateLocation() {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            this.userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            return this.userLocation;
        } catch (error) {
            console.error('Location access denied:', error);
            return null;
        }
    }

    async findNearestHospital() {
        if (!this.userLocation) return null;
        
        try {
            const response = await fetch(`/api/nearest-hospitals?lat=${this.userLocation.lat}&lng=${this.userLocation.lng}`);
            const data = await response.json();
            this.emergencyContacts.nearestHospital = data.nearest;
            return data.nearest;
        } catch (error) {
            console.error('Failed to find nearest hospital:', error);
            return null;
        }
    }

    async triggerEmergency() {
        try {
            await this.loadPatientData();
            await this.updateLocation();

            // Sound alarm
            this.playEmergencySound();

            // Prepare comprehensive emergency data
            const emergencyData = {
                location: this.userLocation,
                timestamp: new Date().toISOString(),
                patientInfo: {
                    id: localStorage.getItem('patientId'),
                    name: localStorage.getItem('patientName'),
                    age: localStorage.getItem('patientAge'),
                    bloodType: localStorage.getItem('bloodType'),
                    allergies: localStorage.getItem('allergies'),
                    medicalConditions: this.medicalHistory?.conditions || [],
                    currentMedications: this.currentMedications,
                    vitalSigns: this.vitalSigns
                },
                emergencyContacts: this.emergencyContacts
            };

            // Send emergency alerts
            await Promise.all([
                this.notifyEmergencyServices(emergencyData),
                this.notifyEmergencyContacts(emergencyData),
                this.notifyNearestHospital(emergencyData)
            ]);

            return {
                success: true,
                message: 'Emergency services and contacts have been notified',
                nearestHospital: this.emergencyContacts.nearestHospital
            };
        } catch (error) {
            console.error('Emergency trigger failed:', error);
            this.handleEmergencyFailure();
            return {
                success: false,
                message: 'Emergency alert failed. Please dial 911 directly.',
                errorDetails: error.message
            };
        }
    }

    playEmergencySound() {
        const audio = new Audio('/assets/sounds/emergency-alarm.mp3');
        audio.loop = true;
        audio.play();
        this.emergencyAudio = audio;
    }

    handleEmergencyFailure() {
        // Show manual emergency numbers
        const emergencyNumbers = {
            ambulance: '911',
            police: '911',
            fire: '911',
            poison: '1-800-222-1222'
        };

        const message = `
            Emergency alert failed. Please call:
            ${Object.entries(emergencyNumbers)
                .map(([service, number]) => `${service}: ${number}`)
                .join('\n')}
        `;

        alert(message);
    }

    async sendEmergencyAlert(data) {
        // Implement your emergency alert system here
        console.log('Emergency alert sent:', data);
        return true;
    }
}

export default EmergencyService;
