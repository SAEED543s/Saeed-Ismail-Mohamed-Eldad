import React, { useState } from 'react';
import {
  ShieldCheck,
  Thermometer,
  Eye,
  Cpu,
  BatteryCharging,
  Maximize2,
  Navigation,
  QrCode,
  Sparkles,
  Info,
} from 'lucide-react';
import { ROBOT_TECH_SPECS } from '../data/robotSceneData';

export const RobotSpecInspector: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<string>('compartment');

  const hotspots = [
    {
      id: 'camera',
      name: 'Front Camera & QR Laser Scanner',
      desc: 'High-resolution optical camera embedded above the status screen. Emits a collimated soft blue laser beam (470nm) to sweep and decode 1D/2D QR medical specimen labels in under 180ms.',
      specs: 'Focal length: 24mm equivalent • Laser power: Class 1 Eye-Safe • Angle: 110° FOV',
      icon: Eye,
    },
    {
      id: 'screen',
      name: 'OLED Status & Green Checkmark Display',
      desc: 'Sunlight-readable 3.5-inch micro-OLED status screen. Flashes a vivid green checkmark upon cryptographic validation of the specimen, communicating verification clearly to staff.',
      specs: 'Resolution: 480x320 RGB OLED • Brightness: 800 nits • Response: 0.1ms',
      icon: Cpu,
    },
    {
      id: 'compartment',
      name: 'Top Latched Sample Compartment & Digital Thermostat',
      desc: 'Hermetically sealed motorized tray on top of the robot with an exterior digital temperature readout locked at +4.0°C. Dual solenoid pneumatic latches secure samples against contamination or tampering.',
      specs: 'Target Range: +2.0°C to +8.0°C • Latch force: 250N solenoid • Capacity: 12 sealed tubes',
      icon: Thermometer,
    },
    {
      id: 'baseLed',
      name: 'Pulsing Soft Blue Ground Safety LED Strip',
      desc: 'Continuous 360-degree diffused soft blue LED ring along the wheeled mobile base. Pulses gently at 0.5Hz to project a visible safety perimeter on hospital floors without harsh glare.',
      specs: 'Wavelength: 465nm Medical Cyan-Blue • Luminance: 350 lx • Mode: Ambient Breathing Pulse',
      icon: Navigation,
    },
    {
      id: 'roboticArm',
      name: 'Lateral Precision Actuator Arm',
      desc: 'Concealed micro-servo robotic manipulator extending from the robot’s right chassis flank. Features tactile pressure feedback to actuate hospital elevator call buttons and automatic sliding door release panels with millimetric accuracy.',
      specs: 'Reach: 320mm • Degrees of Freedom: 3-DOF • Press Force: 15N calibrated tactile touch',
      icon: Sparkles,
    },
  ];

  const currentHotspot = hotspots.find((h) => h.id === activeHotspot) || hotspots[0];

  return (
    <div id="robot-specs-root" className="bg-[#0B132B] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              Hospital Logistics Robot Architectural Specifications
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compact autonomous hospital logistics service robot (1.2m height, matte white & navy-blue chassis, active cold chain).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300">
          <span>ISO 13482 CERTIFIED // MEDICAL GRADE</span>
        </div>
      </div>

      {/* Hotspots Interactive Selection */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {hotspots.map((spot) => {
            const Icon = spot.icon;
            const isSelected = activeHotspot === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => setActiveHotspot(spot.id)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-200 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {spot.id.toUpperCase()}
                  </span>
                </div>
                <div className="font-semibold text-xs leading-tight line-clamp-1">
                  {spot.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Hotspot Detail Card */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-800/40 flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 text-cyan-400 flex items-center justify-center shrink-0">
            <currentHotspot.icon className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">{currentHotspot.name}</h4>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 font-mono px-2 py-0.5 rounded border border-cyan-800/40">
                ACTIVE COMPONENT
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentHotspot.desc}
            </p>
            <div className="text-[11px] font-mono text-cyan-300/90 pt-1">
              {currentHotspot.specs}
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Tech Specs Grid */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
          Industrial & Clinical Specifications
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-mono">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">PHYSICAL PROFILE</span>
            <div className="text-slate-200 font-semibold">{ROBOT_TECH_SPECS.height}</div>
            <div className="text-[11px] text-slate-400">{ROBOT_TECH_SPECS.bodyType}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">CHASSIS & FINISH</span>
            <div className="text-slate-200 font-semibold">{ROBOT_TECH_SPECS.chassis}</div>
            <div className="text-[11px] text-slate-400">{ROBOT_TECH_SPECS.weight}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">SAMPLE COMPARTMENT</span>
            <div className="text-slate-200 font-semibold">{ROBOT_TECH_SPECS.sampleCompartment}</div>
            <div className="text-[11px] text-cyan-400">{ROBOT_TECH_SPECS.temperatureRange}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">OPTICAL & SENSORS</span>
            <div className="text-slate-200 font-semibold">Front Camera + QR Laser</div>
            <div className="text-[11px] text-slate-400">{ROBOT_TECH_SPECS.opticalSensors}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">BASE & MOBILITY</span>
            <div className="text-slate-200 font-semibold">{ROBOT_TECH_SPECS.baseType}</div>
            <div className="text-[11px] text-slate-400">{ROBOT_TECH_SPECS.baseLighting}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[11px]">POWER & RUNTIME</span>
            <div className="text-slate-200 font-semibold">{ROBOT_TECH_SPECS.batteryLife}</div>
            <div className="text-[11px] text-emerald-400">{ROBOT_TECH_SPECS.safetyRating}</div>
          </div>

          {ROBOT_TECH_SPECS.roboticArm && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1 sm:col-span-2 lg:col-span-3">
              <span className="text-slate-500 block text-[11px]">MANIPULATOR ACTUATION</span>
              <div className="text-slate-200 font-semibold">Lateral Precision Robotic Arm</div>
              <div className="text-[11px] text-cyan-300">{ROBOT_TECH_SPECS.roboticArm}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
