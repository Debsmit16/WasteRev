class VoiceGuide {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentVoice = null;
        
        // Initialize voices when they're loaded
        speechSynthesis.addEventListener('voiceschanged', () => {
            this.voices = this.synth.getVoices();
            this.currentVoice = this.voices.find(voice => voice.lang === 'en-US') || this.voices[0];
        });
    }

    speak(text, priority = 'normal') {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.currentVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        if (priority === 'high') {
            this.synth.cancel(); // Cancel current speech for high priority messages
        }
        
        this.synth.speak(utterance);
    }

    announcePhase(phase, duration) {
        const phrases = {
            inhale: "Breathe in...",
            hold: "Hold...",
            exhale: "Breathe out...",
            prepare: "Get ready...",
            complete: "Great job! Exercise complete."
        };
        
        this.speak(phrases[phase] || phase);
    }

    provideFeedback(quality) {
        const feedback = {
            excellent: [
                "Perfect breathing rhythm!",
                "Excellent work, keep it up!",
                "You're doing great!"
            ],
            good: [
                "Good pace, maintain this rhythm",
                "Nice steady breathing",
                "Keep going, you're doing well"
            ],
            improve: [
                "Try to breathe more slowly",
                "Focus on deeper breaths",
                "Remember to relax your shoulders"
            ]
        };

        const messages = feedback[quality] || feedback.good;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.speak(randomMessage, 'normal');
    }
}

export default VoiceGuide;
