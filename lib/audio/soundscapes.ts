/**
 * Focus Sanctuary - Ambient Soundscapes & Binaural Beat Synthesizer
 * Built entirely with standard Web Audio API.
 * 100% offline, zero network requests, zero MP3 assets, zero API keys.
 */

export type SoundscapeType = 'none' | 'binaural_gamma' | 'binaural_alpha' | 'rain' | 'brown_noise' | 'library';

export interface SoundscapeInfo {
  id: SoundscapeType;
  name: string;
  description: string;
  category: 'binaural' | 'ambient';
  recommendedFor: string;
}

export const SOUNDSCAPE_LIST: SoundscapeInfo[] = [
  {
    id: 'binaural_gamma',
    name: '40Hz Gamma Focus',
    description: 'Binaural carrier generating 40Hz brainwave entrainment for deep analytical concentration.',
    category: 'binaural',
    recommendedFor: 'Math, Coding & Problem Solving',
  },
  {
    id: 'binaural_alpha',
    name: '10Hz Alpha Waves',
    description: 'Calm, relaxed alertness frequency that reduces exam anxiety while reading.',
    category: 'binaural',
    recommendedFor: 'Reading, Theory & Memorization',
  },
  {
    id: 'rain',
    name: 'Library Window Rain',
    description: 'Gentle organic rain patter with soft acoustic filtering.',
    category: 'ambient',
    recommendedFor: 'Focusing in noisy environments',
  },
  {
    id: 'brown_noise',
    name: 'Deep Brown Noise',
    description: 'Warm low-frequency rumble that masks background chatter and calms stress.',
    category: 'ambient',
    recommendedFor: 'Deep focus & Blocking distractions',
  },
  {
    id: 'library',
    name: 'Academic Hall',
    description: 'Warm collegiate room resonance with subtle acoustic warmth.',
    category: 'ambient',
    recommendedFor: 'Quiet evening study sessions',
  },
];

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private currentType: SoundscapeType = 'none';
  private volume: number = 0.4;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): SoundscapeType {
    return this.currentType;
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // Node already stopped
      }
    });
    this.activeNodes = [];
    this.currentType = 'none';
  }

  public play(type: SoundscapeType) {
    this.stop();
    if (type === 'none') return;

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.currentType = type;

    switch (type) {
      case 'binaural_gamma':
        this.startBinaural(200, 40); // 40Hz differential for gamma focus
        break;
      case 'binaural_alpha':
        this.startBinaural(210, 10); // 10Hz differential for alpha relaxation
        break;
      case 'rain':
        this.startRainSound();
        break;
      case 'brown_noise':
        this.startBrownNoise();
        break;
      case 'library':
        this.startLibrarySound();
        break;
    }
  }

  /**
   * Generates true stereo binaural beats.
   * Left ear: baseFreq
   * Right ear: baseFreq + beatFreq
   */
  private startBinaural(baseFreq: number, beatFreq: number) {
    if (!this.ctx || !this.masterGain) return;

    const merger = this.ctx.createChannelMerger(2);

    // Left oscillator
    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

    // Right oscillator
    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);

    // Sub-oscillator for warmth
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(baseFreq / 2, this.ctx.currentTime);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    subOsc.connect(subGain);

    // Individual gains
    const gainLeft = this.ctx.createGain();
    gainLeft.gain.setValueAtTime(0.25, this.ctx.currentTime);
    const gainRight = this.ctx.createGain();
    gainRight.gain.setValueAtTime(0.25, this.ctx.currentTime);

    oscLeft.connect(gainLeft);
    oscRight.connect(gainRight);

    gainLeft.connect(merger, 0, 0); // Left channel
    gainRight.connect(merger, 0, 1); // Right channel
    subGain.connect(merger, 0, 0);
    subGain.connect(merger, 0, 1);

    merger.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    this.activeNodes.push(oscLeft, oscRight, subOsc, merger, gainLeft, gainRight, subGain);
  }

  /**
   * Generates deep brown noise using audio buffer with Brownian random walk
   */
  private startBrownNoise() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain boost
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to roll off sharp highs
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter);
  }

  /**
   * Generates organic rainfall sound with modulated filters
   */
  private startRainSound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 3 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    const left = noiseBuffer.getChannelData(0);
    const right = noiseBuffer.getChannelData(1);

    let lastLeft = 0;
    let lastRight = 0;
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      left[i] = (lastLeft + 0.05 * whiteL) / 1.05;
      right[i] = (lastRight + 0.05 * whiteR) / 1.05;
      lastLeft = left[i];
      lastRight = right[i];
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    // Bandpass for gentle rainfall frequency
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.5, this.ctx.currentTime);

    // Subtle high shelf to give splash detail
    const highShelf = this.ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.setValueAtTime(3000, this.ctx.currentTime);
    highShelf.gain.setValueAtTime(-6, this.ctx.currentTime);

    rainSource.connect(filter);
    filter.connect(highShelf);
    highShelf.connect(this.masterGain);

    rainSource.start();
    this.activeNodes.push(rainSource, filter, highShelf);
  }

  /**
   * Generates library room acoustic warmth
   */
  private startLibrarySound() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.015 * white) / 1.015;
      lastOut = output[i];
      output[i] *= 2.0;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(320, this.ctx.currentTime);

    // Warm hum
    const hum = this.ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    hum.connect(humGain);

    noiseSource.connect(lowpass);
    lowpass.connect(this.masterGain);
    humGain.connect(this.masterGain);

    noiseSource.start();
    hum.start();

    this.activeNodes.push(noiseSource, lowpass, hum, humGain);
  }
}

// Singleton audio engine instance
export const soundscapeEngine = typeof window !== 'undefined' ? new SoundscapeEngine() : (null as any);
