import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  title?: string;
  onClose?: () => void;
}

export default function VideoPlayer({ src, title = '動画', onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  // コントロールバーの自動非表示
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
      return;
    }
    const handleMouseMove = () => {
      setShowControls(true);
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
      hideControlsTimeout.current = setTimeout(() => setShowControls(false), 2500);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleMouseMove);
      if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    };
  }, [isFullscreen]);

  // フルスクリーンAPI連動
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        handleFullscreen();
      } else if (e.key === ' ') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.key.toLowerCase() === 'f') {
        handleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black rounded-xl shadow-xl max-w-2xl mx-auto overflow-hidden"
      onMouseMove={() => isFullscreen && setShowControls(true)}
      onClick={() => isFullscreen && setShowControls(true)}
    >
      {/* 閉じるボタン */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition"
          title="閉じる"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      {/* タイトル */}
      <div className="text-white font-bold text-lg px-6 pt-4 pb-2 select-none">
        {title}
      </div>
      {/* 動画 */}
      <div className="relative w-full aspect-video bg-black">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain bg-black"
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={handlePlayPause}
          tabIndex={0}
          style={{ borderRadius: 12 }}
        />
        {/* コントロールバー */}
        {showControls && (
          <div className="absolute bottom-0 left-0 w-full z-20 bg-black/70 backdrop-blur-md p-4 flex flex-col gap-2 transition-opacity duration-300">
            {/* シークバー */}
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-purple-500 h-2 rounded-lg bg-gray-700/50"
            />
            <div className="flex items-center justify-between gap-4">
              {/* 再生/一時停止 */}
              <button
                onClick={handlePlayPause}
                className="p-2 text-white hover:text-purple-300 transition-colors bg-gray-700/50 rounded-full hover:bg-gray-600/50"
                title={isPlaying ? '一時停止' : '再生'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              {/* 時間表示 */}
              <span className="text-xs text-gray-200 font-mono min-w-[70px] text-center">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              {/* 音量 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:text-purple-300 transition-colors bg-gray-700/50 rounded-full hover:bg-gray-600/50"
                  title={isMuted ? 'ミュート解除' : 'ミュート'}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-purple-500 h-2 rounded-lg bg-gray-700/50"
                  title="音量"
                />
              </div>
              {/* フルスクリーン */}
              <button
                onClick={handleFullscreen}
                className="p-2 text-white hover:text-purple-300 transition-colors bg-gray-700/50 rounded-full hover:bg-gray-600/50"
                title={isFullscreen ? '全画面解除' : '全画面表示'}
              >
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* ショートカット案内（フルスクリーン時のみ右下） */}
      {isFullscreen && showControls && (
        <div className="absolute bottom-4 right-4 z-30 bg-black/70 text-white text-xs rounded-lg px-4 py-2 shadow-lg pointer-events-none select-none">
          <div>Space:再生/停止　F:全画面　ESC:全画面解除</div>
        </div>
      )}
    </div>
  );
}