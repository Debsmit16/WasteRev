"use strict";

class BreathingExercises {
    constructor() {
        this.exercises = {
            relaxation: {
                name: "4-7-8 Relaxation Breath",
                description: "A simple relaxing breathing pattern to reduce anxiety",
                duration: 5, // minutes
                pattern: { inhale: 4, hold: 7, exhale: 8 },
                difficulty: "easy",
                conditions: ["anxiety", "stress", "insomnia"]
            },
            pursedLips: {
                name: "Pursed Lip Breathing",
                description: "Helps control breathlessness and improve ventilation",
                duration: 3,
                pattern: { inhale: 2, exhale: 4 },
                difficulty: "easy",
                conditions: ["COPD", "asthma"]
            },
            diaphragmatic: {
                name: "Diaphragmatic Breathing",
                description: "Strengthens the diaphragm and reduces oxygen demand",
                duration: 10,
                pattern: { inhale: 3, hold: 2, exhale: 3 },
                difficulty: "medium",
                conditions: ["COPD", "asthma", "anxiety"]
            }
        };
        this.activeExercise = null;
        this.timer = null;
    }

    startExercise(exerciseKey) {
        const exercise = this.exercises[exerciseKey];
        if (!exercise) return;

        this.activeExercise = exercise;
        this.renderExerciseInterface(exercise);
        this.startBreathingAnimation(exercise.pattern);
    }

    renderExerciseInterface(exercise) {
        const container = document.querySelector('.breathing-interface');
        if (!container) return;

        container.innerHTML = `
            <div class="exercise-header">
                <h3>${exercise.name}</h3>
                <span class="difficulty ${exercise.difficulty}">${exercise.difficulty}</span>
            </div>
            <div class="breathing-circle">
                <div class="circle-animation"></div>
                <div class="breath-phase">Inhale</div>
                <div class="countdown">0:00</div>
            </div>
            <div class="exercise-controls">
                <button class="btn-start">Start</button>
                <button class="btn-pause" disabled>Pause</button>
                <button class="btn-stop" disabled>Stop</button>
            </div>
        `;

        this.setupControls();
    }

    setupControls() {
        const startBtn = document.querySelector('.btn-start');
        const pauseBtn = document.querySelector('.btn-pause');
        const stopBtn = document.querySelector('.btn-stop');

        startBtn?.addEventListener('click', () => this.startSession());
        pauseBtn?.addEventListener('click', () => this.pauseSession());
        stopBtn?.addEventListener('click', () => this.stopSession());
    }

    startBreathingAnimation(pattern) {
        const circle = document.querySelector('.circle-animation');
        const phaseText = document.querySelector('.breath-phase');
        if (!circle || !phaseText) return;

        const animate = (phase) => {
            circle.style.animation = '';
            phaseText.textContent = phase;
            
            requestAnimationFrame(() => {
                switch (phase) {
                    case 'Inhale':
                        circle.style.animation = `expand ${pattern.inhale}s ease-in-out`;
                        break;
                    case 'Hold':
                        circle.style.animation = `pulse ${pattern.hold}s ease-in-out`;
                        break;
                    case 'Exhale':
                        circle.style.animation = `contract ${pattern.exhale}s ease-in-out`;
                        break;
                }
            });
        };

        // Start the breathing cycle
        this.startBreathingCycle(pattern, animate);
    }

    startBreathingCycle(pattern, animate) {
        let phase = 'Inhale';
        animate(phase);

        const cycleLength = (pattern.inhale + (pattern.hold || 0) + pattern.exhale) * 1000;
        
        this.timer = setInterval(() => {
            switch (phase) {
                case 'Inhale':
                    phase = pattern.hold ? 'Hold' : 'Exhale';
                    break;
                case 'Hold':
                    phase = 'Exhale';
                    break;
                case 'Exhale':
                    phase = 'Inhale';
                    break;
            }
            animate(phase);
        }, cycleLength / 3);
    }

    stopSession() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.activeExercise = null;
        this.updateControls(false);
    }

    pauseSession() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.updateControls(true);
    }

    updateControls(isPaused) {
        const startBtn = document.querySelector('.btn-start');
        const pauseBtn = document.querySelector('.btn-pause');
        const stopBtn = document.querySelector('.btn-stop');

        if (startBtn) startBtn.disabled = !isPaused;
        if (pauseBtn) pauseBtn.disabled = isPaused;
        if (stopBtn) stopBtn.disabled = isPaused;
    }
}

export default BreathingExercises;
