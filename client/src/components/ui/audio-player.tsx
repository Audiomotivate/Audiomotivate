import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Play, Pause, VolumeX, Volume2 } from 'lucide-react';
import { Slider } from './slider';

interface AudioPlayerProps {
  src: string;
  className?: string;
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = value[0];
    audio.currentTime = newTime;
    setProgress(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex flex-col w-full", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center space-x-2 mb-1">
        <button
          onClick={togglePlayPause}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-primary hover:bg-primary/90 text-white transition"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
        
        <span className="text-xs text-muted-foreground w-12">
          {formatTime(progress)}
        </span>
        
        <Slider 
          className="flex-1" 
          defaultValue={[0]} 
          value={[progress]} 
          max={duration || 100}
          step={0.1}
          onValueChange={handleProgressChange}
        />
        
        <span className="text-xs text-muted-foreground w-12 text-right">
          {formatTime(duration)}
        </span>
        
        <button
          onClick={toggleMute}
          className="text-muted-foreground hover:text-foreground transition"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        
        <Slider 
          className="w-16" 
          defaultValue={[1]} 
          value={[isMuted ? 0 : volume]} 
          max={1}
          step={0.1}
          onValueChange={handleVolumeChange}
        />
      </div>
    </div>
  );
}
