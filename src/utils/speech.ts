class SpeechSpeaker {
  private isMuted: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCtx: AudioContext | null = null;

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  getIsMuted(): boolean {
    return this.isMuted;
  }

  playChime() {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (this.audioCtx) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.3);
      }
    } catch {
      // AudioContext may be blocked before gesture
    }
  }

  playFanfare() {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (this.audioCtx) {
        const chords = [
          { f: 523.25, d: 0.12 }, // C5
          { f: 659.25, d: 0.12 }, // E5
          { f: 783.99, d: 0.14 }, // G5
          { f: 1046.50, d: 0.35 } // C6
        ];
        let offset = 0;
        chords.forEach((c) => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.type = 'triangle';
          const t = this.audioCtx.currentTime + offset;
          osc.frequency.setValueAtTime(c.f, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + c.d);
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(t);
          osc.stop(t + c.d + 0.05);
          offset += 0.1;
        });
      }
    } catch {
      // AudioContext blocked
    }
  }

  speak(text: string) {
    if (this.isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      this.playChime();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = 'en-IN';

      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find(
        (v) => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india')
      );
      if (inVoice) {
        utterance.voice = inVoice;
      }
      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  }

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechSpeaker = new SpeechSpeaker();
