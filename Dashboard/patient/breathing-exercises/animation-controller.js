class AnimationController {
    constructor() {
        this.animations = {
            inhale: this.createKeyframes('inhale'),
            exhale: this.createKeyframes('exhale'),
            hold: this.createKeyframes('hold')
        };
    }

    createKeyframes(phase) {
        switch (phase) {
            case 'inhale':
                return [
                    { transform: 'scale(1)', opacity: 0.7 },
                    { transform: 'scale(1.5)', opacity: 1 }
                ];
            case 'exhale':
                return [
                    { transform: 'scale(1.5)', opacity: 1 },
                    { transform: 'scale(1)', opacity: 0.7 }
                ];
            case 'hold':
                return [
                    { transform: 'scale(1.5)', opacity: 1, offset: 0 },
                    { transform: 'scale(1.45)', opacity: 0.95, offset: 0.5 },
                    { transform: 'scale(1.5)', opacity: 1, offset: 1 }
                ];
        }
    }

    animate(element, phase, duration) {
        const animation = element.animate(
            this.animations[phase],
            {
                duration: duration * 1000,
                easing: 'ease-in-out',
                fill: 'forwards'
            }
        );

        return animation.finished;
    }

    addParticleEffect(container) {
        const particle = document.createElement('div');
        particle.className = 'breath-particle';
        
        const randomPosition = () => ({
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50
        });

        const start = randomPosition();
        const end = randomPosition();

        particle.animate([
            { 
                transform: `translate(${start.x}px, ${start.y}px) scale(0)`,
                opacity: 0
            },
            {
                transform: `translate(${end.x}px, ${end.y}px) scale(1)`,
                opacity: 0.5,
                offset: 0.7
            },
            {
                transform: `translate(${end.x}px, ${end.y}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: 3000,
            easing: 'ease-out'
        });

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
    }
}

export default AnimationController;
