// Visual Effects Manager for Particles and Digital Sparks

class VFXManager {
    constructor() {
        // Container for particles
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100vw';
        this.container.style.height = '100vh';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '9999';
        this.container.style.overflow = 'hidden';
        document.body.appendChild(this.container);
    }

    // Digital Spark Explosion (Sci-fi Confetti)
    spawnConfetti(x, y) {
        const colors = ['#ff9800', '#ffd700', '#ffffff', '#00e5ff'];
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const el = document.createElement('div');
            el.style.position = 'absolute';
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.width = (Math.random() * 6 + 4) + 'px';
            el.style.height = (Math.random() * 6 + 4) + 'px';
            el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'; // Mix of squares and circles

            // Random velocity
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 100 + 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;

            el.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800 + Math.random() * 400,
                easing: 'cubic-bezier(0, .9, .57, 1)'
            }).onfinish = () => el.remove();

            this.container.appendChild(el);
        }
    }

    // Floating Text (XP Popups)
    spawnFloatingText(x, y, text, color = '#ff9800') {
        const el = document.createElement('div');
        el.textContent = text;
        el.style.position = 'absolute';
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.color = color;
        el.style.fontFamily = 'var(--font-tech)';
        el.style.fontSize = '20px';
        el.style.fontWeight = 'bold';
        el.style.pointerEvents = 'none';
        el.style.textShadow = '0 0 5px rgba(0,0,0,0.8)';

        el.animate([
            { transform: 'translate(-50%, 0) scale(0.5)', opacity: 0 },
            { transform: 'translate(-50%, -20px) scale(1.2)', opacity: 1, offset: 0.2 },
            { transform: 'translate(-50%, -60px) scale(1)', opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => el.remove();

        this.container.appendChild(el);
    }
}

export const vfxManager = new VFXManager();
