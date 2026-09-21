import React from 'react';
import { Film, Clapperboard, Clock, Volume2, Camera, Sun, Play, Compass, Navigation, Layers, Sparkles } from 'lucide-react';
import {
  SCENE_SEQUENCES,
  ROBOT_SCENE_ACTS,
  CORRIDOR_JUNCTION_ACTS,
  CORRIDOR_TRACKING_ACTS,
  ELEVATOR_CALL_ACTS,
  ELEVATOR_ENTRY_ACTS,
} from '../data/robotSceneData';
import { SceneAct, VideoSequence } from '../types';

interface Props {
  activeActId: string;
  onSelectAct: (act: SceneAct) => void;
  activeSequence: VideoSequence;
  onSelectSequence: (seq: VideoSequence) => void;
}

export const StoryboardTimeline: React.FC<Props> = ({
  activeActId,
  onSelectAct,
  activeSequence,
  onSelectSequence,
}) => {
  const acts = activeSequence.acts;
  const totalDuration = acts[acts.length - 1].endTime;

  return (
    <div id="storyboard-timeline-root" className="bg-[#0B132B] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              Director Storyboard & Keyframe Sequence
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual narrative breakdown for {activeSequence.title}: {activeSequence.tagline}
          </p>
        </div>

        {/* Sequence Switcher in Storyboard */}
        <div className="flex items-center gap-2 bg-slate-950/90 p-1 rounded-xl border border-slate-800">
          {SCENE_SEQUENCES.map((seq) => (
            <button
              key={seq.id}
              onClick={() => onSelectSequence(seq)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSequence.id === seq.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {seq.cameraMovementType === 'CLOSE_UP_PANEL' ? (
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
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>RUNTIME: {totalDuration.toFixed(1)}S (4K 24FPS)</span>
        </div>
      </div>

      {/* Storyboard Grid */}
      <div className={`grid gap-4 ${acts.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'}`}>
        {acts.map((act, index) => {
          const isActive = activeActId === act.id;
          return (
            <div
              key={act.id}
              onClick={() => onSelectAct(act)}
              className={`group flex flex-col rounded-xl overflow-hidden border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 border-cyan-500 ring-2 ring-cyan-500/30 shadow-xl shadow-cyan-950/50'
                  : 'bg-slate-950/60 hover:bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={act.imageSrc}
                  alt={act.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Act Marker Badge */}
                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-300 border border-slate-700/60">
                  ACT 0{index + 1} // {act.startTime}s - {act.endTime}s
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Current Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-cyan-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                    LIVE
                  </div>
                )}
              </div>

              {/* Storyboard Content */}
              <div className="p-3.5 flex flex-col flex-1 justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {act.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-3">
                    {act.description}
                  </p>
                </div>

                {/* Director Specs */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Camera className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{act.cameraMovement}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Sun className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{act.lightingCue}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Volume2 className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">{act.audioCue}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
