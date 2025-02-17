console.log('Exercise controller loading...');

class ExerciseController {
    constructor() {
        console.log('Exercise controller initialized');
        this.currentPhase = 'inhale';
        this.isRunning = false;
        this.patterns = {
            beginner: { inhale: 4, hold: 4, exhale: 4 },
            intermediate: { inhale: 4, hold: 7, exhale: 8 },
            advanced: { inhale: 5, hold: 7, exhale: 9 }
        };
        this.feedback = {
            excellent: ['Perfect rhythm!', 'Keep it up!', 'You\'re doing great!'],
            good: ['Good pace', 'Nice and steady', 'Maintain this rhythm'],
            improve: ['Try to slow down', 'Breathe more deeply', 'Stay relaxed']
        };
        this.init();
    }

    init() {
        this.interface = document.getElementById('exerciseInterface');
        this.circle = document.querySelector('.circle-animation');
        this.phaseText = document.querySelector('.phase-text');
        this.timer = document.querySelector('.timer');
        this.feedbackText = document.querySelector('.feedback');
        
        this.setupControls();
        this.setupBreathDetection();
    }

    setupControls() {
        const playButton = document.querySelector('.btn-play');
        playButton?.addEventListener('click', () => {
            if (this.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        });
    }

    async setupBreathDetection() {
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.analyzeAudio(stream);
            } catch (error) {
                console.log('Audio capture not available:', error);
            }
        }
    }

    analyzeAudio(stream) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        
        source.connect(analyzer);
        this.updateBreathingMetrics(analyzer);
    }

    updateBreathingMetrics(analyzer) {
        const updateMetrics = () => {
            const dataArray = new Uint8Array(analyzer.frequencyBinCount);
            analyzer.getByteFrequencyData(dataArray);
            
            // Simple breath detection based on audio intensity
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            this.updateUI(average);
        };

        setInterval(updateMetrics, 100);
    }

    updateUI(intensity) {
        // Update progress bars and metrics based on breathing intensity
        const progressBars = document.querySelectorAll('.progress');
        progressBars[0].style.width = `${Math.min(intensity, 100)}%`;
        
        // Provide feedback
        this.provideFeedback(intensity);
    }

    provideFeedback(intensity) {
        let feedback;
        if (intensity < 30) {
            feedback = this.feedback.improve[Math.floor(Math.random() * this.feedback.improve.length)];
        } else if (intensity < 70) {
            feedback = this.feedback.good[Math.floor(Math.random() * this.feedback.good.length)];
        } else {
            feedback = this.feedback.excellent[Math.floor(Math.random() * this.feedback.excellent.length)];
        }
        
        this.feedbackText.textContent = feedback;
    }

    start() {
        this.isRunning = true;
        this.updateButtonState();
        this.startBreathingCycle();
    }

    pause() {
        this.isRunning = false;
        this.updateButtonState();
        if (this.cycleInterval) {
            clearInterval(this.cycleInterval);
        }
    }

    updateButtonState() {
        const playButton = document.querySelector('.btn-play i');
        if (playButton) {
            playButton.className = this.isRunning ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    startBreathingCycle() {
        const pattern = this.patterns.beginner;
        this.animateBreathing(pattern);
    }

    animateBreathing(pattern) {
        const cycle = async () => {
            // Inhale
            this.phaseText.textContent = 'Inhale';
            this.circle.style.transform = 'scale(1.5)';
            await this.wait(pattern.inhale);

            // Hold
            this.phaseText.textContent = 'Hold';
            await this.wait(pattern.hold);

            // Exhale
            this.phaseText.textContent = 'Exhale';
            this.circle.style.transform = 'scale(1)';
            await this.wait(pattern.exhale);
        };

        this.cycleInterval = setInterval(cycle, (pattern.inhale + pattern.hold + pattern.exhale) * 1000);
        cycle(); // Start first cycle immediately
    }

    wait(seconds) {
        return new Promise(resolve => setTimeout(resolve, seconds * 1000));
    }

    updateAchievements(metrics) {
        const achievements = this.checkAchievements(metrics);
        if (achievements.length > 0) {
            this.showAchievementModal(achievements[0]);
        }
    }

    checkAchievements(metrics) {
        const newAchievements = [];
        
        if (metrics.rhythm > 95) {
            newAchievements.push({
                name: 'Perfect Rhythm',
                description: 'Maintained perfect breathing rhythm',
                points: 50,
                icon: 'fa-medal'
            });
        }

        if (this.sessionCount === 5) {
            newAchievements.push({
                name: '5-Day Streak',
                description: 'Completed 5 days in a row',
                points: 100,
                icon: 'fa-trophy'
            });
        }

        return newAchievements;
    }

    showAchievementModal(achievement) {
        const modal = document.querySelector('.achievement-modal');
        const nameEl = modal.querySelector('.achievement-name');
        const pointsEl = modal.querySelector('.achievement-points');

        nameEl.textContent = achievement.name;
        pointsEl.textContent = `+${achievement.points} points`;
        modal.style.display = 'flex';

        // Add celebration effects
        this.playCelebrationEffect();
    }

    playCelebrationEffect() {
        const celebration = document.createElement('div');
        celebration.className = 'celebration-effect';
        document.body.appendChild(celebration);

        // Remove after animation
        setTimeout(() => celebration.remove(), 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.exerciseController = new ExerciseController();
});

export default ExerciseController;
