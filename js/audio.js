/**
 * RESCUEX Audio Engine
 * Emergency Siren, Dispatch Voice Announcer, Alert Pings, and CPR Metronome
 * Powered by Web Audio API & SpeechSynthesis
 */

class EmergencyAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.sirenOscillator = null;
    this.sirenGain = null;
    this.sirenModulator = null;
    this.isSirenPlaying = false;
    this.cprInterval = null;
    this.isCprPlaying = false;
  }

  // Lazy-initialize Web Audio Context on first user gesture
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Start authentic high-low European / Ambulance dual-frequency emergency siren
   */
  startSiren() {
    this.initAudio();
    if (this.isSirenPlaying) return;

    try {
      // Primary Oscillator
      this.sirenOscillator = this.audioCtx.createOscillator();
      this.sirenGain = this.audioCtx.createGain();

      this.sirenOscillator.type = 'sawtooth';
      this.sirenOscillator.frequency.setValueAtTime(650, this.audioCtx.currentTime);

      // Low frequency oscillator for pitch modulation (wail effect: 600Hz - 950Hz)
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.75, this.audioCtx.currentTime); // 0.75 Hz cycle

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(250, this.audioCtx.currentTime); // sweep width

      lfo.connect(this.sirenOscillator.frequency);
      lfo.start();
      this.sirenModulator = lfo;

      // Master volume for siren
      this.sirenGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

      this.sirenOscillator.connect(this.sirenGain);
      this.sirenGain.connect(this.audioCtx.destination);

      this.sirenOscillator.start();
      this.isSirenPlaying = true;
    } catch (e) {
      console.warn('Siren audio initialization failed:', e);
    }
  }

  /**
   * Stop the emergency siren
   */
  stopSiren() {
    if (!this.isSirenPlaying) return;
    try {
      if (this.sirenGain) {
        this.sirenGain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      }
      setTimeout(() => {
        if (this.sirenOscillator) {
          this.sirenOscillator.stop();
          this.sirenOscillator.disconnect();
        }
        if (this.sirenModulator) {
          this.sirenModulator.stop();
          this.sirenModulator.disconnect();
        }
        this.isSirenPlaying = false;
      }, 350);
    } catch (e) {
      this.isSirenPlaying = false;
    }
  }

  toggleSiren() {
    if (this.isSirenPlaying) {
      this.stopSiren();
      return false;
    } else {
      this.startSiren();
      return true;
    }
  }

  /**
   * Play high-urgency short alert ping (beep)
   */
  playAlertBeep(freq = 880, duration = 0.15) {
    this.initAudio();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.log('Beep audio not permitted without user gesture');
    }
  }

  /**
   * Play impact crash sound effect
   */
  playCrashSound() {
    this.initAudio();
    try {
      const now = this.audioCtx.currentTime;
      // White noise buffer for crash impact
      const bufferSize = this.audioCtx.sampleRate * 0.8;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      // Filter to simulate metallic crash rumble
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.8);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      noise.start(now);
    } catch (e) {
      console.log('Crash sound error:', e);
    }
  }

  /**
   * CPR Metronome (American Heart Association standard: 110 BPM)
   */
  startCprMetronome(onTick) {
    this.initAudio();
    if (this.isCprPlaying) return;

    this.isCprPlaying = true;
    const intervalMs = (60 / 110) * 1000; // ~545ms per beat

    const tick = () => {
      if (!this.isCprPlaying) return;
      this.playAlertBeep(1046.5, 0.08); // High C
      if (typeof onTick === 'function') onTick();
    };

    tick();
    this.cprInterval = setInterval(tick, intervalMs);
  }

  stopCprMetronome() {
    this.isCprPlaying = false;
    if (this.cprInterval) {
      clearInterval(this.cprInterval);
      this.cprInterval = null;
    }
  }

  toggleCprMetronome(onTick) {
    if (this.isCprPlaying) {
      this.stopCprMetronome();
      return false;
    } else {
      this.startCprMetronome(onTick);
      return true;
    }
  }

  /**
   * Emergency Voice Dispatch Announcer (Speech Synthesis)
   */
  speak(message, lang = 'en-US') {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop prior speech
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.lang = lang;

    // Pick a natural English or local voice if available
    const voices = window.speechSynthesis.getVoices();
    const emergencyVoice = voices.find(v => v.lang.startsWith(lang.slice(0, 2)) && v.name.includes('Natural')) 
      || voices.find(v => v.lang.startsWith(lang.slice(0, 2))) 
      || voices[0];

    if (emergencyVoice) utterance.voice = emergencyVoice;

    window.speechSynthesis.speak(utterance);
  }
}

// Global instance
window.RescueAudio = new EmergencyAudioEngine();
