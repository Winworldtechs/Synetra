import { useEffect, useState } from "react";
import axios from "axios";
import { Monitor, Play, Clock, Plus, X } from "lucide-react";
import { useAnimation } from "../../context/AnimationContext";
import "./DeviceList.css";

interface Video {
  video_id: number;
  title: string;
  video_link: string;
}

interface Device {
  device_id: number;
  device_code: string;
  status: string;
  playback_state: string;
  last_seen: string | null;
  current_video: Video | null;
}

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  // loading handled by global overlay
  const [showModal, setShowModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const { showAnimation, hideAnimation } = useAnimation();

  const fetchDevices = async () => {
    try {
      showAnimation("loading", "Loading devices...");
      const res = await axios.get(`${API_URL}/api/devices/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    } finally {
      hideAnimation();
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleAddDevice = async () => {
    if (!newDeviceName.trim()) return;

    try {
      showAnimation("loading", "Creating device...");
      const res = await axios.post(
        `${API_URL}/api/devices/create`,
        { name: newDeviceName },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `config.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setNewDeviceName("");
      setShowModal(false);
      await fetchDevices();
      showAnimation("success", "Device created", 2000);
    } catch (err) {
      console.error("Error adding device:", err);
      showAnimation("error", "Failed to create device", 2000);
    } finally {
      hideAnimation();
    }
  };


  return (
    <div className="device-list-container">
      <div className="device-list-header">
        <h2>Devices</h2>
        <button
          className="device-list-add-button"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} /> Add Device
        </button>
      </div>

      {/* Device List */}
      <div className="device-list-grid">
        {devices.map((device) => (
          <div key={device.device_id} className="device-list-card">
            <div
              className={`device-list-badge ${
                device.status === "active" ? "active" : "inactive"
              }`}
            >
              {device.status}
            </div>

            <div className="device-list-device-header">
              <div className="device-list-device-icon">
                {device.device_code.charAt(0).toUpperCase()}
              </div>
              <h3>{device.device_code}</h3>
            </div>

            {device.current_video ? (
              <div className="device-list-video-preview">
                <video
                  src={device.current_video.video_link}
                  controls
                  muted
                  className="device-list-video"
                />
                <p className="device-list-video-title">
                  {device.current_video.title}
                </p>
              </div>
            ) : (
              <div className="device-list-no-video">
                <Play className="device-list-icon" />
                <span>No video playing</span>
              </div>
            )}

            <div className="device-list-info">
              <Monitor className="device-list-icon" />
              <span>{device.playback_state}</span>
            </div>

            <div className="device-list-info">
              <Clock className="device-list-icon" />
              <span>
                {device.last_seen
                  ? new Date(device.last_seen).toLocaleString()
                  : "Never"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Device Modal */}
      {showModal && (
        <div className="device-modal-overlay">
          <div className="device-modal">
            <div className="device-modal-header">
              <h3>Add New Device</h3>
              <button
                className="device-modal-close"
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Enter device name"
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
              className="device-modal-input"
            />
            <button
              className="device-modal-add-btn"
              onClick={handleAddDevice}
            >
              Add Device
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
