import React, { useRef, useState } from 'react';
import { Play, Pause, CheckCircle } from 'lucide-react';
import { COLORS } from '../constants';

interface VideoPlayerProps {
  src: string;
  onComplete: () => void;
  isCompleted: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, onComplete, isCompleted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
      // Check for completion (95% watched is good enough)
      if (current / duration > 0.95 && !isCompleted) {
        onComplete();
      }
    }
  };
  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-black group aspect-video">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => { setIsPlaying(false); onComplete(); }}
        playsInline
      />
     
      {/* Overlay Controls */}
      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
        <button
          onClick={togglePlay}
          className="bg-white/20 backdrop-blur-md p-4 rounded-full hover:scale-110 transition-transform"
        >
          {isPlaying ? <Pause className="text-white w-8 h-8" /> : <Play className="text-white w-8 h-8 ml-1" />}
        </button>
      </div>
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: COLORS.primary }}
        />
      </div>
      {isCompleted && (
        <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-lg animate-pulse">
          <CheckCircle className="w-3 h-3 mr-1" /> Watched
        </div>
      )}
    </div>
  );
};
export default VideoPlayer;