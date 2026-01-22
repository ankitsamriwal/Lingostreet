
import React, { useState } from 'react';
import { SlangItem, Intensity } from '../types';

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
    <span className={`px-2 py-0.5 rounded-full text-xs border ${styles[level]}`}>
      {level}
    </span>
  );
};

export const SlangCard: React.FC<SlangCardProps> = ({ item }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group perspective-1000 h-64 w-full cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`relative w-full h-full transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden glass-morphism p-6 rounded-2xl flex flex-col justify-between hover:border-violet-500/50 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-2">
              <IntensityBadge level={item.intensity} />
              <i className="fa-solid fa-language text-slate-500"></i>
            </div>
            <h3 className="text-2xl font-bold text-violet-300 mb-1">{item.term}</h3>
            {item.pronunciation && (
              <p className="text-sm text-slate-400 italic mb-3">/{item.pronunciation}/</p>
            )}
            <p className="text-slate-300 line-clamp-3 leading-relaxed">
              {item.meaning}
            </p>
          </div>
          <div className="text-xs text-slate-500 font-medium tracking-wider uppercase">
            Click to see usage context
          </div>
        </div>

        {/* Back Face (Rotated) */}
        <div className="absolute inset-0 backface-hidden glass-morphism p-6 rounded-2xl rotate-y-180 flex flex-col justify-between bg-violet-950/20 border-violet-500/30">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-tighter">Usage Context</p>
              <p className="text-sm text-slate-200">{item.usageContext}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-violet-400 uppercase tracking-tighter">Example</p>
              <p className="text-sm text-slate-100 italic">"{item.exampleSentence}"</p>
            </div>
            {item.origin && (
              <div>
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-tighter">Origin</p>
                <p className="text-xs text-slate-400">{item.origin}</p>
              </div>
            )}
          </div>
          <div className="text-xs text-slate-500 text-center">
            Tap to return
          </div>
        </div>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};
