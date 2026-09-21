export interface SceneAct {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  imageSrc: string;
  cameraMovement: string;
  lightingCue: string;
  robotStatus: 'STANDBY' | 'OPEN_RECEIVING' | 'SCANNING' | 'VERIFIED' | 'DISPATCHED' | 'WAYFINDING_ROUTING' | 'AUTONOMOUS_CRUISE' | 'ELEVATOR_CALL' | 'ELEVATOR_ENTRY' | 'ELEVATOR_FLOOR_SELECT' | 'ELEVATOR_EXIT_CRUISE';
  temperature: string;
  qrScanned: boolean;
  checkmarkVisible: boolean;
  latchState: 'OPEN' | 'CLOSING' | 'SECURED_LATCHED';
  baseLedState: 'STEADY_BLUE' | 'PULSING_SOFT_BLUE' | 'RIPPLE_ACTIVE' | 'GLOWING_MOTION';
  audioCue: string;
}

export interface VideoSequence {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  prompt: string;
  cameraMovementType: 'PUSH_IN' | 'DESCENDING_DRONE' | 'LOW_REAR_TRACKING' | 'STATIC_HANDHELD_EYE_LEVEL' | 'STATIC_WIDE_SHOT' | 'CLOSE_UP_PANEL' | 'STATIC_TRANSITION_TRACKING';
  acts: SceneAct[];
}

export interface RobotSpecs {
  height: string;
  chassis: string;
  weight: string;
  bodyType: string;
  baseType: string;
  sampleCompartment: string;
  temperatureRange: string;
  statusScreen: string;
  opticalSensors: string;
  roboticArm?: string;
  baseLighting: string;
  maxPayload: string;
  batteryLife: string;
  safetyRating: string;
}

export interface CameraSettings {
  aspectRatio: '16:9' | '2.39:1' | '9:16';
  resolution: '4K UHD (3840x2160)' | '1080p (1920x1080)' | '720p HD';
  focalLength: string;
  shutterSpeed: string;
  iso: number;
  dollySpeed: number; // 0.5 to 2.0
  showTelemetryHUD: boolean;
  showScanEffect: boolean;
  audioEnabled: boolean;
}

export interface VeoGenerationConfig {
  prompt: string;
  model: 'veo-3.1-generate-preview' | 'veo-3.1-lite-generate-preview';
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
}
