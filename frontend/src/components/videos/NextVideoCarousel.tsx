import { useRef, useState, useEffect } from "react";
import axios from "../../utils/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VideoCardCarousel.css";

// Use public folder path for arrow icon
const arrow = "/right-arrow-next-svgrepo-com.svg";

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

const PUBLIC_BASE_URL = "https://pub-cafffcbfe1b04cb4bc378666a1eefad2.r2.dev";

const NextVideoCarousel: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [scrollAmount, setScrollAmount] = useState(300);
  const [nextVideoId, setNextVideoId] = useState<number | null>(null);

  useEffect(() => {
    fetchScheduledVideos();
    updateScrollAmount();
    window.addEventListener("resize", updateScrollAmount);
    return () => window.removeEventListener("resize", updateScrollAmount);
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [videos]);

  // Determine the next upcoming video
  useEffect(() => {
    if (!videos.length) return;
    const now = new Date();
    const nextVideo = videos.find(
      (v) => new Date(v.startTime) > now
    );
    setNextVideoId(nextVideo?.videoId || null);
  }, [videos]);

  const fetchScheduledVideos = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await axios.get("/api/videos/my-next-videos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedVideos = response.data.map((v: Video) => ({
        ...v,
        videoUrl: v.videoUrl.startsWith("https://")
          ? v.videoUrl
          : `${PUBLIC_BASE_URL}/${v.videoUrl}`,
      }));

      setVideos(updatedVideos);
      generateThumbnails(updatedVideos);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching scheduled videos:", err);
      setError(err.response?.data?.msg || "Failed to fetch scheduled videos");
    } finally {
      setLoading(false);
    }
  };

  const generateThumbnails = (videos: Video[]) => {
    videos.forEach((video) => {
      const videoEl = document.createElement("video");
      videoEl.src = video.videoUrl;
      videoEl.crossOrigin = "anonymous";
      videoEl.muted = true;

      videoEl.addEventListener("loadedmetadata", () => {
        const captureTime = Math.min(2, videoEl.duration / 2);
        videoEl.currentTime = captureTime;
      });

      videoEl.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = videoEl.videoWidth / 2;
          canvas.height = videoEl.videoHeight / 2;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            setThumbnails((prev) => ({
              ...prev,
              [video.videoId]: canvas.toDataURL("image/jpeg"),
            }));
          }
        } catch (e) {
          console.warn("CORS blocked thumbnail generation:", e);
          setThumbnails((prev) => ({
            ...prev,
            [video.videoId]:
              "https://via.placeholder.com/300x150.png?text=Video+Preview",
          }));
        }
        videoEl.remove();
      });
    });
  };

  const updateScrollAmount = () => {
    if (window.innerWidth < 768) setScrollAmount(200);
    else if (window.innerWidth < 1200) setScrollAmount(400);
    else setScrollAmount(600);
  };

  const scrollLeft = () =>
    carouselRef.current?.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  const scrollRight = () =>
    carouselRef.current?.scrollBy({ left: scrollAmount, behavior: "smooth" });

  const checkScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 0);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="carousel-header">
        <h4>Upcoming Videos</h4>
      </div>

      <div className="carousel-container">
        {showLeft && (
          <button className="scroll-btn left" onClick={scrollLeft}>
            <img
              src={arrow}
              alt="left"
              style={{ transform: "rotate(180deg)", width: "40px" }}
            />
          </button>
        )}

        <div className="carousel-track" ref={carouselRef}>
          {videos.map((video) => (
            <div
              className={`card ${
                video.videoId === nextVideoId ? "next-video-card" : ""
              }`}
              key={video.videoId}
            >
              {thumbnails[video.videoId] ? (
                <img
                  src={thumbnails[video.videoId]}
                  className="card-img-top"
                  alt={video.title}
                />
              ) : (
                <div
                  className="card-img-top"
                  style={{
                    height: "150px",
                    background: "#ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#555",
                  }}
                >
                  Loading thumbnail...
                </div>
              )}
              <div className="card-body">
                <h5 className="card-title">{video.title}</h5>
                <p className="card-text">{video.description}</p>
                <small className="text-muted">
                  Duration: {formatDuration(video.duration)} <br />
                  Start: {video.startTime} <br />
                  End: {video.endTime}
                </small>
              </div>
            </div>
          ))}
        </div>

        {showRight && (
          <button className="scroll-btn right" onClick={scrollRight}>
            <img src={arrow} alt="Right" style={{ width: "40px" }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default NextVideoCarousel;
