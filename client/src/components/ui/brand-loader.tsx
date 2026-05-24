import React from "react";
import { GalleryVerticalEnd } from "lucide-react";

interface BrandLoaderProps {
  fullscreen?: boolean;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({ fullscreen = true }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-slate-950 text-white ${
        fullscreen ? "min-h-screen w-screen fixed inset-0 z-[9999]" : "h-full w-full py-12"
      }`}
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-green-500/10 rounded-full blur-[80px] pointer-events-none animate-pulse duration-[4000ms]" />

      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Animated Brand Icon Wrapper */}
        <div className="relative flex items-center justify-center">
          {/* Glowing pulse ring */}
          <div className="absolute -inset-4 rounded-2xl bg-green-500/30 opacity-75 blur-md animate-ping duration-[2000ms] pointer-events-none" />
          
          {/* Spinning border outline */}
          <div className="absolute -inset-2 rounded-2xl border-2 border-dashed border-green-500/40 animate-[spin_20s_linear_infinite]" />

          {/* Core logo box */}
          <div className="relative h-16 w-16 bg-gradient-to-tr from-green-600 to-green-400 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.4)] transform hover:scale-105 transition-transform duration-300">
            <GalleryVerticalEnd className="h-8 w-8 animate-[pulse_2s_infinite]" />
          </div>
        </div>

        {/* Brand Text and Loader Info */}
        <div className="flex flex-col items-center text-center gap-2">
          <span className="font-sans font-bold text-3xl tracking-wide bg-gradient-to-r from-white via-slate-200 to-green-400 bg-clip-text text-transparent drop-shadow-sm">
            Finora
          </span>
          <span className="text-[11.5px] font-sans uppercase tracking-[0.25em] text-green-400/80 font-semibold animate-pulse">
            AI Financial Intelligence
          </span>
        </div>

        {/* Elegant loading progress line */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-4 relative">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full animate-[loading-bar_1.5s_infinite_ease-in-out]" />
        </div>
      </div>

      {/* Embedded inline styles for keyframe animations without needing global CSS changes */}
      <style>{`
        @keyframes loading-bar {
          0% {
            left: -40%;
            width: 40%;
          }
          50% {
            width: 60%;
          }
          100% {
            left: 100%;
            width: 40%;
          }
        }
      `}</style>
    </div>
  );
};

export default BrandLoader;
