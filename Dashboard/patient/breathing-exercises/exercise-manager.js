import AIBreathAnalyzer from './ai-breath-analyzer.js';

// Add debug logging at the top
console.log('Exercise manager script loading');

class BreathingExerciseManager {
    constructor() {
        console.log('Initializing exercise manager');
        this.currentExercise = null;
        this.isActive = false;
        this.timer = null;
        this.breathCount = 0;
        
        // Initialize audio feedback
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.setupAudioCues();

        // Initialize AI components
        this.aiAnalyzer = new AIBreathAnalyzer();
        this.setupAIFeatures();
    }

    setupAIFeatures() {
        // Setup real-time breath analysis
        this.breathAnalysis = {
            active: false,
            data: [],
            interval: null
        };

        // Setup voice recognition for commands
        if ('webkitSpeechRecognition' in window) {
            this.setupVoiceCommands();
        }
    }

    startExercise(type) {
        console.log('Starting exercise:', type);
        try {
            // Show the interface first
            const interface = document.querySelector('.breathing-interface');
            if (interface) {
                interface.style.display = 'block';
            } else {
                throw new Error('Interface container not found');
            }

            // Initialize the exercise
            this.currentExercise = this.getExercisePattern(type);
            this.isActive = true;
            
            // Update UI elements
            this.updateUIElements();
            
            // Start the exercise cycle
            this.startBreathingCycle();
            
            console.log('Exercise started successfully');
        } catch (error) {
            console.error('Error starting exercise:', error);
            alert('Failed to start exercise. Please try again.');
        }
    }

    updateUIElements() {
        try {
            // Update exercise title
            const titleElement = document.querySelector('.exercise-title');
            if (titleElement) {
                titleElement.textContent = this.currentExercise.name;
            }

            // Update timer
            const timerElement = document.querySelector('.time-remaining');
            if (timerElement) {
                timerElement.textContent = `${this.currentExercise.duration}:00`;
            }

            // Reset progress
            const progressElement = document.querySelector('.progress-ring-circle');
            if (progressElement) {
                progressElement.style.strokeDashoffset = '0';
            }
        } catch (error) {
            console.error('Error updating UI elements:', error);
        }
    }

    startBreathAnalysis() {
        this.breathAnalysis.active = true;
        this.breathAnalysis.interval = setInterval(() => {
            const analysis = this.aiAnalyzer.analyzeBreathPattern(this.getCurrentBreathData());
            this.updateMetrics(analysis);
            this.provideFeedback(analysis);
        }, 1000);
    }

    updateMetrics(analysis) {
        // Update UI with AI-analyzed metrics
        const metrics = document.querySelectorAll('.metric');
        metrics[0].querySelector('.value').textContent = `${analysis.rhythm}%`;
        metrics[0].querySelector('.progress').style.width = `${analysis.rhythm}%`;
        
        metrics[1].querySelector('.value').textContent = `${analysis.depth}%`;
        metrics[1].querySelector('.progress').style.width = `${analysis.depth}%`;

        // Add visual feedback
        this.updateBreathingCircle(analysis);
    }

    provideFeedback(analysis) {
        const feedback = document.querySelector('.feedback-message span');
        const tips = document.querySelector('.breathing-tips');
        
        feedback.textContent = this.aiAnalyzer.provideLiveGuidance(
            this.currentPhase, 
            analysis
        ).audio;

        tips.innerHTML = analysis.suggestions
            .map(tip => `<div class="tip"><i class="fas fa-lightbulb"></i>${tip}</div>`)
            .join('');
    }

    getExercisePattern(type) {
        const patterns = {
            relaxation: {
                name: "4-7-8 Relaxation Breath",
                steps: [
                    { phase: 'inhale', duration: 4 },
                    { phase: 'hold', duration: 7 },
                    { phase: 'exhale', duration: 8 }
                ],
                duration: 5 // minutes
            },
            pursedLips: {
                name: "Pursed Lip Breathing",
                steps: [
                    { phase: 'inhale', duration: 2 },
                    { phase: 'exhale', duration: 4 }
                ],
                duration: 3
            },
            diaphragmatic: {
                name: "Diaphragmatic Breathing",
                steps: [
                    { phase: 'inhale', duration: 3 },
                    { phase: 'hold', duration: 2 },
                    { phase: 'exhale', duration: 3 }
                ],
                duration: 5
            }
        };
        return patterns[type];
    }

    startBreathingCycle() {
        let currentStep = 0;
        const circle = document.querySelector('.circle-animation');
        const phaseText = document.querySelector('.phase-text');

        const runStep = async () => {
            if (!this.isActive) return;

            const step = this.currentExercise.steps[currentStep];
            phaseText.textContent = step.phase.charAt(0).toUpperCase() + step.phase.slice(1);
            
            // Animate circle
            circle.style.animation = '';
            requestAnimationFrame(() => {
                circle.style.animation = `${step.phase} ${step.duration}s ease-in-out`;
            });

            // Play sound cue
            this.playPhaseCue(step.phase);

            // Wait for step duration
            await new Promise(resolve => setTimeout(resolve, step.duration * 1000));

            // Move to next step
            currentStep = (currentStep + 1) % this.currentExercise.steps.length;
            if (currentStep === 0) {
                this.breathCount++;
                this.updateProgress();
            }

            if (this.isActive) {
                runStep();
            }
        };

        runStep();
    }

    updateProgress() {
        const totalBreaths = this.currentExercise.duration * 4; // Approximate breaths per minute
        const progress = (this.breathCount / totalBreaths) * 100;
        
        // Update progress ring
        const circle = document.querySelector('.progress-ring-circle');
        const circumference = 2 * Math.PI * 25; // r=25 from the SVG
        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference - (progress / 100) * circumference;

        // Update time remaining
        const timeRemaining = Math.max(0, this.currentExercise.duration - (this.breathCount / 4));
        const minutes = Math.floor(timeRemaining);
        const seconds = Math.floor((timeRemaining - minutes) * 60);
        document.querySelector('.time-remaining').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;

        if (timeRemaining <= 0) {
            this.completeExercise();
        }
    }

    setupAudioCues() {
        const createOscillator = (frequency, type = 'sine') => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            return { oscillator, gainNode };
        };

        this.sounds = {
            start: createOscillator(660),
            inhale: createOscillator(440),
            exhale: createOscillator(330),
            complete: createOscillator(880)
        };
    }

    playPhaseCue(phase) {
        if (!this.sounds[phase]) return;
        
        const { oscillator, gainNode } = this.sounds[phase];
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        setTimeout(() => oscillator.stop(), 100);
    }

    playStartSound() {
        this.playPhaseCue('start');
    }

    completeExercise() {
        this.isActive = false;
        this.playPhaseCue('complete');
        
        // Show completion message
        document.querySelector('.breathing-interface').innerHTML += `
            <div class="completion-message">
                <h2>Exercise Complete! 🎉</h2>
                <p>Great job! You've completed your breathing exercise.</p>
                <button class="btn-primary" onclick="location.reload()">Back to Exercises</button>
            </div>
        `;

        // Update achievements
        this.updateAchievements();
    }

    updateAchievements() {
        const achievements = document.querySelectorAll('.achievement');
        achievements[0].setAttribute('data-achieved', 'true');
        if (this.breathCount >= this.currentExercise.duration * 4) {
            achievements[1].setAttribute('data-achieved', 'true');
        }
    }

    pause() {
        this.isActive = false;
        document.querySelector('.circle-animation').style.animationPlayState = 'paused';
    }

    resume() {
        this.isActive = true;
        document.querySelector('.circle-animation').style.animationPlayState = 'running';
        this.startBreathingCycle();
    }
}

// Make sure it's available globally
window.BreathingExerciseManager = BreathingExerciseManager;
console.log('Exercise manager script loaded');
