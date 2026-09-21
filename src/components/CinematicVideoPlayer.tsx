import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Download,
  Film,
  Camera,
  CheckCircle2,
  Radio,
  Sliders,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Layers,
  Thermometer,
  ShieldCheck,
  Compass,
  MapPin,
  Navigation,
} from 'lucide-react';
import {
  SCENE_SEQUENCES,
  ROBOT_SCENE_ACTS,
  CORRIDOR_JUNCTION_ACTS,
  CORRIDOR_TRACKING_ACTS,
  ELEVATOR_CALL_ACTS,
  ELEVATOR_ENTRY_ACTS,
  ELEVATOR_FLOOR_SELECT_ACTS,
  ELEVATOR_EXIT_ACTS,
} from '../data/robotSceneData';
import { SceneAct, CameraSettings, VideoSequence } from '../types';
import { SoundEngine } from '../utils/audioSynth';

interface Props {
  cameraSettings: CameraSettings;
  setCameraSettings: React.Dispatch<React.SetStateAction<CameraSettings>>;
  activeSequence: VideoSequence;
  onSelectSequence: (seq: VideoSequence) => void;
  onActChange?: (act: SceneAct) => void;
}

export const CinematicVideoPlayer: React.FC<Props> = ({
  cameraSettings,
  setCameraSettings,
  activeSequence,
  onSelectSequence,
  onActChange,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastActIdRef = useRef<string>('');

  const acts = activeSequence.acts;
  const totalDuration = acts[acts.length - 1].endTime;

  // Determine current active act based on time
  const currentAct = acts.find(
    (act) => currentTime >= act.startTime && currentTime < act.endTime
  ) || acts[acts.length - 1];

  // Preload images for all sequences
  const loadedImagesRef = useRef<{ [key: string]: HTMLImageElement }>({});
  useEffect(() => {
    const allActs = [
      ...ROBOT_SCENE_ACTS,
      ...CORRIDOR_JUNCTION_ACTS,
      ...CORRIDOR_TRACKING_ACTS,
      ...ELEVATOR_CALL_ACTS,
      ...ELEVATOR_ENTRY_ACTS,
      ...ELEVATOR_FLOOR_SELECT_ACTS,
      ...ELEVATOR_EXIT_ACTS,
    ];
    allActs.forEach((act) => {
      if (!loadedImagesRef.current[act.id]) {
        const img = new Image();
        img.src = act.imageSrc;
        img.onload = () => {
          loadedImagesRef.current[act.id] = img;
        };
      }
    });
  }, []);

  // Reset time when sequence switches
  useEffect(() => {
    setCurrentTime(0);
    lastActIdRef.current = '';
  }, [activeSequence.id]);

  // Trigger audio cues on act transition
  useEffect(() => {
    if (currentAct.id !== lastActIdRef.current) {
      lastActIdRef.current = currentAct.id;
      if (onActChange) onActChange(currentAct);

      if (cameraSettings.audioEnabled) {
        if (currentAct.id === 'act-2') {
          SoundEngine.playLaserScan(true);
        } else if (currentAct.id === 'act-3') {
          SoundEngine.playSuccessChime(true);
          setTimeout(() => SoundEngine.playLatchLock(cameraSettings.audioEnabled), 600);
        } else if (currentAct.id === 'act-4') {
          SoundEngine.playMotorPulse(true);
        } else if (currentAct.id === 'corridor-act-1') {
          SoundEngine.playDroneDescent(true);
        } else if (currentAct.id === 'corridor-act-2') {
          SoundEngine.playMotorPulse(true);
        } else if (currentAct.id === 'corridor-act-3') {
          SoundEngine.playNavPing(true);
        } else if (currentAct.id === 'track-act-1') {
          SoundEngine.playCorridorTrackingGlide(true);
        } else if (currentAct.id === 'track-act-2') {
          SoundEngine.playMotorPulse(true);
        } else if (currentAct.id === 'track-act-3') {
          SoundEngine.playCorridorTrackingGlide(true);
        } else if (currentAct.id === 'elevator-act-1') {
          SoundEngine.playMotorPulse(true);
        } else if (currentAct.id === 'elevator-act-2') {
          SoundEngine.playRoboticArmServo(true);
        } else if (currentAct.id === 'elevator-act-3') {
          SoundEngine.playElevatorButtonChime(true);
        } else if (currentAct.id === 'entry-act-1') {
          SoundEngine.playElevatorDoorSlide(true, true);
        } else if (currentAct.id === 'entry-act-2') {
          SoundEngine.playElevatorEntryGlide(true);
        } else if (currentAct.id === 'entry-act-3') {
          SoundEngine.playElevatorDoorSlide(true, false);
        } else if (currentAct.id === 'panel-act-1') {
          SoundEngine.playMotorPulse(true);
        } else if (currentAct.id === 'panel-act-2') {
          SoundEngine.playRoboticArmServo(true);
        } else if (currentAct.id === 'panel-act-3') {
          SoundEngine.playFloorThreeSelect(true);
        } else if (currentAct.id === 'exit-act-1') {
          SoundEngine.playElevatorArrivalNewFloor(true);
        } else if (currentAct.id === 'exit-act-2') {
          SoundEngine.playThresholdCrossNewFloor(true);
        } else if (currentAct.id === 'exit-act-3') {
          SoundEngine.playNewFloorCruise(true);
        }
      }
    }
  }, [currentAct, cameraSettings.audioEnabled, onActChange]);

  // Main playback loop
  useEffect(() => {
    let prev = performance.now();

    const loop = (now: number) => {
      const delta = (now - prev) / 1000;
      prev = now;

      if (isPlaying) {
        setCurrentTime((prevTime) => {
          const next = prevTime + delta * playbackSpeed;
          if (next >= totalDuration) {
            return 0; // Loop back smoothly
          }
          return next;
        });
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Render on canvas for smooth cinematic camera motion and VFX
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear frame
    ctx.fillStyle = '#050B14';
    ctx.fillRect(0, 0, width, height);

    const img = loadedImagesRef.current[currentAct.id];
    const actProgress = (currentTime - currentAct.startTime) / (currentAct.endTime - currentAct.startTime);
    const clampedProgress = Math.min(Math.max(actProgress, 0), 1);
    const overallProgress = currentTime / totalDuration;

    if (img && img.complete) {
      ctx.save();

      if (activeSequence.cameraMovementType === 'DESCENDING_DRONE') {
        // Drone crane descent: smoothly scales down and translates Y
        // Starts higher with perspective tilt, descends smoothly
        const altitudeProgress = overallProgress;
        const droneScale = 1.07 - altitudeProgress * 0.05; // 1.07 -> 1.02
        const droneTranslateY = -24 + altitudeProgress * 28; // -24px -> +4px

        ctx.translate(width / 2, height / 2);
        ctx.scale(droneScale, droneScale);

        // Subtle organic drone hovering stabilization drift
        const hoverX = Math.sin(currentTime * 0.9) * 2.2;
        const hoverY = Math.cos(currentTime * 0.7) * 1.8 + droneTranslateY;
        ctx.translate(-width / 2 + hoverX, -height / 2 + hoverY);

        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      } else if (activeSequence.cameraMovementType === 'LOW_REAR_TRACKING') {
        // Low rear three-quarter dynamic tracking camera
        // Smooth forward dolly tracking with subtle floor texture micro-vibration
        const trackScale = 1.02 + (clampedProgress * 0.06 * cameraSettings.dollySpeed);
        const lateralDrift = Math.sin(currentTime * 0.65) * 3.5;
        const floorContactJitter = Math.sin(currentTime * 16) * 0.35; // Fine floor-mount vibration

        ctx.translate(width / 2, height / 2);
        ctx.scale(trackScale, trackScale);

        // Subtle perspective cradle tilt
        const trackingTilt = Math.sin(currentTime * 0.5) * 0.004;
        ctx.rotate(trackingTilt);

        ctx.translate(-width / 2 + lateralDrift, -height / 2 + floorContactJitter);
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      } else if (activeSequence.cameraMovementType === 'CLOSE_UP_PANEL') {
        // Close-up shot, shallow depth of field, soft interior lighting
        // Macro optical stabilization with subtle breathing and tactile contact recoil
        const macroScale = 1.012 + Math.sin(currentTime * 0.4) * 0.002;
        const macroPanX = Math.sin(currentTime * 0.6) * 0.8;
        const macroPanY = Math.cos(currentTime * 0.5) * 0.6;
        // Tactile micro-recoil when pressing button "3" in Act 3
        const buttonPressJolt = (currentAct.id === 'panel-act-3' && currentTime < 7.8)
          ? Math.sin((currentTime - 7.2) * 22) * Math.exp(-(currentTime - 7.2) * 5) * 0.9
          : 0;

        ctx.translate(width / 2, height / 2);
        ctx.scale(macroScale, macroScale);
        ctx.translate(-width / 2 + macroPanX, -height / 2 + macroPanY + buttonPressJolt);
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      } else if (activeSequence.cameraMovementType === 'STATIC_TRANSITION_TRACKING') {
        // Wide static shot transitioning into a slow tracking shot following the robot
        let trackScale = 1.01;
        let panX = 0;
        let panY = 0;
        let tilt = 0;

        if (currentTime < 3.2) {
          // Act 1: Wide static shot from inside elevator cab looking out
          trackScale = 1.008 + Math.sin(currentTime * 0.5) * 0.002;
          panX = Math.sin(currentTime * 0.9) * 0.4;
          panY = Math.cos(currentTime * 0.7) * 0.3;
        } else if (currentTime < 6.8) {
          // Act 2: Transitioning: slow forward push as robot rolls across threshold sill
          const transitionProgress = (currentTime - 3.2) / 3.6;
          trackScale = 1.01 + transitionProgress * 0.035 * cameraSettings.dollySpeed;
          // Slight threshold sill micro-dip as wheels cross the metallic sill
          const sillBump = Math.sin((currentTime - 3.2) * 12) * Math.exp(-(currentTime - 3.2) * 1.5) * 0.7;
          panX = Math.sin(currentTime * 0.8) * 1.2;
          panY = transitionProgress * 2.0 + sillBump;
          tilt = Math.sin(currentTime * 0.5) * 0.002;
        } else {
          // Act 3: Slow tracking dolly shot following the robot down the new corridor
          const trackProgress = (currentTime - 6.8) / 4.2;
          trackScale = 1.04 + trackProgress * 0.045 * cameraSettings.dollySpeed;
          panX = -12 * trackProgress + Math.sin(currentTime * 0.7) * 1.8;
          panY = Math.sin(currentTime * 1.2) * 0.8;
          tilt = Math.sin(currentTime * 0.4) * 0.003;
        }

        ctx.translate(width / 2, height / 2);
        ctx.scale(trackScale, trackScale);
        ctx.rotate(tilt);
        ctx.translate(-width / 2 + panX, -height / 2 + panY);
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      } else if (activeSequence.cameraMovementType === 'STATIC_WIDE_SHOT') {
        // Static wide shot, soft interior downlight
        // Clean architectural horizon stabilization with subtle optical breathing
        const wideScale = 1.006 + Math.sin(currentTime * 0.45) * 0.002;
        const tripodJitterX = Math.sin(currentTime * 1.1) * 0.35;
        const tripodJitterY = Math.cos(currentTime * 0.85) * 0.25;

        ctx.translate(width / 2, height / 2);
        ctx.scale(wideScale, wideScale);
        ctx.translate(-width / 2 + tripodJitterX, -height / 2 + tripodJitterY);
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      } else if (activeSequence.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL') {
        // Static eye-level camera with subtle organic handheld micro-movement for realism
        const eyeScale = 1.018;
        // Subtle organic breathing drift (simulating natural operator stabilization)
        const driftX = Math.sin(currentTime * 0.72) * 1.8 + Math.cos(currentTime * 2.2) * 0.45;
        const driftY = Math.cos(currentTime * 0.6) * 1.3 + Math.sin(currentTime * 1.7) * 0.35;
        const microTilt = Math.sin(currentTime * 0.45) * 0.0018;

        ctx.translate(width / 2, height / 2);
        ctx.scale(eyeScale, eyeScale);
        ctx.rotate(microTilt);
        ctx.translate(-width / 2 + driftX, -height / 2 + driftY);
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      } else {
        // Slow push-in dolly forward
        const pushInScale = 1.0 + (clampedProgress * 0.08 * cameraSettings.dollySpeed);

        ctx.translate(width / 2, height / 2);
        ctx.scale(pushInScale, pushInScale);

        // Subtle organic handheld camera pan
        const panX = Math.sin(currentTime * 0.8) * 3;
        const panY = Math.cos(currentTime * 0.6) * 2;
        ctx.translate(-width / 2 + panX, -height / 2 + panY);

        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
      }
    }

    // 1. Soft Blue Laser Scan VFX during Act 2 of Sample Prep Room
    if (currentAct.id === 'act-2' && cameraSettings.showScanEffect) {
      const scanPhase = (clampedProgress * 2.8) % 1; // Sweeps down twice
      const laserY = height * 0.28 + scanPhase * (height * 0.42);

      ctx.save();
      // Laser beam gradient
      const laserGrad = ctx.createLinearGradient(0, laserY - 18, 0, laserY + 18);
      laserGrad.addColorStop(0, 'rgba(0, 210, 255, 0)');
      laserGrad.addColorStop(0.5, 'rgba(0, 220, 255, 0.85)');
      laserGrad.addColorStop(1, 'rgba(0, 210, 255, 0)');

      ctx.fillStyle = laserGrad;
      ctx.fillRect(width * 0.25, laserY - 14, width * 0.5, 28);

      // Sharp central laser line
      ctx.beginPath();
      ctx.strokeStyle = '#E0F7FF';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 16;
      ctx.moveTo(width * 0.25, laserY);
      ctx.lineTo(width * 0.75, laserY);
      ctx.stroke();

      // Optical flare glow at center
      const flareGrad = ctx.createRadialGradient(
        width * 0.5, laserY, 0,
        width * 0.5, laserY, 90
      );
      flareGrad.addColorStop(0, 'rgba(180, 245, 255, 0.6)');
      flareGrad.addColorStop(1, 'rgba(0, 180, 255, 0)');
      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(width * 0.5, laserY, 90, 0, Math.PI * 2);
      ctx.fill();

      // Laser readout text
      ctx.shadowBlur = 0;
      ctx.font = '600 13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#67E8F9';
      ctx.fillText(`OPTICAL QR SCAN // TARGET: SPECIMEN #TUBE-9942B`, width * 0.26, laserY - 18);

      ctx.restore();
    }

    // 2. Green Checkmark Verification Flash during Act 3 of Sample Room
    if (currentAct.id === 'act-3') {
      const flashIntensity = Math.max(0, 1 - clampedProgress * 1.5);
      if (flashIntensity > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(16, 185, 129, ${flashIntensity * 0.18})`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    // 3. Corridor Junction: Pulsing Soft Blue Base LED Floor Reflection
    if (activeSequence.cameraMovementType === 'DESCENDING_DRONE') {
      // Gentle 0.5Hz breathing pulse on the corridor floor beneath robot
      const pulseIntensity = 0.25 + 0.2 * Math.sin(currentTime * Math.PI);
      ctx.save();
      const baseGlow = ctx.createRadialGradient(
        width * 0.5, height * 0.82, 30,
        width * 0.5, height * 0.82, 280
      );
      baseGlow.addColorStop(0, `rgba(34, 211, 238, ${pulseIntensity})`);
      baseGlow.addColorStop(0.5, `rgba(6, 182, 212, ${pulseIntensity * 0.4})`);
      baseGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = baseGlow;
      ctx.beginPath();
      ctx.ellipse(width * 0.5, height * 0.83, 260, 65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Low Rear Tracking: Floor Reflection Motion Blur & Gentle Blue LED Trail
    if (activeSequence.cameraMovementType === 'LOW_REAR_TRACKING') {
      ctx.save();

      // Soft blue glowing LED pool reflecting on the polished vinyl floor
      const glowPulse = 0.32 + 0.15 * Math.sin(currentTime * 3.2);
      const floorReflectionGlow = ctx.createRadialGradient(
        width * 0.48, height * 0.85, 20,
        width * 0.48, height * 0.85, 240
      );
      floorReflectionGlow.addColorStop(0, `rgba(56, 189, 248, ${glowPulse})`);
      floorReflectionGlow.addColorStop(0.4, `rgba(14, 165, 233, ${glowPulse * 0.5})`);
      floorReflectionGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = floorReflectionGlow;
      ctx.beginPath();
      ctx.ellipse(width * 0.48, height * 0.85, 220, 50, 0, 0, Math.PI * 2);
      ctx.fill();

      // Subtle longitudinal motion blur streaks on high-gloss floor reflections
      // Streaks stream toward camera to convey forward gliding velocity
      const numStreaks = 5;
      const speedOffset = (currentTime * 120) % 80;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.16)';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.3)';
      ctx.shadowBlur = 8;

      for (let i = 0; i < numStreaks; i++) {
        const streakX = width * (0.32 + i * 0.085);
        const startY = height * 0.74 + ((speedOffset + i * 28) % 130);
        const streakLength = 34 + i * 8;

        if (startY + streakLength < height * 0.96) {
          const streakGrad = ctx.createLinearGradient(streakX, startY, streakX, startY + streakLength);
          streakGrad.addColorStop(0, 'rgba(224, 242, 254, 0)');
          streakGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.22)');
          streakGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');
          ctx.strokeStyle = streakGrad;

          ctx.beginPath();
          ctx.moveTo(streakX - (startY - height * 0.74) * 0.15, startY);
          ctx.lineTo(streakX - (startY + streakLength - height * 0.74) * 0.15, startY + streakLength);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // 5. Elevator Call Button Orange Illumination & Specular Glow on Brushed Metal
    if (activeSequence.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL') {
      ctx.save();
      // Elevator button coordinates on screen
      const btnX = width * 0.58;
      const btnY = height * 0.47;

      if (currentAct.id === 'elevator-act-3' || currentTime >= 7.2) {
        // Intense warm orange call button glow
        const orangePulse = 0.75 + 0.22 * Math.sin(currentTime * 6.5);

        // Large atmospheric radial orange bloom
        const orangeBloom = ctx.createRadialGradient(
          btnX, btnY, 4,
          btnX, btnY, 150
        );
        orangeBloom.addColorStop(0, `rgba(251, 146, 60, ${orangePulse * 0.85})`);
        orangeBloom.addColorStop(0.3, `rgba(234, 88, 12, ${orangePulse * 0.45})`);
        orangeBloom.addColorStop(0.7, `rgba(194, 65, 12, ${orangePulse * 0.12})`);
        orangeBloom.addColorStop(1, 'rgba(194, 65, 12, 0)');

        ctx.fillStyle = orangeBloom;
        ctx.beginPath();
        ctx.arc(btnX, btnY, 150, 0, Math.PI * 2);
        ctx.fill();

        // Brushed stainless steel specular anamorphic horizontal streak
        const streakWidth = 140;
        const streakGrad = ctx.createLinearGradient(btnX - streakWidth, btnY, btnX + streakWidth, btnY);
        streakGrad.addColorStop(0, 'rgba(251, 146, 60, 0)');
        streakGrad.addColorStop(0.5, `rgba(254, 215, 170, ${0.55 * orangePulse})`);
        streakGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(btnX - streakWidth, btnY);
        ctx.lineTo(btnX + streakWidth, btnY);
        ctx.stroke();

        // Sharp glowing call button inner ring
        ctx.strokeStyle = `rgba(255, 237, 213, ${0.9 + 0.1 * Math.sin(currentTime * 8)})`;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(btnX, btnY, 16, 0, Math.PI * 2);
        ctx.stroke();
      } else if (currentAct.id === 'elevator-act-2') {
        // Arm extension targeting reticle
        const reticlePulse = 0.5 + 0.3 * Math.sin(currentTime * 4);
        ctx.strokeStyle = `rgba(56, 189, 248, ${reticlePulse})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(btnX, btnY, 22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();
    }

    // 6. Elevator Interior Entry & Doors Closing VFX
    if (activeSequence.cameraMovementType === 'STATIC_WIDE_SHOT') {
      ctx.save();

      // Soft interior ceiling downlight wash cascading over cab and threshold
      const downlightX = width * 0.5;
      const downlightY = height * 0.05;
      const downlightCone = ctx.createRadialGradient(
        downlightX, downlightY, 15,
        downlightX, height * 0.72, width * 0.48
      );
      downlightCone.addColorStop(0, 'rgba(255, 252, 240, 0.20)');
      downlightCone.addColorStop(0.35, 'rgba(254, 243, 199, 0.11)');
      downlightCone.addColorStop(0.7, 'rgba(219, 234, 254, 0.04)');
      downlightCone.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = downlightCone;
      ctx.fillRect(0, 0, width, height);

      // Floor blue LED pulse reflection in front of the robot wheeled base
      const ledReflection = ctx.createRadialGradient(
        width * 0.5, height * 0.86, 10,
        width * 0.5, height * 0.86, 170
      );
      const ledPulse = 0.5 + 0.22 * Math.sin(currentTime * 3.4);
      ledReflection.addColorStop(0, `rgba(56, 189, 248, ${ledPulse * 0.42})`);
      ledReflection.addColorStop(0.5, `rgba(14, 165, 233, ${ledPulse * 0.16})`);
      ledReflection.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = ledReflection;
      ctx.fillRect(width * 0.2, height * 0.65, width * 0.6, height * 0.35);

      // Act 3: Brushed stainless-steel elevator doors sliding smoothly closed behind robot
      if (currentAct.id === 'entry-act-3' || currentTime >= 7.2) {
        const closeProgress = Math.min(1, Math.max(0, (currentTime - 7.2) / 3.6));
        const doorWidth = width * 0.35 * closeProgress;

        if (doorWidth > 2) {
          // Left sliding door panel
          const leftDoorGrad = ctx.createLinearGradient(0, 0, doorWidth, 0);
          leftDoorGrad.addColorStop(0, '#1E293B');
          leftDoorGrad.addColorStop(0.25, '#334155');
          leftDoorGrad.addColorStop(0.55, '#64748B');
          leftDoorGrad.addColorStop(0.85, '#475569');
          leftDoorGrad.addColorStop(0.98, '#1E293B');
          leftDoorGrad.addColorStop(1, '#0F172A');

          ctx.fillStyle = leftDoorGrad;
          ctx.fillRect(0, 0, doorWidth, height);

          // Brushed metal specular vertical micro-lines on left door
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          for (let lx = 14; lx < doorWidth - 6; lx += 22) {
            ctx.beginPath();
            ctx.moveTo(lx, 0);
            ctx.lineTo(lx, height);
            ctx.stroke();
          }

          // Left door leading edge rubber seal
          ctx.fillStyle = '#090D16';
          ctx.fillRect(doorWidth - 4, 0, 4, height);

          // Left door cast shadow onto threshold
          const leftShadow = ctx.createLinearGradient(doorWidth, 0, doorWidth + 28, 0);
          leftShadow.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
          leftShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = leftShadow;
          ctx.fillRect(doorWidth, 0, 28, height);

          // Right sliding door panel
          const rightDoorX = width - doorWidth;
          const rightDoorGrad = ctx.createLinearGradient(rightDoorX, 0, width, 0);
          rightDoorGrad.addColorStop(0, '#0F172A');
          rightDoorGrad.addColorStop(0.02, '#1E293B');
          rightDoorGrad.addColorStop(0.15, '#475569');
          rightDoorGrad.addColorStop(0.45, '#64748B');
          rightDoorGrad.addColorStop(0.75, '#334155');
          rightDoorGrad.addColorStop(1, '#1E293B');

          ctx.fillStyle = rightDoorGrad;
          ctx.fillRect(rightDoorX, 0, doorWidth, height);

          // Brushed metal specular vertical micro-lines on right door
          for (let rx = rightDoorX + 14; rx < width - 6; rx += 22) {
            ctx.beginPath();
            ctx.moveTo(rx, 0);
            ctx.lineTo(rx, height);
            ctx.stroke();
          }

          // Right door leading edge rubber seal
          ctx.fillStyle = '#090D16';
          ctx.fillRect(rightDoorX, 0, 4, height);

          // Right door cast shadow onto threshold
          const rightShadow = ctx.createLinearGradient(rightDoorX - 28, 0, rightDoorX, 0);
          rightShadow.addColorStop(0, 'rgba(0, 0, 0, 0)');
          rightShadow.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
          ctx.fillStyle = rightShadow;
          ctx.fillRect(rightDoorX - 28, 0, 28, height);
        }
      }

      ctx.restore();
    }

    // 7. Elevator Control Panel & Button "3" Macro VFX
    if (activeSequence.cameraMovementType === 'CLOSE_UP_PANEL') {
      ctx.save();

      // Soft diffused interior elevator lighting wash
      const panelLight = ctx.createRadialGradient(
        width * 0.55, height * 0.35, 20,
        width * 0.55, height * 0.45, width * 0.65
      );
      panelLight.addColorStop(0, 'rgba(255, 252, 242, 0.16)');
      panelLight.addColorStop(0.5, 'rgba(254, 243, 199, 0.08)');
      panelLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = panelLight;
      ctx.fillRect(0, 0, width, height);

      // Robot soft blue LED strip bounce reflection on lower-left brushed steel
      const robotBlueBounce = ctx.createRadialGradient(
        width * 0.15, height * 0.88, 15,
        width * 0.15, height * 0.88, 220
      );
      const bluePulse = 0.5 + 0.2 * Math.sin(currentTime * 3.2);
      robotBlueBounce.addColorStop(0, `rgba(56, 189, 248, ${bluePulse * 0.35})`);
      robotBlueBounce.addColorStop(0.6, `rgba(14, 165, 233, ${bluePulse * 0.12})`);
      robotBlueBounce.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = robotBlueBounce;
      ctx.fillRect(0, height * 0.5, width * 0.45, height * 0.5);

      // Shallow depth of field peripheral vignette / softness
      const dofVignette = ctx.createRadialGradient(
        width * 0.52, height * 0.52, width * 0.28,
        width * 0.52, height * 0.52, width * 0.68
      );
      dofVignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      dofVignette.addColorStop(0.7, 'rgba(10, 16, 28, 0.15)');
      dofVignette.addColorStop(1, 'rgba(5, 10, 20, 0.42)');
      ctx.fillStyle = dofVignette;
      ctx.fillRect(0, 0, width, height);

      // Act 3: Illuminated Button "3" Orange Corona & Radiant Bloom
      if (currentAct.id === 'panel-act-3' || currentTime >= 7.2) {
        // Center position of button "3" in the composition
        const btnX = width * 0.49;
        const btnY = height * 0.54;

        // Button illuminated orange radial corona
        const pulseOrange = 0.85 + 0.15 * Math.sin(currentTime * 5.0);
        const buttonGlow = ctx.createRadialGradient(
          btnX, btnY, 12,
          btnX, btnY, 110
        );
        buttonGlow.addColorStop(0, `rgba(255, 237, 213, ${pulseOrange * 0.95})`);
        buttonGlow.addColorStop(0.18, `rgba(251, 146, 60, ${pulseOrange * 0.85})`);
        buttonGlow.addColorStop(0.45, `rgba(249, 115, 22, ${pulseOrange * 0.45})`);
        buttonGlow.addColorStop(0.75, `rgba(234, 88, 12, ${pulseOrange * 0.18})`);
        buttonGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');
        ctx.fillStyle = buttonGlow;
        ctx.beginPath();
        ctx.arc(btnX, btnY, 110, 0, Math.PI * 2);
        ctx.fill();

        // High-intensity core button ring
        ctx.strokeStyle = `rgba(255, 247, 237, ${pulseOrange * 0.9})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(btnX, btnY, 26, 0, Math.PI * 2);
        ctx.stroke();

        // Specular flare line
        const flareGrad = ctx.createLinearGradient(btnX - 120, btnY, btnX + 120, btnY);
        flareGrad.addColorStop(0, 'rgba(249, 115, 22, 0)');
        flareGrad.addColorStop(0.5, `rgba(255, 255, 255, ${pulseOrange * 0.65})`);
        flareGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = flareGrad;
        ctx.fillRect(btnX - 120, btnY - 1.5, 240, 3);
      }

      ctx.restore();
    }

    // 8. Elevator Exit to New Floor Procedural VFX
    if (activeSequence.cameraMovementType === 'STATIC_TRANSITION_TRACKING') {
      ctx.save();

      // Sage-green wall accent ambient bounce reflection (Floor 3 distinct architectural identity)
      const sageWallBounce = ctx.createLinearGradient(0, 0, width * 0.25, 0);
      sageWallBounce.addColorStop(0, 'rgba(110, 150, 130, 0.12)');
      sageWallBounce.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sageWallBounce;
      ctx.fillRect(0, 0, width * 0.35, height);

      // Soft corridor morning overhead panel light wash
      const corridorGlow = ctx.createLinearGradient(0, 0, 0, height * 0.4);
      corridorGlow.addColorStop(0, 'rgba(240, 249, 255, 0.14)');
      corridorGlow.addColorStop(0.5, 'rgba(224, 242, 254, 0.06)');
      corridorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = corridorGlow;
      ctx.fillRect(0, 0, width, height * 0.4);

      // Robot soft blue base LED reflection gliding on polished linoleum floor
      const blueFloorGlider = ctx.createRadialGradient(
        width * 0.52, height * 0.86, 10,
        width * 0.52, height * 0.86, 180
      );
      const pulseBlue = 0.55 + 0.2 * Math.sin(currentTime * 3.4);
      blueFloorGlider.addColorStop(0, `rgba(56, 189, 248, ${pulseBlue * 0.38})`);
      blueFloorGlider.addColorStop(0.5, `rgba(14, 165, 233, ${pulseBlue * 0.14})`);
      blueFloorGlider.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = blueFloorGlider;
      ctx.fillRect(width * 0.2, height * 0.65, width * 0.65, height * 0.35);

      // Act 2: Metallic threshold sill glint as robot crosses
      if (currentAct.id === 'exit-act-2' || (currentTime >= 3.2 && currentTime <= 6.8)) {
        const sillGlintX = width * 0.5 + Math.sin(currentTime * 4) * 80;
        const sillGlint = ctx.createLinearGradient(sillGlintX - 60, height * 0.88, sillGlintX + 60, height * 0.88);
        sillGlint.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sillGlint.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
        sillGlint.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = sillGlint;
        ctx.fillRect(sillGlintX - 60, height * 0.875, 120, 3);
      }

      ctx.restore();
    }

    // 6. Cinematic Vignette & Color Grade
    ctx.save();
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.35,
      width / 2, height / 2, width * 0.75
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(5, 12, 24, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // 5. Cinematic Letterboxing for 2.39:1 Anamorphic
    if (cameraSettings.aspectRatio === '2.39:1') {
      const barHeight = height * 0.12;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, barHeight);
      ctx.fillRect(0, height - barHeight, width, barHeight);
    }
  }, [currentTime, currentAct, cameraSettings, activeSequence, totalDuration]);

  // Handle Export / Recording
  const handleExportVideo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsExporting(true);
      setExportProgress(0);
      setIsPlaying(false);
      setCurrentTime(0);

      // 30 FPS stream
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 6000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = activeSequence.cameraMovementType === 'STATIC_TRANSITION_TRACKING'
          ? 'hospital_robot_elevator_exit_new_floor_tracking_4K.webm'
          : activeSequence.cameraMovementType === 'CLOSE_UP_PANEL'
          ? 'hospital_robot_elevator_button_3_indicator_update_4K.webm'
          : activeSequence.cameraMovementType === 'STATIC_WIDE_SHOT'
          ? 'hospital_robot_elevator_interior_entry_doors_closing_4K.webm'
          : activeSequence.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL'
          ? 'hospital_robot_elevator_call_button_4K.webm'
          : activeSequence.cameraMovementType === 'LOW_REAR_TRACKING'
          ? 'hospital_robot_corridor_rear_tracking_nurse_4K.webm'
          : activeSequence.cameraMovementType === 'DESCENDING_DRONE'
          ? 'hospital_robot_corridor_junction_drone_4K.webm'
          : 'hospital_logistics_robot_sequence_4K.webm';
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        setIsPlaying(true);
      };

      mediaRecorder.start();

      let exportTime = 0;
      const step = 1 / 30; // 30 fps
      const interval = setInterval(() => {
        exportTime += step;
        setCurrentTime(exportTime);
        setExportProgress(Math.min(100, Math.round((exportTime / totalDuration) * 100)));

        if (exportTime >= totalDuration) {
          clearInterval(interval);
          mediaRecorder.stop();
        }
      }, 33);
    } catch (err) {
      console.error('Export failed:', err);
      setIsExporting(false);
    }
  }, [totalDuration, activeSequence]);

  // Timecode Formatter (SMPTE: HH:MM:SS:FF)
  const formatTimecode = (sec: number) => {
    const totalFrames = Math.floor(sec * 24);
    const frames = totalFrames % 24;
    const totalSeconds = Math.floor(sec);
    const s = totalSeconds % 60;
    const m = Math.floor(totalSeconds / 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
  };

  const handleStepFrame = (frames: number) => {
    setIsPlaying(false);
    setCurrentTime((t) => Math.min(Math.max(t + frames * (1 / 24), 0), totalDuration));
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Drone altitude calculation
  const droneAltitude = (3.40 - (currentTime / totalDuration) * 2.15).toFixed(2);
  const droneGimbalPitch = (-26 + (currentTime / totalDuration) * 22).toFixed(1);

  return (
    <div
      id="video-player-root"
      ref={containerRef}
      className="relative flex flex-col bg-[#070D18] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300"
    >
      {/* Top Sequence Selector & Camera Slate */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 text-xs font-mono select-none">
        {/* Sequence Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
          {SCENE_SEQUENCES.map((seq) => {
            const isSeqActive = activeSequence.id === seq.id;
            return (
              <button
                key={seq.id}
                onClick={() => onSelectSequence(seq)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSeqActive
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {seq.cameraMovementType === 'STATIC_TRANSITION_TRACKING' ? (
                  <Navigation className="w-3.5 h-3.5" />
                ) : seq.cameraMovementType === 'CLOSE_UP_PANEL' ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : seq.cameraMovementType === 'STATIC_WIDE_SHOT' ? (
                  <Film className="w-3.5 h-3.5" />
                ) : seq.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL' ? (
                  <Layers className="w-3.5 h-3.5" />
                ) : seq.cameraMovementType === 'DESCENDING_DRONE' ? (
                  <Compass className="w-3.5 h-3.5" />
                ) : seq.cameraMovementType === 'LOW_REAR_TRACKING' ? (
                  <Navigation className="w-3.5 h-3.5" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
                <span>{seq.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Live Camera Indicators */}
        <div className="flex items-center gap-3">
          {activeSequence.cameraMovementType === 'STATIC_TRANSITION_TRACKING' ? (
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-bold">FLOOR 3 CORRIDOR:</span>
              <strong className={currentAct.id === 'exit-act-3' ? 'text-cyan-300 font-bold' : currentAct.id === 'exit-act-2' ? 'text-amber-400 font-bold' : 'text-emerald-300'}>
                {currentAct.id === 'exit-act-3' ? 'SLOW DOLLY TRACKING' : currentAct.id === 'exit-act-2' ? 'CROSSING SILL' : 'DOORS OPEN [NEW FLOOR]'}
              </strong>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-semibold">{currentAct.temperature}</span>
            </div>
          ) : activeSequence.cameraMovementType === 'CLOSE_UP_PANEL' ? (
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              <span className="text-amber-400 font-bold">PANEL MACRO:</span>
              <strong className={currentAct.id === 'panel-act-3' ? 'text-orange-400 font-bold' : 'text-cyan-300'}>
                {currentAct.id === 'panel-act-3' ? 'BUTTON "3" LIT // FLOOR 3 REGISTERED' : currentAct.id === 'panel-act-2' ? 'ARM EXTENDING TO "3"' : 'ALIGNED AT PANEL'}
              </strong>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-semibold">{currentAct.temperature}</span>
            </div>
          ) : activeSequence.cameraMovementType === 'STATIC_WIDE_SHOT' ? (
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              <span className="text-cyan-400 font-bold">CAB INTERIOR:</span>
              <strong className={currentAct.id === 'entry-act-3' ? 'text-amber-400 font-bold' : 'text-cyan-300'}>
                {currentAct.id === 'entry-act-3' ? 'DOORS CLOSING BEHIND' : currentAct.id === 'entry-act-2' ? 'ROLLING IN' : 'DOORS SLID OPEN'}
              </strong>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-semibold">{currentAct.temperature}</span>
            </div>
          ) : activeSequence.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL' ? (
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              <span className="text-amber-400 font-bold">LOBBY CALL:</span>
              <strong className={currentAct.id === 'elevator-act-3' ? 'text-orange-400 font-bold' : 'text-cyan-300'}>
                {currentAct.id === 'elevator-act-3' ? 'ORANGE BUTTON ACTIVE' : currentAct.id === 'elevator-act-2' ? 'ARM EXTENDING' : 'STOPPED AT DOORS'}
              </strong>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-semibold">{currentAct.temperature}</span>
            </div>
          ) : activeSequence.cameraMovementType === 'LOW_REAR_TRACKING' ? (
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              <span className="text-cyan-400 font-bold">CRUISE:</span>
              <strong className="text-cyan-300">1.2 M/S REAR 3/4</strong>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-semibold">{currentAct.temperature}</span>
            </div>
          ) : activeSequence.cameraMovementType === 'DESCENDING_DRONE' ? (
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-300">
              <span className="text-cyan-400 font-bold">DRONE ALT:</span>
              <strong className="text-cyan-300">{droneAltitude}M</strong>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">PITCH: {droneGimbalPitch}°</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800 text-slate-200">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              <span>TEMP: <strong className="text-cyan-300 font-semibold">{currentAct.temperature}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
            <span className="text-slate-400">LATCH:</span>
            <span
              className={`font-semibold ${
                currentAct.latchState === 'SECURED_LATCHED'
                  ? 'text-emerald-400'
                  : currentAct.latchState === 'CLOSING'
                  ? 'text-amber-400'
                  : 'text-sky-400'
              }`}
            >
              {currentAct.latchState}
            </span>
          </div>

          <div className="text-cyan-400 font-semibold tracking-widest text-sm bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-800/50">
            {formatTimecode(currentTime)}
          </div>
        </div>
      </div>

      {/* Main Viewport / Canvas Screen */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain cursor-pointer select-none"
          onClick={() => setIsPlaying(!isPlaying)}
        />

        {/* HUD Telemetry Overlay */}
        {cameraSettings.showTelemetryHUD && (
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between text-xs font-mono select-none">
            {/* Top Corner Crosshairs & Lens Specs */}
            <div className="flex justify-between items-start">
              <div className="bg-black/65 backdrop-blur-md p-3 rounded-lg border border-slate-700/60 text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Camera className="w-3.5 h-3.5" />
                  <span>
                    {activeSequence.cameraMovementType === 'CLOSE_UP_PANEL'
                      ? '85MM T1.4 MACRO PRIME (SHALLOW DOF // CLOSE-UP)'
                      : activeSequence.cameraMovementType === 'STATIC_WIDE_SHOT'
                      ? '24MM T2.0 ARCHITECTURAL STATIC WIDE (SOFT DOWNLIGHT)'
                      : activeSequence.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL'
                      ? '50MM T1.8 STATIC EYE-LEVEL (SUBTLE HANDHELD)'
                      : activeSequence.cameraMovementType === 'LOW_REAR_TRACKING'
                      ? '35MM LOW-ANGLE REAR DOLLY TRACKING T1.8'
                      : activeSequence.cameraMovementType === 'DESCENDING_DRONE'
                      ? 'ARCHITECTURAL JIB/DRONE 35MM T2.0'
                      : '50MM ANAMORPHIC T1.9'}
                  </span>
                </div>
                <div>SHUTTER: 1/48s | ISO: {cameraSettings.iso} | 4K 24FPS</div>
                <div className="text-slate-400">MOTION: {currentAct.cameraMovement}</div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700/60">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-400 font-bold tracking-wider">REC</span>
                  <span className="text-slate-400">4K PRORES</span>
                </div>

                {/* Elevator Interior Floor "3" Button & Indicator HUD */}
                {activeSequence.cameraMovementType === 'CLOSE_UP_PANEL' && (
                  <div className="flex flex-col items-end gap-1.5 text-[11px] font-mono animate-in fade-in duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-orange-800/70 text-orange-300 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${currentAct.id === 'panel-act-3' ? 'bg-orange-500 animate-ping' : 'bg-slate-400'}`} />
                      <span>{currentAct.id === 'panel-act-3' ? 'BUTTON "3": LIT [ORANGE AMBER]' : currentAct.id === 'panel-act-2' ? 'TARGET: BUTTON "3" [ALIGNING]' : 'STAINLESS CONTROL PANEL'}</span>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-800/70 text-cyan-200 flex items-center gap-1.5">
                      <span className="text-cyan-400 font-bold">FLOOR DISPLAY:</span>
                      <span className={currentAct.id === 'panel-act-3' ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                        {currentAct.id === 'panel-act-3' ? 'FLOOR "3 [▲]" [REGISTERED]' : 'FLOOR "1 [STANDBY]"'}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-slate-400">
                      <span>ROBOTIC ARM: {currentAct.id === 'panel-act-3' ? 'PRECISE CONTACT [DEPRESSED]' : currentAct.id === 'panel-act-2' ? 'EXTENDING STYLUS' : 'ALIGNED AT LATERAL ELEVATION'}</span>
                    </div>
                  </div>
                )}

                {/* Elevator Interior Entry & Doors Closing HUD */}
                {activeSequence.cameraMovementType === 'STATIC_WIDE_SHOT' && (
                  <div className="flex flex-col items-end gap-1.5 text-[11px] font-mono animate-in fade-in duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-800/70 text-cyan-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>ELEVATOR CAB INTERIOR // STATIC WIDE</span>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 text-slate-200 flex items-center gap-1.5">
                      <span className="text-amber-400 font-bold">LIGHTING:</span>
                      <span>SOFT INTERIOR DOWNLIGHT [4200K DIFFUSE]</span>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-slate-400">
                      <span>STATUS: {currentAct.id === 'entry-act-3' ? 'DOORS CLOSING BEHIND ROBOT' : currentAct.id === 'entry-act-2' ? 'CROSSING THRESHOLD SILL' : 'DOORS OPEN [CAB CLEAR]'}</span>
                    </div>
                  </div>
                )}

                {/* Elevator Lobby Call Button HUD badges */}
                {activeSequence.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL' && (
                  <div className="flex flex-col items-end gap-1.5 text-[11px] font-mono animate-in fade-in duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-orange-800/70 text-orange-300 flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${currentAct.id === 'elevator-act-3' ? 'bg-orange-500 animate-ping' : 'bg-slate-400'}`} />
                      <span>{currentAct.id === 'elevator-act-3' ? 'CALL BUTTON: ORANGE [REGISTERED]' : 'CALL PANEL TARGET: LOCKED'}</span>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 text-slate-200 flex items-center gap-1.5">
                      <span className="text-cyan-400 font-bold">ACTUATOR ARM:</span>
                      <span>{currentAct.id === 'elevator-act-3' ? 'TACTILE CONTACT [POSITIVE]' : currentAct.id === 'elevator-act-2' ? 'DEPLOYING [STEPPER 420Hz]' : 'CONCEALED STOWED'}</span>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-slate-400">
                      <span>DOORS: BRUSHED STAINLESS STEEL</span>
                    </div>
                  </div>
                )}

                {/* Act 3 Green Checkmark HUD (Sample Prep Room) */}
                {currentAct.checkmarkVisible && activeSequence.id === 'sequence-sample-prep-room' && (
                  <div className="flex items-center gap-2 bg-emerald-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-emerald-500/80 text-emerald-300 shadow-lg shadow-emerald-950/50 animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="font-bold">QR SPECIMEN VERIFIED // SAFE STORAGE</span>
                  </div>
                )}

                {/* Corridor Wayfinding Directional Signage HUD */}
                {activeSequence.cameraMovementType === 'DESCENDING_DRONE' && (
                  <div className="flex flex-col items-end gap-1 text-[11px] font-mono">
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-800/70 text-cyan-300 flex items-center gap-1.5">
                      <Navigation className="w-3 h-3 text-cyan-400" />
                      <span>WAYFINDING: PATHOLOGY & CENTRAL LAB [← 240M]</span>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-slate-300">
                      <span>SURGICAL WING & ICU [150M →]</span>
                    </div>
                  </div>
                )}

                {/* Corridor Low Rear Tracking HUD badges */}
                {activeSequence.cameraMovementType === 'LOW_REAR_TRACKING' && (
                  <div className="flex flex-col items-end gap-1.5 text-[11px] font-mono animate-in fade-in duration-300">
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-800/70 text-cyan-300 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>AUTONOMOUS CRUISE // 1.2 M/S SPEED</span>
                    </div>
                    <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded border border-slate-700 text-slate-200 flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">STAFF CLEARANCE:</span>
                      <span>NURSE IN BACKGROUND [CROSSING]</span>
                    </div>
                    <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-slate-400">
                      <span>FLOOR REFLECTION: MOTION BLUR ACTIVE</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Reticle Crosshair or Waypoint Grid in Center */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="relative w-28 h-28 border border-cyan-400/40 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                <div className="absolute top-0 w-3 h-0.5 bg-cyan-400" />
                <div className="absolute bottom-0 w-3 h-0.5 bg-cyan-400" />
                <div className="absolute left-0 h-3 w-0.5 bg-cyan-400" />
                <div className="absolute right-0 h-3 w-0.5 bg-cyan-400" />
              </div>
            </div>

            {/* Route Map Holographic Telemetry (Corridor Act 3) */}
            {currentAct.id === 'corridor-act-3' && (
              <div className="absolute top-1/2 right-8 -translate-y-1/2 bg-slate-950/90 backdrop-blur-md p-4 rounded-xl border border-cyan-500/60 shadow-2xl text-slate-200 w-72 space-y-2 pointer-events-none animate-in fade-in slide-in-from-right-3 duration-300">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                    <Compass className="w-4 h-4 animate-spin" />
                    <span>STATUS SCREEN ROUTE MAP</span>
                  </div>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800 font-mono">
                    LIVE NAV
                  </span>
                </div>

                <div className="relative h-20 bg-slate-900/80 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                  {/* Subtle Vector Route Map Graphic */}
                  <div className="absolute inset-0 flex items-center justify-around px-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[9px] text-cyan-300 mt-1 font-mono">JUNCTION</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 mx-2 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-md shadow-cyan-400" />
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <span className="text-[9px] text-emerald-300 mt-1 font-mono">LAB 204</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] font-mono space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>DESTINATION:</span>
                    <strong className="text-slate-200">CENTRAL PATHOLOGY</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ESTIMATED TIME:</span>
                    <strong className="text-emerald-400">01 MIN 45 SEC</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>COLD CHAIN:</span>
                    <strong className="text-cyan-300">4.0°C LOCKED</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Subtitle / Director Cue */}
            <div className="flex justify-between items-end">
              <div className="max-w-xl bg-black/80 backdrop-blur-md p-3.5 rounded-xl border border-slate-700/70 text-slate-200">
                <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span>{currentAct.title}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-normal">{currentAct.subtitle}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans font-normal">
                  {currentAct.description}
                </p>
              </div>

              <div className="bg-black/65 backdrop-blur-sm p-3 rounded-lg border border-slate-700/60 text-right text-slate-400 space-y-0.5">
                <div>HEIGHT: 1.20M</div>
                <div>BASE LED: {currentAct.baseLedState}</div>
                <div>CHASSIS: MATTE WHITE / NAVY</div>
              </div>
            </div>
          </div>
        )}

        {/* Center Play Overlay on Hover when Paused */}
        {!isPlaying && (
          <button
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition-all cursor-pointer"
            aria-label="Play video"
          >
            <div className="w-16 h-16 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-xl shadow-cyan-500/30 transform hover:scale-110 transition-all">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          </button>
        )}

        {/* Exporting Overlay */}
        {isExporting && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-white z-20">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center space-y-1">
              <h4 className="text-base font-semibold text-cyan-300">Rendering 4K Cinematic Sequence...</h4>
              <p className="text-xs text-slate-400 font-mono">Encoding frame stream to WebM ({exportProgress}%)</p>
            </div>
            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-cyan-400 transition-all duration-150"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Video Scrubber & Act Markers */}
      <div className="px-5 pt-3 pb-2 bg-slate-900 border-t border-slate-800">
        <div className="relative w-full flex items-center mb-2">
          {/* Act Segment Highlight Bars */}
          <div className="absolute inset-0 h-1.5 flex gap-1 pointer-events-none rounded overflow-hidden">
            {acts.map((act) => {
              const actWidthPercent = ((act.endTime - act.startTime) / totalDuration) * 100;
              const isPastOrActive = currentTime >= act.startTime;
              return (
                <div
                  key={act.id}
                  style={{ width: `${actWidthPercent}%` }}
                  className={`h-full transition-colors ${
                    isPastOrActive ? 'bg-cyan-500/50' : 'bg-slate-700/50'
                  }`}
                  title={`${act.title} (${act.startTime}s - ${act.endTime}s)`}
                />
              );
            })}
          </div>

          <input
            id="video-scrubber-slider"
            type="range"
            min={0}
            max={totalDuration}
            step={0.02}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 appearance-none bg-transparent cursor-pointer relative z-10 accent-cyan-400"
          />
        </div>

        {/* Act Buttons / Chapter Navigation */}
        <div className={`grid gap-2 pt-1 pb-1 text-xs ${acts.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
          {acts.map((act, index) => {
            const isActive = currentAct.id === act.id;
            return (
              <button
                key={act.id}
                onClick={() => {
                  setCurrentTime(act.startTime);
                  setIsPlaying(true);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-950/70 border border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold ${
                    isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  0{index + 1}
                </div>
                <div className="truncate">
                  <div className="font-semibold truncate">{act.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{act.startTime}s - {act.endTime}s</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Playback Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-950 border-t border-slate-800/80 text-slate-300">
        {/* Left: Transport Controls */}
        <div className="flex items-center gap-2">
          <button
            id="btn-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-9 h-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition-transform active:scale-95 cursor-pointer shadow-md shadow-cyan-500/20"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            id="btn-restart"
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(true);
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Restart to Beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => handleStepFrame(-1)}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
              title="Previous Frame (-1/24s)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 font-mono text-[11px] text-slate-400">FRAME</span>
            <button
              onClick={() => handleStepFrame(1)}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
              title="Next Frame (+1/24s)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            id="btn-audio-toggle"
            onClick={() => {
              setCameraSettings((prev) => ({ ...prev, audioEnabled: !prev.audioEnabled }));
            }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              cameraSettings.audioEnabled
                ? 'bg-slate-800 hover:bg-slate-700 text-cyan-400'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-500'
            }`}
            title={cameraSettings.audioEnabled ? 'Mute Procedural Audio' : 'Enable Procedural Audio'}
          >
            {cameraSettings.audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: Playback Speed & Aspect Ratio */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            {[0.5, 1.0, 1.5, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            {(['16:9', '2.39:1'] as const).map((ratio) => (
              <button
                key={ratio}
                onClick={() => setCameraSettings((prev) => ({ ...prev, aspectRatio: ratio }))}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  cameraSettings.aspectRatio === ratio
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Telemetry Toggle, Export & Fullscreen */}
        <div className="flex items-center gap-2 text-xs">
          <button
            id="btn-hud-toggle"
            onClick={() =>
              setCameraSettings((prev) => ({ ...prev, showTelemetryHUD: !prev.showTelemetryHUD }))
            }
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border ${
              cameraSettings.showTelemetryHUD
                ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>HUD {cameraSettings.showTelemetryHUD ? 'ON' : 'OFF'}</span>
          </button>

          <button
            id="btn-export-video"
            onClick={handleExportVideo}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold flex items-center gap-1.5 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            title="Render and Download WebM Video File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Video</span>
          </button>

          <button
            id="btn-fullscreen-toggle"
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
