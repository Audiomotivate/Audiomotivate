import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Play, Pause, VolumeX, Volume2, SkipBack, SkipForward, Maximize, Minimize } from 'lucide-react';
import { Slider } from './slider';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export function VideoPlayer({ src, className }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      video.currentTime = 0;
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const rewind = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const forward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(duration, video.currentTime + 10);
  };

  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = value[0];
    video.currentTime = newTime;
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

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className={cn("flex flex-col w-full relative rounded-md overflow-hidden", className)}>
      <video 
        ref={videoRef} 
        src={src} 
        preload="metadata" 
        className="w-full rounded-md"
        onClick={togglePlayPause}
      />
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-2 flex flex-col">
        <Slider 
          className="w-full mb-2" 
          defaultValue={[0]} 
          value={[progress]} 
          max={duration || 100}
          step={0.1}
          onValueChange={handleProgressChange}
        />
        
        <div className="flex items-center space-x-2">
          <button
            onClick={rewind}
            className="text-white/90 hover:text-white transition"
            title="Retroceder 10 segundos"
          >
            <SkipBack size={16} />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          
          <button
            onClick={forward}
            className="text-white/90 hover:text-white transition"
            title="Avanzar 10 segundos"
          >
            <SkipForward size={16} />
          </button>
          
          <span className="text-xs text-white/90 min-w-[4rem]">
            {formatTime(progress)} / {formatTime(duration)}
          </span>
          
          <div className="flex items-center ml-auto">
            <button
              onClick={toggleMute}
              className="text-white/90 hover:text-white transition mr-1"
              title={isMuted ? "Activar sonido" : "Silenciar"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            
            <Slider 
              className="w-16 mr-3" 
              defaultValue={[1]} 
              value={[isMuted ? 0 : volume]} 
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
            />
            
            <button
              onClick={toggleFullscreen}
              className="text-white/90 hover:text-white transition"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}