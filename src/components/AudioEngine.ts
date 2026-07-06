class AudioSynthesizer {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playLockClick() {
    try {
      this.init();
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(800, now);
      osc1.frequency.exponentialRampToValueAtTime(1500, now + 0.04);
      
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(2000, now);
      osc2.frequency.exponentialRampToValueAtTime(100, now + 0.03);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(now + 0.05);
      osc2.stop(now + 0.05);
    } catch (e) {
      // ignore
    }
  }

  playDoorOpen() {
    try {
      this.init();
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      
      // 1. Low frequency wood/stone rumble creaking
      const rumble1 = this.ctx.createOscillator();
      const rumble2 = this.ctx.createOscillator();
      const rumbleGain = this.ctx.createGain();

      rumble1.type = "triangle";
      rumble1.frequency.setValueAtTime(50, now);
      rumble1.frequency.linearRampToValueAtTime(80, now + 1.5);

      rumble2.type = "sawtooth";
      rumble2.frequency.setValueAtTime(55, now);
      rumble2.frequency.linearRampToValueAtTime(30, now + 1.5);

      rumbleGain.gain.setValueAtTime(0.25, now);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      rumble1.connect(rumbleGain);
      rumble2.connect(rumbleGain);
      rumbleGain.connect(this.ctx.destination);

      rumble1.start();
      rumble2.start();
      rumble1.stop(now + 1.6);
      rumble2.stop(now + 1.6);

      // 2. High-pitch door friction creaking
      const creak = this.ctx.createOscillator();
      const creakGain = this.ctx.createGain();

      creak.type = "sawtooth";
      creak.frequency.setValueAtTime(280, now);
      creak.frequency.linearRampToValueAtTime(190, now + 1.0);

      creakGain.gain.setValueAtTime(0.04, now);
      creakGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

      creak.connect(creakGain);
      creakGain.connect(this.ctx.destination);

      creak.start();
      creak.stop(now + 1.0);
    } catch (e) {
      console.warn("Audio Context blocked or not supported:", e);
    }
  }

  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.setValueAtTime(75, now + 0.12);
      osc.frequency.setValueAtTime(55, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Audio error play caught:", e);
    }
  }

  playDefeat() {
    try {
      this.init();
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(30, now + 1.2);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 1.5);
    } catch (e) {
      // ignore
    }
  }

  playMetalClash() {
    try {
      this.init();
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;

      // 1. Multiple metal strike oscillators
      const freqs = [800, 1200, 1500, 2200, 2900];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gainNode = this.ctx!.createGain();
        
        osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq / 3, now + 0.5);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + (idx * 0.06));

        osc.connect(gainNode);
        gainNode.connect(this.ctx!.destination);

        osc.start();
        osc.stop(now + 0.4 + (idx * 0.06));
      });

      // 2. Synthesized white noise burst for chain clinks sliding down
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2500, now);
      filter.frequency.linearRampToValueAtTime(1000, now + 0.7);
      filter.Q.value = 3.0;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start();
      noise.stop(now + 0.7);
    } catch (e) {
      console.warn("Audio metal play caught:", e);
    }
  }

  playFootstep() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.08);
    } catch (e) {
      console.warn("Audio footstep play caught:", e);
    }
  }

  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(330, now); // E4
      osc1.frequency.setValueAtTime(440, now + 0.15); // A4
      osc1.frequency.setValueAtTime(554, now + 0.3); // C#5
      osc1.frequency.setValueAtTime(659, now + 0.45); // E5

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(165, now);
      osc2.frequency.setValueAtTime(220, now + 0.15);
      osc2.frequency.setValueAtTime(277, now + 0.3);
      osc2.frequency.setValueAtTime(329, now + 0.45);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.82);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } catch (e) {
      console.warn("Audio success play caught:", e);
    }
  }

  playSpookyPulse() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(48, now);
      osc.frequency.linearRampToValueAtTime(30, now + 2.0);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(80, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 2.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 2.0);
    } catch (e) {
      // ignore
    }
  }

  playKeyboard() {
    try {
      this.init();
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      // Synthesize a fast click/tap sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(200 + Math.random() * 400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(now + 0.05);
    } catch (e) {
      // ignore
    }
  }

  playPaper() {
    try {
      this.init();
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      
      // Create white noise for paper rustling
      const bufferSize = this.ctx.sampleRate * 0.15; // 0.15 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1200; // Book rustle frequency
      filter.Q.value = 1.0;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start();
      noiseNode.stop(now + 0.15);
    } catch (e) {
      // ignore
    }
  }

  // ── BGM 8-BIT SCHEDULER (Web Audio API Synthesized Loop) ──
  private bgmIntervalId: any = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;

  setMute(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem("crypto_quest_muted", muted ? "true" : "false");
  }

  getMuted(): boolean {
    return this.isMuted;
  }

  startBGM() {
    if (this.bgmPlaying) return;
    this.init();
    
    // Load previously saved mute configuration
    const savedMute = localStorage.getItem("crypto_quest_muted");
    if (savedMute === "true") {
      this.isMuted = true;
    }

    this.bgmPlaying = true;
    let step = 0;
    
    // Retro mystical arpeggio loop: Am -> F -> C -> E
    const melody = [
      220.00, 261.63, 329.63, 261.63, // Am (A3, C4, E4, C4)
      174.61, 220.00, 261.63, 220.00, // F (F3, A3, C4, A3)
      130.81, 164.81, 196.00, 164.81, // C (C3, E3, G3, E3)
      164.81, 207.65, 246.94, 207.65  // E (E3, G#3, B3, G#3)
    ];

    this.bgmIntervalId = setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state === "suspended") return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = "triangle";
        const freq = melody[step % melody.length];
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.04, now); // Soft background level
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.4);
        step++;
      } catch (e) {
        // ignore
      }
    }, 400);
  }

  stopBGM() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.bgmPlaying = false;
  }
}

export const sound = new AudioSynthesizer();
