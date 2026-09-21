import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Send,
  Sliders,
  Play,
  Download,
  AlertCircle,
  HelpCircle,
  FileVideo,
  Camera,
  Layers,
} from 'lucide-react';
import {
  DEFAULT_USER_PROMPT,
  ELEVATOR_FLOOR_SELECT_PROMPT,
  ELEVATOR_ENTRY_PROMPT,
  ELEVATOR_CALL_PROMPT,
  CORRIDOR_TRACKING_PROMPT,
  CORRIDOR_JUNCTION_PROMPT,
  SAMPLE_PREP_PROMPT,
  SCENE_SEQUENCES,
} from '../data/robotSceneData';
import { VeoGenerationConfig } from '../types';

interface Props {
  onSelectPrompt?: (prompt: string) => void;
}

export const VeoVideoStudio: React.FC<Props> = ({ onSelectPrompt }) => {
  const [prompt, setPrompt] = useState<string>(ELEVATOR_FLOOR_SELECT_PROMPT);
  const [model, setModel] = useState<'veo-3.1-lite-generate-preview' | 'veo-3.1-generate-preview'>(
    'veo-3.1-lite-generate-preview'
  );
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [operationName, setOperationName] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);

  const presets = [
    {
      title: 'Elevator Floor "3" & Digital Indicator (Latest Request)',
      desc: 'Interior of a hospital elevator, close-up on a stainless-steel control panel with illuminated floor-number buttons. Small robotic arm extends and precisely presses button "3" (lights up). Floor indicator above updates. Close-up shot, shallow depth of field, soft interior lighting.',
      prompt: ELEVATOR_FLOOR_SELECT_PROMPT,
    },
    {
      title: 'Elevator Interior Entry & Doors Closing',
      desc: 'Stainless-steel elevator doors slide open smoothly revealing clean interior. Robot rolls forward smoothly into elevator, stops in center as doors begin to close behind it. Static wide shot, soft interior downlight.',
      prompt: ELEVATOR_ENTRY_PROMPT,
    },
    {
      title: 'Elevator Lobby & Robotic Arm Call Button',
      desc: 'Stopped in front of closed brushed stainless-steel elevator doors in a hospital lobby. A small precise robotic arm extends from side and presses illuminated call button (lights up orange). Static eye-level camera with subtle handheld micro-movement.',
      prompt: ELEVATOR_CALL_PROMPT,
    },
    {
      title: 'Corridor Rear Tracking & Nurse Pass',
      desc: 'Driving smoothly down long corridor, polished reflective floors with gentle motion blur, nurse in scrubs walks past in background, low rear three-quarter tracking.',
      prompt: CORRIDOR_TRACKING_PROMPT,
    },
    {
      title: 'Corridor Junction & Route Map (Drone Descent)',
      desc: 'Robot standing still at a hospital corridor junction, animated route map on status screen, directional wayfinding signage, slow descending drone camera movement.',
      prompt: CORRIDOR_JUNCTION_PROMPT,
    },
    {
      title: 'Sample Prep Room & QR Verification (Push-in Dolly)',
      desc: 'Medium shot slow push-in, hospital sample prep room, gloved hand QR loading, scanning beam sweep, green checkmark OLED flash.',
      prompt: SAMPLE_PREP_PROMPT,
    },
    {
      title: 'Macro Lens QR Scanning Focus',
      desc: 'Macro 85mm f/1.4 close-up shot of the sealed test tube in the tray, showing the intense cyan scanning laser sweeping across high-density QR grid.',
      prompt: `Extreme macro close-up, 85mm anamorphic lens f/1.4 shallow depth of field. A clear medical blood sample tube sitting in a matte-white motorized hospital robot tray. The robot's front optical lens emits a focused horizontal soft blue scanning light sweeping down the printed QR code. Digital temperature readout reads exactly 4.0 C. Cinematic rim lighting, photorealistic 4K.`,
    },
    {
      title: 'Autonomous Hallway Logistics Glide',
      desc: 'Wide tracking shot down a modern clinical corridor as the 1.2m robot navigates smoothly on its mobile base with a soft pulsing blue ground light.',
      prompt: `Medium wide tracking shot, modern hospital corridor with polished antimicrobial floors and warm ceiling recessed panels. A 1.2-meter tall compact logistics robot with matte white and dark navy-blue cylindrical chassis glides autonomously on its wheeled mobile base. A soft blue LED strip along the bottom pulses rhythmically. Shallow depth of field, 4K photorealistic cinematic.`,
    },
  ];

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnhanceWithGemini = async () => {
    try {
      setIsEnhancing(true);
      const res = await fetch('/api/gemini/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrompt: prompt,
          style: 'Photorealistic 4K cinematic medical robotics',
          cameraMove: 'Slow push-in medium shot',
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setEnhancedData(result.data);
        if (result.data.veoPrompt) {
          setPrompt(result.data.veoPrompt);
        }
      }
    } catch (err) {
      console.error('Enhance prompt failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerateVideo = async () => {
    try {
      setIsGenerating(true);
      setStatusMessage('Submitting request to Veo Video Generation API...');
      setVideoUrl(null);

      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          resolution,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Video generation request failed');
      }

      setOperationName(data.operationName);
      setStatusMessage('Video rendering in progress. Polling status...');

      // Polling loop
      let done = false;
      let attempts = 0;
      const maxAttempts = 40; // 40 * 5s = 200s

      const pollInterval = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName: data.operationName }),
          });
          const pollData = await pollRes.json();

          if (pollData.done) {
            clearInterval(pollInterval);
            done = true;
            setStatusMessage('Video generated successfully! Downloading stream...');

            // Download proxy
            const downloadRes = await fetch('/api/video-download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ operationName: data.operationName }),
            });

            if (downloadRes.ok) {
              const blob = await downloadRes.blob();
              const url = URL.createObjectURL(blob);
              setVideoUrl(url);
              setStatusMessage('Completed!');
            } else {
              setStatusMessage('Download failed or requires high-tier API quota.');
            }
            setIsGenerating(false);
          } else {
            setStatusMessage(`Rendering neural video frames... (Check #${attempts})`);
          }

          if (attempts >= maxAttempts && !done) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setStatusMessage('Generation timed out. You can copy the optimized prompt below.');
          }
        } catch (pollErr: any) {
          console.error('Polling error:', pollErr);
        }
      }, 5000);
    } catch (err: any) {
      console.error('Video gen error:', err);
      setIsGenerating(false);
      setStatusMessage(
        err.message ||
          'Video generation requires an enabled Gemini Veo model key. Use the interactive 4K simulation player above or copy the prompt for Veo/Sora.'
      );
    }
  };

  return (
    <div id="veo-studio-root" className="bg-[#0B132B] rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              Veo 3.1 & AI Video Generator Studio
            </h3>
            <span className="bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 text-[11px] font-mono px-2 py-0.5 rounded-full font-semibold">
              VEO 3.1 READY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate cinematic 4K video clips or export high-precision prompts for Google Veo, OpenAI Sora, and Runway Gen-3.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-gemini-enhance"
            onClick={handleEnhanceWithGemini}
            disabled={isEnhancing}
            className="px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/60 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>{isEnhancing ? 'Directing...' : 'Enhance with Gemini'}</span>
          </button>

          <button
            id="btn-copy-prompt"
            onClick={handleCopyPrompt}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
          </button>
        </div>
      </div>

      {/* Preset Shots */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Cinematic Shot Variations
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPrompt(p.prompt);
                if (onSelectPrompt) onSelectPrompt(p.prompt);
              }}
              className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all cursor-pointer group"
            >
              <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors flex items-center justify-between">
                <span>{p.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">SHOT 0{idx + 1}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {p.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Video Generation Prompt Box */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Production Video Prompt</span>
            <span className="text-[11px] text-slate-500 lowercase font-normal">
              (photorealistic 4k cinematic hospital robot)
            </span>
          </label>
          <span className="text-[11px] text-slate-500 font-mono">{prompt.length} chars</span>
        </div>
        <textarea
          id="textarea-veo-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition-all resize-none"
          placeholder="Enter detailed cinematic video generation prompt..."
        />
      </div>

      {/* Camera & Lighting Specs (from Gemini or default) */}
      {enhancedData && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-indigo-800/50 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Director Breakdown</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">LENS</span>
              <span className="text-slate-300 font-semibold">{enhancedData.cameraSpecs?.lens || '50mm Anamorphic T1.9'}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">MOVEMENT</span>
              <span className="text-slate-300 font-semibold">{enhancedData.cameraSpecs?.movement || 'Slow push-in dolly'}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">LIGHTING</span>
              <span className="text-slate-300 font-semibold">{enhancedData.cameraSpecs?.lighting || 'Clean 5000K Overhead LED'}</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800">
              <span className="text-slate-500 block">PALETTE</span>
              <span className="text-slate-300 font-semibold">{enhancedData.cameraSpecs?.colorPalette || 'Clinical White & Navy Blue'}</span>
            </div>
          </div>

          {enhancedData.directorNotes && (
            <p className="text-xs text-slate-300 font-sans italic border-l-2 border-indigo-500 pl-3 py-0.5">
              "{enhancedData.directorNotes}"
            </p>
          )}
        </div>
      )}

      {/* Generation Settings Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-mono">MODEL:</span>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="veo-3.1-lite-generate-preview" className="bg-slate-900 text-slate-200">
                Veo 3.1 Lite (Fast)
              </option>
              <option value="veo-3.1-generate-preview" className="bg-slate-900 text-slate-200">
                Veo 3.1 Pro (Cinematic)
              </option>
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-mono">RATIO:</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value as any)}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="16:9" className="bg-slate-900 text-slate-200">
                16:9 Widescreen
              </option>
              <option value="9:16" className="bg-slate-900 text-slate-200">
                9:16 Portrait
              </option>
            </select>
          </div>

          {/* Resolution */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-mono">RES:</span>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value as any)}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="1080p" className="bg-slate-900 text-slate-200">
                1080p FHD
              </option>
              <option value="720p" className="bg-slate-900 text-slate-200">
                720p HD
              </option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          id="btn-trigger-veo-gen"
          onClick={handleGenerateVideo}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating Video with Veo...</span>
            </>
          ) : (
            <>
              <FileVideo className="w-4 h-4" />
              <span>Create Video with Veo 3.1</span>
            </>
          )}
        </button>
      </div>

      {/* Status Output */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 text-xs">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-mono flex-1">{statusMessage}</span>
          {operationName && (
            <span className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
              ID: {operationName}
            </span>
          )}
        </div>
      )}

      {/* Downloaded Video Player if completed */}
      {videoUrl && (
        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              Veo Rendered Output Ready
            </span>
            <a
              href={videoUrl}
              download="veo_hospital_robot.mp4"
              className="flex items-center gap-1 text-cyan-300 hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Download MP4
            </a>
          </div>
          <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg border border-slate-800" />
        </div>
      )}
    </div>
  );
};
