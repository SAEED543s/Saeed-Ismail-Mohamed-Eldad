/**
 * Web Audio API synthesizer for hospital logistics robot audio cues.
 * No external audio files needed; generated mathematically in real time.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const SoundEngine = {
  // 1. Soft blue optical laser scanning sweep sound
  playLaserScan(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Soft frequency rise simulating laser sweep
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.35);

    // Bandpass to keep it soft and high-tech, not harsh
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(3, now);

    // Envelope
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  },

  // 2. Crisp positive green checkmark verification chime
  playSuccessChime(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 880.0]; // E5, A5 high-tech clinical chime

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);

      const noteStart = now + index * 0.12;
      gain.gain.setValueAtTime(0.001, noteStart);
      gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.5);
    });
  },

  // 3. Solenoid pneumatic latch lock
  playLatchLock(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  },

  // 4. Subtle hospital motor hum
  playMotorPulse(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.4);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  },

  // 5. Wayfinding Navigation Route Map Ping
  playNavPing(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now); // C6 clear digital ping
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.08); // E6

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.42);
  },

  // 6. Smooth Descending Drone Atmosphere
  playDroneDescent(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.8);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.linearRampToValueAtTime(140, now + 0.8);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.85);
  },

  // 7. Corridor Electric Wheel Glide & Low Frequency Floor Tracking Hum
  playCorridorTrackingGlide(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    // Dual tone smooth brushless electric motor cruise
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(118, now);
    osc1.frequency.linearRampToValueAtTime(128, now + 1.2);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(59, now);
    osc2.frequency.linearRampToValueAtTime(64, now + 1.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);
    filter.Q.setValueAtTime(1.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.35);
    osc2.stop(now + 1.35);
  },

  // 8. Precision Robotic Arm Stepper Motor / Servo Extension Whir
  playRoboticArmServo(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35);
    osc.frequency.linearRampToValueAtTime(620, now + 0.7);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(950, now);
    filter.Q.setValueAtTime(4.0, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  },

  // 9. Elevator Call Button Press Click & Orange Chime
  playElevatorButtonChime(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tactile micro-switch click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(1400, now);
    clickGain.gain.setValueAtTime(0.08, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // Warm resonant elevator call bell chime (Major 3rd harmonic chord)
    const freqs = [784, 987.77]; // G5, B5 bright welcoming elevator bell
    freqs.forEach((freq, idx) => {
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(freq, now + 0.03);

      bellGain.gain.setValueAtTime(0.001, now);
      bellGain.gain.setValueAtTime(0.09 - idx * 0.02, now + 0.04);
      bellGain.gain.exponentialRampToValueAtTime(0.0005, now + 1.2);

      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);
      bellOsc.start(now + 0.03);
      bellOsc.stop(now + 1.25);
    });
  },

  // 10. Elevator Stainless-Steel Doors Sliding Open/Closed
  playElevatorDoorSlide(enabled: boolean = true, isOpening: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual-tone pneumatic roller glide
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    if (isOpening) {
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.6);
      osc.frequency.exponentialRampToValueAtTime(180, now + 1.1);
    } else {
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.9);
    }

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isOpening ? 420 : 360, now);
    filter.Q.setValueAtTime(2.5, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.15);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);

    // Arrival soft harmonic double chime on open
    if (isOpening) {
      const chimeFreqs = [659.25, 523.25]; // E5 then C5 classic elevator arrival chime
      chimeFreqs.forEach((f, i) => {
        const cOsc = ctx.createOscillator();
        const cGain = ctx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(f, now + i * 0.14);
        cGain.gain.setValueAtTime(0.001, now + i * 0.14);
        cGain.gain.linearRampToValueAtTime(0.07, now + i * 0.14 + 0.02);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.9);
        cOsc.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(now + i * 0.14);
        cOsc.stop(now + i * 0.14 + 0.95);
      });
    }
  },

  // 11. Robot Rolling Across Metal Threshold into Elevator
  playElevatorEntryGlide(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Dual motor smooth ramp
    const motorOsc = ctx.createOscillator();
    const motorGain = ctx.createGain();
    motorOsc.type = 'sine';
    motorOsc.frequency.setValueAtTime(95, now);
    motorOsc.frequency.linearRampToValueAtTime(115, now + 0.4);
    motorOsc.frequency.linearRampToValueAtTime(80, now + 1.1);

    motorGain.gain.setValueAtTime(0.001, now);
    motorGain.gain.linearRampToValueAtTime(0.045, now + 0.1);
    motorGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    motorOsc.connect(motorGain);
    motorGain.connect(ctx.destination);
    motorOsc.start(now);
    motorOsc.stop(now + 1.25);

    // Subtle metallic threshold bump
    const bumpOsc = ctx.createOscillator();
    const bumpGain = ctx.createGain();
    bumpOsc.type = 'triangle';
    bumpOsc.frequency.setValueAtTime(70, now + 0.28);
    bumpGain.gain.setValueAtTime(0.001, now + 0.28);
    bumpGain.gain.linearRampToValueAtTime(0.035, now + 0.31);
    bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
    bumpOsc.connect(bumpGain);
    bumpGain.connect(ctx.destination);
    bumpOsc.start(now + 0.28);
    bumpOsc.stop(now + 0.5);
  },

  // 12. Floor 3 Button Press & Indicator Update Chime
  playFloorThreeSelect(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tactile button switch click
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(820, now);
    clickOsc.frequency.exponentialRampToValueAtTime(140, now + 0.04);
    clickGain.gain.setValueAtTime(0.001, now);
    clickGain.gain.linearRampToValueAtTime(0.06, now + 0.005);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // Illuminated Floor 3 Registration Chime (crisp elevator acknowledgment)
    const tones = [784.0, 1046.5]; // G5 to C6 affirmative ascension chime
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.03 + idx * 0.12);

      gain.gain.setValueAtTime(0.001, now + 0.03 + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.075, now + 0.05 + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.03 + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.9);
    });
  },

  // 13. Elevator Arrival & Doors Opening on New Floor
  playElevatorArrivalNewFloor(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonious Floor 3 Arrival Chime (F5 -> Bb5)
    const arrivalChimes = [698.46, 932.33];
    arrivalChimes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
      gain.gain.setValueAtTime(0.001, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.065, now + idx * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.95);
    });

    // Motorized stainless-steel door opening glide
    const doorNoise = ctx.createOscillator();
    const doorFilter = ctx.createBiquadFilter();
    const doorGain = ctx.createGain();

    doorNoise.type = 'triangle';
    doorNoise.frequency.setValueAtTime(110, now + 0.4);
    doorNoise.frequency.linearRampToValueAtTime(80, now + 1.8);

    doorFilter.type = 'lowpass';
    doorFilter.frequency.setValueAtTime(320, now + 0.4);

    doorGain.gain.setValueAtTime(0.001, now + 0.4);
    doorGain.gain.linearRampToValueAtTime(0.038, now + 0.7);
    doorGain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    doorNoise.connect(doorFilter);
    doorFilter.connect(doorGain);
    doorGain.connect(ctx.destination);
    doorNoise.start(now + 0.4);
    doorNoise.stop(now + 2.0);
  },

  // 14. Robot Rolling Across Threshold Sill to New Corridor
  playThresholdCrossNewFloor(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Brushless hub motor gentle acceleration
    const motorOsc = ctx.createOscillator();
    const motorGain = ctx.createGain();
    motorOsc.type = 'sine';
    motorOsc.frequency.setValueAtTime(95, now);
    motorOsc.frequency.linearRampToValueAtTime(175, now + 1.2);
    motorGain.gain.setValueAtTime(0.001, now);
    motorGain.gain.linearRampToValueAtTime(0.04, now + 0.1);
    motorGain.gain.exponentialRampToValueAtTime(0.015, now + 1.2);
    motorOsc.connect(motorGain);
    motorGain.connect(ctx.destination);
    motorOsc.start(now);
    motorOsc.stop(now + 1.3);

    // Double metallic threshold bump (front wheel sill, rear wheel sill)
    [0.22, 0.58].forEach((bumpTime) => {
      const bumpOsc = ctx.createOscillator();
      const bumpGain = ctx.createGain();
      bumpOsc.type = 'triangle';
      bumpOsc.frequency.setValueAtTime(65, now + bumpTime);
      bumpGain.gain.setValueAtTime(0.001, now + bumpTime);
      bumpGain.gain.linearRampToValueAtTime(0.038, now + bumpTime + 0.03);
      bumpGain.gain.exponentialRampToValueAtTime(0.001, now + bumpTime + 0.2);
      bumpOsc.connect(bumpGain);
      bumpGain.connect(ctx.destination);
      bumpOsc.start(now + bumpTime);
      bumpOsc.stop(now + bumpTime + 0.22);
    });
  },

  // 15. Smooth Tracking Cruise Down New Floor Corridor
  playNewFloorCruise(enabled: boolean = true) {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const humOsc = ctx.createOscillator();
    const humFilter = ctx.createBiquadFilter();
    const humGain = ctx.createGain();

    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(140, now);
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(260, now);

    humGain.gain.setValueAtTime(0.001, now);
    humGain.gain.linearRampToValueAtTime(0.024, now + 0.3);
    humGain.gain.setValueAtTime(0.024, now + 1.8);
    humGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(ctx.destination);
    humOsc.start(now);
    humOsc.stop(now + 2.9);
  },
};
