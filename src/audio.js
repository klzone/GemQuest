// Web Audio API based Sound Manager for Sci-Fi effects
// No external assets required

class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Default volume
        this.masterGain.connect(this.ctx.destination);
        this.enabled = true;
    }

    // Resume context if suspended (browser policy)
    async init() {
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    playOscillator(type, freqStart, freqEnd, duration, vol = 1) {
        if (!this.enabled) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
        if (freqEnd) {
            osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
        }

        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    // UI Click - Short high-tech blip
    playClick() {
        // High frequency blip
        this.playOscillator('sine', 800, 1200, 0.1, 0.5);
    }

    // UI Back/Cancel - Lower tone
    playCancel() {
        this.playOscillator('triangle', 300, 100, 0.2, 0.5);
    }

    // Mission Success - Ascending chime
    playSuccess() {
        const now = this.ctx.currentTime;
        // Arpeggio
        this._playNote(now, 523.25, 0.1); // C5
        this._playNote(now + 0.1, 659.25, 0.1); // E5
        this._playNote(now + 0.2, 783.99, 0.4); // G5
    }

    // Error/Insufficient Funds - Buzzer
    playError() {
        this.playOscillator('sawtooth', 150, 100, 0.3, 0.5);
    }

    // Purchase/Equip - Nice mechanical sound
    playEquip() {
        // Noise burst simulated by quick frequency sweep on sawtooth
        this.playOscillator('square', 200, 2000, 0.15, 0.4);
    }

    // XP Gain - Rolling sound
    playCount() {
        this.playOscillator('sine', 1200, 1200, 0.05, 0.1);
    }

    // Help/Paper sound
    playOpenHelp() {
        this.playOscillator('triangle', 200, 400, 0.15, 0.3);
    }

    _playNote(startTime, freq, duration) {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.5, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }
}

export const audioManager = new AudioManager();
