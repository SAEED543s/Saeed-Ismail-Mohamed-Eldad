/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Film,
  Video,
  Clapperboard,
  ShieldCheck,
  Thermometer,
  Eye,
  Radio,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { CinematicVideoPlayer } from './components/CinematicVideoPlayer';
import { VeoVideoStudio } from './components/VeoVideoStudio';
import { StoryboardTimeline } from './components/StoryboardTimeline';
import { RobotSpecInspector } from './components/RobotSpecInspector';
import { SCENE_SEQUENCES, ROBOT_SCENE_ACTS, CORRIDOR_JUNCTION_ACTS } from './data/robotSceneData';
import { CameraSettings, SceneAct, VideoSequence } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'veo-studio' | 'storyboard' | 'specs'>('veo-studio');
  const [activeSequence, setActiveSequence] = useState<VideoSequence>(SCENE_SEQUENCES[0]); // Default to Corridor Rear Tracking & Nurse
  const [activeAct, setActiveAct] = useState<SceneAct>(SCENE_SEQUENCES[0].acts[0]);

  const [cameraSettings, setCameraSettings] = useState<CameraSettings>({
    aspectRatio: '16:9',
    resolution: '4K UHD (3840x2160)',
    focalLength: '50mm Anamorphic T1.9',
    shutterSpeed: '1/48s',
    iso: 400,
    dollySpeed: 1.0,
    showTelemetryHUD: true,
    showScanEffect: true,
    audioEnabled: true,
  });

  const handleSequenceChange = (seq: VideoSequence) => {
    setActiveSequence(seq);
    setActiveAct(seq.acts[0]);
  };

  return (
    <div className="min-h-screen bg-[#050A14] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-[#070D1A]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
            <Film className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Hospital Logistics Robot
              </h1>
              <span className="bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
                4K VIDEO STUDIO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {activeSequence.cameraMovementType === 'CLOSE_UP_PANEL'
                ? 'Elevator Control Panel • Robotic Arm Extends • Presses Button "3" (Lights Up) • Floor Indicator Updates • Close-Up Shallow DOF'
                : activeSequence.cameraMovementType === 'STATIC_WIDE_SHOT'
                ? 'Elevator Interior Entry • Doors Slide Open • Robot Rolls In Centered • Doors Close Behind • Static Wide Shot Soft Downlight'
                : activeSequence.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL'
                ? 'Elevator Lobby Call • Micro-Servo Robotic Arm Extends • Illuminated Call Button (Orange Glow) • Subtle Handheld Micro-Movement'
                : activeSequence.cameraMovementType === 'LOW_REAR_TRACKING'
                ? 'Low Rear 3/4 Tracking • Hospital Corridor Cruise • Nurse in Scrubs • Polished Floor Motion Blur'
                : activeSequence.cameraMovementType === 'DESCENDING_DRONE'
                ? 'Corridor Junction Wayfinding • Animated Route Map Screen • Descending Drone Movement'
                : 'Autonomous Cold-Chain Logistics • QR Optical Scan • Cinematic Push-in Sequence'}
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>COLD CHAIN: <strong className="text-cyan-300">4.0°C ACTIVE</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>STATUS: <strong className="text-emerald-300">{activeAct.robotStatus}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 bg-cyan-950/40 px-2.5 py-1.5 rounded-lg border border-cyan-800/40 text-cyan-300">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>BASE LED: PULSING BLUE</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Section 1: Interactive 4K Cinematic Video Player */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span>Cinematic Video Master Playback</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeSequence.cameraMovementType === 'STATIC_HANDHELD_EYE_LEVEL'
                  ? 'Static eye-level camera with subtle organic handheld micro-movement. Robot stops in front of closed brushed stainless-steel elevator doors and extends its side robotic arm to press the illuminated call button.'
                  : activeSequence.cameraMovementType === 'LOW_REAR_TRACKING'
                  ? 'Cinematic low rear three-quarter dolly tracking shot along brightly lit corridor with motion-blurred floor reflections and nurse passing in background.'
                  : activeSequence.cameraMovementType === 'DESCENDING_DRONE'
                  ? 'Corridor junction architectural visualization with slow descending drone/jib camera movement, animated route map, and directional signage.'
                  : 'Slow push-in camera motion, soft blue QR laser scan sweep, screen green checkmark flash, and procedural audio.'}
              </p>
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              SWITCH SCENES ABOVE • CLICK TO PLAY/PAUSE • FRAME STEPPERS • EXPORT WEBM
            </div>
          </div>

          <CinematicVideoPlayer
            cameraSettings={cameraSettings}
            setCameraSettings={setCameraSettings}
            activeSequence={activeSequence}
            onSelectSequence={handleSequenceChange}
            onActChange={(act) => setActiveAct(act)}
          />
        </section>

        {/* Section 2: Studio Navigation Tabs */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <button
              id="tab-veo-studio"
              onClick={() => setActiveTab('veo-studio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'veo-studio'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Veo 3.1 & AI Video Generator</span>
            </button>

            <button
              id="tab-storyboard"
              onClick={() => setActiveTab('storyboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'storyboard'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Clapperboard className="w-3.5 h-3.5" />
              <span>Storyboards & Keyframes</span>
            </button>

            <button
              id="tab-specs"
              onClick={() => setActiveTab('specs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Robot Architectural Specs</span>
            </button>
          </div>

          {/* Tab Content Display */}
          {activeTab === 'veo-studio' && <VeoVideoStudio />}
          {activeTab === 'storyboard' && (
            <StoryboardTimeline
              activeActId={activeAct.id}
              onSelectAct={(act) => setActiveAct(act)}
              activeSequence={activeSequence}
              onSelectSequence={handleSequenceChange}
            />
          )}
          {activeTab === 'specs' && <RobotSpecInspector />}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070D1A] py-5 px-6 text-center text-xs text-slate-500 font-mono">
        <p>
          Hospital Logistics Robot Video Studio • 1.2m Autonomous Service Robot • 4K Photorealistic Cinematic Lighting • Powered by Google DeepMind Gemini & Veo
        </p>
      </footer>
    </div>
  );
}
