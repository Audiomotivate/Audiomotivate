import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from './button';

interface SimpleAudioPlayerProps {
  src: string;
  className?: string;
}

const SimpleAudioPlayer = ({ src, className = '' }: SimpleAudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className={`flex items-center ${className}`}>
      <audio
        ref={audioRef}
        src={src}
        onEnded={handleEnded}
        preload="none"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlay}
        className="flex items-center gap-1"
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
        {isPlaying ? 'Pausar' : 'Introducción'}
      </Button>
    </div>
  );
};

export { SimpleAudioPlayer };
export default SimpleAudioPlayer;