import type { FeedbackEvent } from './feedback.ts';

const melodies: Record<FeedbackEvent, readonly number[]> = {
  eat: [660, 880], loss: [220, 147], win: [523, 659, 784],
};

// Generated tones keep this small game independent of external audio assets.
export class GameAudio {
  private context: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  enabled = false;

  private createContext: () => AudioContext;

  constructor(createContext: () => AudioContext = () => new AudioContext()) {
    this.createContext = createContext;
  }

  async setEnabled(enabled: boolean): Promise<boolean> {
    this.enabled = false;
    this.stop();
    if (!enabled) return false;
    try {
      this.context ??= this.createContext();
      await this.context.resume();
      this.enabled = this.context.state === 'running';
    } catch {
      this.enabled = false;
    }
    return this.enabled;
  }

  play(event: FeedbackEvent): void {
    const context = this.context;
    if (!this.enabled || !context || context.state !== 'running') return;
    this.stop();
    melodies[event].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + index * 0.085;
      oscillator.type = event === 'loss' ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.04, start + 0.01);
      gain.gain.linearRampToValueAtTime(0, start + 0.12);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.onended = () => {
        this.voices.delete(oscillator);
        oscillator.disconnect();
        gain.disconnect();
      };
      this.voices.add(oscillator);
      oscillator.start(start);
      oscillator.stop(start + 0.13);
    });
  }

  stop(): void {
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
  }
}
