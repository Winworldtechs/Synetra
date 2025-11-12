import { useEffect, useState } from "react";
import axios from "../../utils/axios";
// import VideoPlayer from '../videos/VideoPlayer';
import "./DeviceManager.css";

interface Device {
  device_id: number;
  device_code: string;
  status: string;
  last_seen: string | null;
  currentVideo?: {
    url: string;
    title: string;
  };
}

const DeviceManager: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [newDeviceInfo, setNewDeviceInfo] = useState<{
    device_code: string;
    device_token: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token");

        const response = await axios.get("/api/devices/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDevices(response.data.devices || []);
        setLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch devices");
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) return <div className="loading">Loading devices...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const handleAddDevice = () => {
    setShowForm(!showForm);
    setNewDeviceInfo(null);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const response = await axios.post(
        "/api/devices/create",
        { name: deviceName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newDevice = response.data.device;
      setDevices((prev) => [...prev, newDevice]);
      setNewDeviceInfo({
        device_code: newDevice.device_code,
        device_token: newDevice.device_token,
      });

      setDeviceName("");
      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create device");
    }
  };

  const handleRegister = async (device_code: string, device_token: string) => {
    try {
      const response = await axios.post("/api/devices/register", {
        device_code,
        device_token,
      });

      alert("Device registered: " + response.data.message);

      const token = localStorage.getItem("authToken");
      if (token) {
        const res = await axios.get("/api/devices/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDevices(res.data.devices || []);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to register device");
    }
  };

  const handleUpload = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("No auth token found. Please login.");
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".mp4,.mov,.mkv,.avi";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name);

        await axios.post("/api/videos/upload", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        alert("Video uploaded successfully!");
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.msg || "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <div className="device-manager">
      <div className="device-header">
        <h2>Devices</h2>
        <div className="device-actions">
          <button className="btn" onClick={handleAddDevice}>
            {showForm ? "Close Form" : "Add Device"}
          </button>
          <button className="btn" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Video"}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="device-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter device name"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            required
          />
          <div className="form-buttons">
            <button type="submit" className="btn save-btn">
              Save
            </button>
            <button
              type="button"
              className="btn cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {newDeviceInfo && (
        <div className="new-device-info">
          <p>
            <strong>Device Code:</strong> {newDeviceInfo.device_code}
          </p>
          <p>
            <strong>Device Token:</strong> {newDeviceInfo.device_token}
          </p>
          <button
            className="btn register-btn"
            onClick={() =>
              handleRegister(
                newDeviceInfo.device_code,
                newDeviceInfo.device_token
              )
            }
          >
            Register Now
          </button>
        </div>
      )}

      {devices.length === 0 ? (
        <div className="no-devices">No devices found</div>
      ) : (
        <div className="device-list">
          {devices.map((device) => (
            <div key={device.device_id} className="device-item">
              <div className="device-info">
                <span className="device-code">{device.device_code}</span>
                <span
                  className={`device-status ${device.status.toLowerCase()}`}
                >
                  {device.status}
                </span>
                <span className="device-last-seen">
                  Last seen: {device.last_seen || "N/A"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeviceManager;
