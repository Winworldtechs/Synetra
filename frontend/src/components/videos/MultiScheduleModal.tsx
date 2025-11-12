import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import "./MultiScheduleModal.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import { useAnimation } from "../../context/AnimationContext";

interface Device {  
  device_id: number;
  device_code: string;
  status: string;
  last_fetch_time?: string;
  next_fetch_time?: string;
}

interface Video {
  videoId: number;
  title: string; 
}

const MultiScheduleModal = ({ onClose }: { onClose: () => void }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [playMode, setPlayMode] = useState("loop");
  const [mounted, setMounted] = useState(false);
  const { showAnimation, hideAnimation } = useAnimation();

  useEffect(() => {
  const token = localStorage.getItem("authToken");
  showAnimation('loading', 'Loading data...');

    // Fetch devices
    const devicesReq = axios
      .get("/api/devices/list", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setDevices(res.data.devices || []))
      .catch((err) => console.error("Failed to load devices", err));

    // Fetch videos
    const videosReq = axios
      .get("/api/videos/my-videos", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setVideos(res.data || []))
      .catch((err) => console.error("Failed to load videos", err));

    // When both finished, hide loading
    Promise.all([devicesReq, videosReq]).finally(() => {
      setTimeout(() => hideAnimation(), 300);
    });
  }, []);

  // add mounted class to trigger fade-in animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(t);
  }, []);

  const handleSchedule = async () => {
    if (!selectedDevices.length || !selectedVideos.length || !startTime) {
      showAnimation('error', 'Please select at least one device, one video, and a start time.', 2500);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      showAnimation('error', 'Unauthorized', 2000);
      return;
    }

    try {
  showAnimation('loading', 'Creating schedules...');
      const res = await axios.post(
        "/api/schedules/create-multiple",
        {
          deviceIds: selectedDevices,
          videoIds: selectedVideos,
          startTime,
          endTime,
          repeat,
          playMode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      showAnimation('success', `Group ${data.schedule_group_id}`, 1600);
      setTimeout(() => { onClose(); }, 1600);
    } catch (err: any) {
      console.error(err);
      showAnimation('error', err.response?.data?.msg || 'Failed to create schedules', 2500);
    }
  };

  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    );
  };

  const toggleDeviceSelection = (device_id: number) => {
    setSelectedDevices((prev) =>
      prev.includes(device_id) ? prev.filter((id) => id !== device_id) : [...prev, device_id]
    );
  };

  const nowISO = new Date().toISOString().slice(0,16);

  return (
    // Overlay backdrop
    <div className={`msm-overlay ${mounted ? "open" : ""}`} role="dialog" aria-modal="true">
      <div className="msm-modal" aria-labelledby="msm-title">
        <header className="msm-header">
          <h2 id="msm-title">Create Multi Video Schedule</h2>
          <button aria-label="Close" className="msm-close" onClick={onClose}>✖</button>
        </header>

        <div className="msm-divider" />

        {/* Global animation overlay handles feedback */}

        <div className="msm-body">
          <section className="msm-lists">
            <div className="msm-column devices">
              <h4 className="msm-subtitle">Devices</h4>
              <div className="msm-scroll list-devices">
                {devices.map((d) => {
                  const selected = selectedDevices.includes(d.device_id);
                  return (
                    <div
                      key={`device-${d.device_id}`}
                      className={`device-card ${selected ? "selected" : ""}`}
                      onClick={() => toggleDeviceSelection(d.device_id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleDeviceSelection(d.device_id); }}
                    >
                      <div className="device-main">
                        <span className="device-icon" aria-hidden>
                          {/* small monitor icon */}
                          <svg width="18" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="3" width="20" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M8 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M12 16v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </span>
                        <div className="device-name">
                          <div className="device-title">
                            <span className={`status-dot ${d.status?.toLowerCase() === 'active' ? 'online' : d.status?.toLowerCase() === 'inactive' ? 'offline' : 'unknown'}`} aria-hidden></span>
                            {d.device_code} <span className="device-status">({d.status})</span>
                          </div>
                          <div className="device-times">
                            <div><strong>Last Fetch:</strong> {d.last_fetch_time ? new Date(d.last_fetch_time).toLocaleString() : '—'}</div>
                            <div><strong>Next Fetch:</strong> {d.next_fetch_time ? new Date(d.next_fetch_time).toLocaleString() : '—'}</div>
                          </div>
                        </div>
                        <input type="checkbox" className="hidden-checkbox" readOnly checked={selected} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="msm-column videos">
              <h4 className="msm-subtitle">Videos</h4>
              <div className="msm-scroll list-videos">
                {videos.map((v) => {
                  const selected = selectedVideos.includes(v.videoId);
                  return (
                    <label key={`video-${v.videoId}`} className={`video-item ${selected ? 'selected' : ''}`}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleVideoSelection(v.videoId)}
                      />
                      <span className="video-icon" aria-hidden>
                        <svg width="18" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 7v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M17 10l4-2v8l-4-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="video-title">{v.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="msm-times">
            <div className="time-input">
              <label className="time-label">Start Time</label>
              <div className="input-wrap">
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  min={nowISO}
                />
                <span className="input-icon" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 11v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="time-input">
              <label className="time-label">End Time</label>
              <div className="input-wrap">
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={nowISO}
                />
                <span className="input-icon" aria-hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 11v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M17 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </span>
              </div>
            </div>

            <div className="options-row">
              <label className="option-inline">
                <input
                  type="checkbox"
                  checked={repeat}
                  onChange={(e) => setRepeat(e.target.checked)}
                />
                Repeat
              </label>

              <label className="option-inline">
                Play Mode
                <select value={playMode} onChange={(e) => setPlayMode(e.target.value)}>
                  <option value="loop">Loop</option>
                  <option value="once">Play Once</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        <footer className="msm-footer">
          <div className="footer-actions">
            <button onClick={handleSchedule} className="btn btn-primary">Create Schedule</button>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MultiScheduleModal;
