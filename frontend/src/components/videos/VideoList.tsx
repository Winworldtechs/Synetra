import { useState, useEffect, useRef } from "react";
import axios from "../../utils/axios";
import "./VideoList.css";
import Lottie from "lottie-react";
import loadingAnim from "../../assets/loading1.json";
import animatedDashboard from "../../assets/Animated Dashboards.json";

// Icons
const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const MuteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
);

const UnmuteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
);

interface Video {
  videoId: number;
  title: string;
  description: string;
  duration: number;
  startTime: string;
  endTime: string;
  deviceId: number;
  scheduleGroupId: number;
  videoUrl: string;
  deviceName?: string;
}

const PUBLIC_BASE_URL = import.meta.env.PUBLIC_BASE_URL;

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<{ video: Video }> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <div className="video-card">
      <div className="video-card-header">
        <div className="device-info">
          <h3 className="device-name">{video.deviceName || 'Unnamed Device'}</h3>
          <span className="device-id">Device ID: {video.deviceId}</span>
        </div>
        <div className="schedule-time">
          <span>Starts: {new Date(video.startTime).toLocaleTimeString()}</span>
          <span>Ends: {new Date(video.endTime).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="video-player"
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          muted={isMuted}
          loop
          playsInline
        />
        
        <div className="video-controls">
          <button className="control-btn" onClick={togglePlay}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button className="control-btn" onClick={toggleMute}>
            {isMuted ? <UnmuteIcon /> : <MuteIcon />}
          </button>
        </div>

        <div className="video-progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="video-duration">
          <span>{formatDuration(currentTime)} / {formatDuration(video.duration)}</span>
        </div>
      </div>
    </div>
  );
};

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduledVideos();
  }, []);

  const fetchScheduledVideos = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await axios.get("/api/videos/my-next-videos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure video URLs are absolute
      const updatedVideos = response.data.map((v: Video) => ({
        ...v,
        videoUrl: v.videoUrl.startsWith("https://")
          ? v.videoUrl
          : `${PUBLIC_BASE_URL}/${v.videoUrl}`,
      }));

      setVideos(updatedVideos);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching scheduled videos:", err);
      setError(err.response?.data?.msg || "Failed to fetch scheduled videos");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="video-list-loader">
        <div className="animation-center">
          <Lottie animationData={loadingAnim} loop style={{ width: 220, height: 220 }} />
          <div className="loader-text">Loading videos...</div>
        </div>
      </div>
    );

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="video-list">
      <div className="video-list-header">
        <h4>Upcoming Videos</h4>
      </div>

      {videos.length > 0 ? (
        <div className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video.videoId} video={video} />
          ))}
        </div>
      ) : (
        <div className="no-videos">
          <div className="animation-center">
            <Lottie animationData={animatedDashboard} loop style={{ width: 360, height: 360 }} />
            <div className="no-videos-text">No upcoming videos found</div>
            <div className="no-videos-sub">Once you upload videos they'll appear here.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;
