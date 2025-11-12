import { useRef, useState, useEffect } from "react";
import axios from "../../utils/axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./VideoCardCarousel.css";
import MultiScheduleModal from "./MultiScheduleModal";
import { useAnimation } from "../../context/AnimationContext";

// Use public folder path for arrow icon
const arrow = "/right-arrow-next-svgrepo-com.svg";

interface Video {
  videoId: number;
  title: string;
  description: string;
  duration: number;
  uploadedAt: string;
  videoUrl: string;
}

const VideoCardCarousel: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const [scrollAmount, setScrollAmount] = useState(300);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { showAnimation, hideAnimation } = useAnimation();

  useEffect(() => {
    fetchVideos();
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

  const fetchVideos = async () => {
    try {
      showAnimation("loading", "Loading videos...");
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await axios.get("/api/videos/my-videos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedVideos = response.data.map((v: Video) => ({
        ...v,
        videoUrl: v.videoUrl.startsWith("https://") ? v.videoUrl : v.videoUrl,
      }));

      setVideos(updatedVideos);
      generateThumbnails(updatedVideos);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching videos:", err);
      setError(err.response?.data?.msg || "Failed to fetch videos");
    } finally {
      setLoading(false);
      hideAnimation();
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

  const handleDownload = (video: Video) => {
    const link = document.createElement("a");
    link.href = video.videoUrl;
    link.download = video.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (videoId: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this video?");
    if (!confirmDelete) return;

    showAnimation("loading", "Deleting video...");

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      await axios.delete(`/api/videos/delete/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVideos((prev) => prev.filter((v) => v.videoId !== videoId));
      showAnimation("success", "Video deleted successfully!", 2000);
    } catch (err) {
      console.error("Error deleting video:", err);
      showAnimation("error", "Failed to delete video", 2000);
    }
  };

  const handleOpenScheduleModal = () => {
    setShowScheduleModal(true);
    setTimeout(() => setModalVisible(true), 50);
  };

  const closeScheduleModal = () => {
    setModalVisible(false);
    setTimeout(() => setShowScheduleModal(false), 300);
  };

  if (loading) return null;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="carousel-header">
        <h4>Playlist</h4>

        <button
          className="btn btn-primary d-flex align-items-center gap-2"
          style={{
            backgroundColor: "#0097DE",
            border: "none",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
          }}
          onClick={handleOpenScheduleModal}
        >
          <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
          Create Playlist
        </button>
      </div>

      <div className="carousel-container">
        {showLeft && (
          <button className="scroll-btn left" onClick={scrollLeft}>
            <img src={arrow} alt="left" style={{ transform: "rotate(180deg)", width: "40px" }} />
          </button>
        )}

        <div className="carousel-track" ref={carouselRef}>
          {videos.map((video) => (
            <div className="card position-relative" key={video.videoId}>
              {thumbnails[video.videoId] ? (
                <img className="card-img-top" src={thumbnails[video.videoId]} alt={video.title} />
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

              <div className="card-body d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="card-title mb-0">{video.title}</h5>

                  <div className="dropdown">
                    <button
                      className="btn btn-light btn-sm"
                      onClick={() =>
                        setOpenMenuId(openMenuId === video.videoId ? null : video.videoId)
                      }
                    >
                      &#8942;
                    </button>
                    {openMenuId === video.videoId && (
                      <ul className="dropdown-menu dropdown-menu-end show">
                        <li>
                          <button className="dropdown-item" onClick={() => handleDownload(video)}>
                            Download
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item text-danger"
                            onClick={() => handleDelete(video.videoId)}
                          >
                            Delete
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
                <p className="card-text">{video.description}</p>
                <small className="text-muted">
                  Duration: {formatDuration(video.duration)}
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

      {/* Modal with fade-in and blurred background */}
      {showScheduleModal && (
        <div
          className={`schedule-modal-backdrop ${modalVisible ? "fade-in" : "fade-out"}`}
          onClick={closeScheduleModal}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <MultiScheduleModal onClose={closeScheduleModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCardCarousel;
