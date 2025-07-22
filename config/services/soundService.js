// services/soundService.js - Centralized Sound Management
// This service handles all audio generation and playback for the app

import { SOUND_CONFIG, SOUND_TYPES } from '../assets.js';

class SoundService {
  constructor() {
    this.audioContext = null;
    this.isEnabled = true;
    this.volume = 0.3;
    
    // Initialize audio context on first use
    this.initAudioContext = this.initAudioContext.bind(this);
  }

  // Initialize Web Audio API context
  initAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return true;
      } catch (error) {
        console.warn('Audio not supported:', error);
        this.isEnabled = false;
        return false;
      }
    }
    return true;
  }

  // Enable/disable sound system
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Set global volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  // Play a pre-configured sound
  playSound(soundType) {
    if (!this.isEnabled || !this.initAudioContext()) return;

    const config = SOUND_CONFIG[soundType];
    if (!config) {
      console.warn(`Sound type ${soundType} not found`);
      return;
    }

    try {
      if (config.type === 'sequence') {
        this.playSequence(config.notes, config.volume || this.volume);
      } else if (config.type === 'single') {
        this.playTone(config.frequency, config.duration, config.volume || this.volume);
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  // Play a sequence of tones
  playSequence(notes, volume = this.volume) {
    let currentTime = this.audioContext.currentTime;
    
    notes.forEach(note => {
      this.playToneAtTime(note.frequency, note.duration, volume, currentTime);
      currentTime += note.duration;
    });
  }

  // Play a single tone
  playTone(frequency, duration, volume = this.volume) {
    this.playToneAtTime(frequency, duration, volume, this.audioContext.currentTime);
  }

  // Play tone at specific time (for sequences)
  playToneAtTime(frequency, duration, volume, startTime) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = 'sine'; // Can be 'sine', 'square', 'sawtooth', 'triangle'
    
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // Play custom sound with parameters
  playCustomSound(frequency, duration, volume = this.volume, waveType = 'sine') {
    if (!this.isEnabled || !this.initAudioContext()) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = waveType;
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Custom sound playback failed:', error);
    }
  }

  // Play success sound (XP award)
  playSuccessSound() {
    this.playSound(SOUND_TYPES.xpAward);
  }

  // Play level up sound
  playLevelUpSound() {
    this.playSound(SOUND_TYPES.levelUp);
  }

  // Play quest completion sound
  playQuestCompleteSound() {
    this.playSound(SOUND_TYPES.questComplete);
  }

  // Play purchase sound
  playPurchaseSound() {
    this.playCustomSound(800, 0.1, this.volume);
  }

  // Play error sound
  playErrorSound() {
    this.playCustomSound(200, 0.3, this.volume, 'square');
  }

  // Play notification sound
  playNotificationSound() {
    this.playCustomSound(600, 0.2, this.volume);
  }

  // Play race start sound
  playRaceStartSound() {
    const notes = [
      { frequency: 523.25, duration: 0.2 }, // C5
      { frequency: 659.25, duration: 0.2 }, // E5
      { frequency: 783.99, duration: 0.4 }  // G5
    ];
    this.playSequence(notes, this.volume * 0.8);
  }

  // Play race win sound
  playRaceWinSound() {
    const notes = [
      { frequency: 523.25, duration: 0.15 }, // C5
      { frequency: 659.25, duration: 0.15 }, // E5
      { frequency: 783.99, duration: 0.15 }, // G5
      { frequency: 1046.50, duration: 0.15 }, // C6
      { frequency: 1318.51, duration: 0.3 }   // E6
    ];
    this.playSequence(notes, this.volume);
  }

  // Play pet unlock sound
  playPetUnlockSound() {
    const notes = [
      { frequency: 440.00, duration: 0.1 }, // A4
      { frequency: 554.37, duration: 0.1 }, // C#5
      { frequency: 659.25, duration: 0.1 }, // E5
      { frequency: 880.00, duration: 0.2 }  // A5
    ];
    this.playSequence(notes, this.volume);
  }

  // Play fishing catch sound
  playFishingCatchSound() {
    const notes = [
      { frequency: 349.23, duration: 0.1 }, // F4
      { frequency: 523.25, duration: 0.1 }, // C5
      { frequency: 698.46, duration: 0.1 }, // F5
      { frequency: 1046.50, duration: 0.2 } // C6
    ];
    this.playSequence(notes, this.volume);
  }

  // Play button click sound
  playClickSound() {
    this.playCustomSound(1000, 0.05, this.volume * 0.5);
  }

  // Play hover sound
  playHoverSound() {
    this.playCustomSound(1200, 0.03, this.volume * 0.3);
  }

  // Preload sounds for better performance
  preloadSounds() {
    if (!this.initAudioContext()) return;
    
    // Create silent audio nodes to initialize the context
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.01);
  }

  // Resume audio context if suspended (required for some browsers)
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Get audio context state
  getAudioState() {
    return {
      isEnabled: this.isEnabled,
      volume: this.volume,
      contextState: this.audioContext ? this.audioContext.state : 'not-initialized',
      isSupported: !!(window.AudioContext || window.webkitAudioContext)
    };
  }
}

// Create and export singleton instance
const soundService = new SoundService();

// Auto-resume audio context on user interaction

export default soundService;