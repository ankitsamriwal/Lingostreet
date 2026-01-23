
import React, { useState } from 'react';
import { SlangItem, Intensity } from '../types.ts';
import { speakSlang } from '../services/geminiService.ts';

interface SlangCardProps {
  item: SlangItem;
}

const IntensityBadge: React.FC<{ level: Intensity }> = ({ level }) => {
  const styles = {
    [Intensity.MILD]: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    [Intensity.MODERATE]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    [Intensity.SPICY]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    [Intensity.EXTREME]: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold animate-pulse'
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] border uppercase tracking-wider ${styles[level] || styles[Intensity.MILD]}`}>
      {level}
    </span>
  );
};

export const SlangCard: React.FC<SlangCardProps> = ({ item }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;

    setIsSpeaking(true);
    try {
      const audioBuffer = await speakSlang(item.term, item.usageContext);
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      // The audio from Gemini TTS is raw PCM 16-bit
      const dataInt16 = new Int16Array(audioBuffer);
      const frameCount = dataInt16.length;
      const buffer = audioCtx.createBuffer(1, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.onended = () => setIsSpeaking(false);
      source.start();
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  return (
    <div 
      className="group perspective-1000 h-80 w-full cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-all duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden glass-morphism p-6 rounded-3xl flex flex-col justify-between hover:border-violet-500/50 transition-all border border-white/5 shadow-2xl">
          <div>
            <div className="flex justify-between items-start mb-4">
              <IntensityBadge level={item.intensity as Intensity} />
              <button 
                onClick={handleSpeak}
                disabled={isSpeaking}
                className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center transition-all ${isSpeaking ? 'bg-violet-600 text-white animate-pulse' : 'text-slate-400 hover:text-violet-400 hover:bg-slate-700'}`}
                title="Hear it spoken"
              >
                {isSpeaking ? (
                  <i className="fa-solid fa-waveform animate-pulse"></i>
                ) : (
                  <i className="fa-solid fa-volume-high text-xs"></i>
                )}
              </button>
            </div>
            <h3 className="text-3xl font-black text-white mb-1 group-hover:text-violet-400 transition-colors tracking-tight">{item.term}</h3>
            {item.pronunciation && (
              <p className="text-sm text-slate-500 italic mb-4 font-medium tracking-wide">/{item.pronunciation}/</p>
            )}
            <p className="text-slate-300 line-clamp-4 leading-relaxed font-medium">
              {item.meaning}
            </p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Flip for Context</span>
             <i className="fa-solid fa-arrow-right-rotate text-slate-600 text-xs"></i>
          </div>
        </div>

        {/* Back Face (Rotated) */}
        <div className="absolute inset-0 backface-hidden glass-morphism p-6 rounded-3xl rotate-y-180 flex flex-col justify-between bg-violet-950/20 border-violet-500/40 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
          <div className="space-y-4 overflow-y-auto scrollbar-hide">
            <div>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <i className="fa-solid fa-quote-left"></i> Example
              </p>
              <p className="text-sm text-slate-100 italic font-medium leading-relaxed">"{item.exampleSentence}"</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <i className="fa-solid fa-map-pin"></i> Usage
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{item.usageContext}</p>
            </div>
            <div className="p-3 bg-violet-600/10 rounded-xl border border-violet-500/20">
              <p className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <i className="fa-solid fa-lightbulb"></i> Coach Tip
              </p>
              <p className="text-xs text-slate-200 font-medium italic">"{item.coachTip}"</p>
            </div>
          </div>
          <div className="text-[10px] text-slate-500 text-center font-bold uppercase tracking-widest mt-4">
            Tap to return
          </div>
        </div>
      </div>
    </div>
  );
};
