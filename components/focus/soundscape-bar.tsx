'use client';

import React, { useState, useEffect } from 'react';
import {
  soundscapeEngine,
  SOUNDSCAPE_LIST,
  SoundscapeType,
} from '@/lib/audio/soundscapes';
import { Headphones, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface SoundscapeBarProps {
  className?: string;
}

export function SoundscapeBar({ className = '' }: SoundscapeBarProps) {
  const [activeSound, setActiveSound] = useState<SoundscapeType>('none');
  const [volume, setVolume] = useState<number>(40);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (soundscapeEngine) {
        soundscapeEngine.stop();
      }
    };
  }, []);

  const handleToggleSound = (type: SoundscapeType) => {
    if (!soundscapeEngine) return;

    if (activeSound === type) {
      soundscapeEngine.stop();
      setActiveSound('none');
    } else {
      soundscapeEngine.play(type);
      setActiveSound(type);
      setIsMuted(false);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    if (soundscapeEngine) {
      soundscapeEngine.setVolume(newVal / 100);
      if (newVal > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  const handleToggleMute = () => {
    if (!soundscapeEngine) return;
    if (isMuted) {
      soundscapeEngine.setVolume(volume / 100);
      setIsMuted(false);
    } else {
      soundscapeEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div
      className={`p-3.5 rounded-xl border border-paper-300 dark:border-paper-700 bg-white/70 dark:bg-paper-800/70 backdrop-blur-xs transition-all shadow-2xs ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-forest/10 dark:bg-emerald-950/80 text-forest dark:text-emerald-400">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
              <span>Focus Sanctuary Soundscapes</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-normal bg-forest/10 text-forest dark:text-emerald-300 border border-forest/20">
                100% Offline
              </span>
            </h4>
            <p className="text-[11px] text-ink-500 dark:text-ink-400">
              Synthesized ambient acoustics & 40Hz binaural beats for deep analytical concentration.
            </p>
          </div>
        </div>

        {/* Volume Controls */}
        {activeSound !== 'none' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMute}
              className="text-ink-400 hover:text-ink-800 dark:hover:text-ink-100 p-1"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              aria-label="Soundscape Volume"
              className="w-16 h-1 bg-paper-300 dark:bg-paper-700 rounded-lg appearance-none cursor-pointer accent-forest"
            />
            <span className="text-[10px] font-mono text-ink-400 w-6 text-right">
              {isMuted ? '0%' : `${volume}%`}
            </span>
          </div>
        )}
      </div>

      {/* Sound Pills */}
      <div className="flex flex-wrap gap-1.5">
        {SOUNDSCAPE_LIST.map((s) => {
          const isActive = activeSound === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleToggleSound(s.id)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-forest text-white border-forest shadow-2xs font-semibold'
                  : 'bg-white dark:bg-paper-900 border-paper-200 dark:border-paper-700 text-ink-700 dark:text-ink-300 hover:border-forest/50 hover:bg-forest/5'
              }`}
              title={`${s.description} • Best for: ${s.recommendedFor}`}
            >
              {s.category === 'binaural' && (
                <Sparkles className={`w-3 h-3 ${isActive ? 'text-amber-300' : 'text-amber-500'}`} />
              )}
              <span>{s.name}</span>
            </button>
          );
        })}

        {activeSound !== 'none' && (
          <button
            type="button"
            onClick={() => handleToggleSound(activeSound)}
            className="text-[11px] px-2 py-1 rounded text-red-500 hover:text-red-700 dark:text-red-400 font-mono transition-colors"
          >
            Turn Off
          </button>
        )}
      </div>
    </div>
  );
}
