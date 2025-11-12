import { useEffect, useState } from "react";
import axios from "../../utils/axios";
import "./ScheduleModal.css"

interface Device {
  device_id: number;
  device_code: string;
  status: string;
}

interface ScheduleModalProps {
  videoId: number;
  onClose: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ videoId, onClose }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState<number | null>(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [playMode, setPlayMode] = useState("loop");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No auth token");

        const response = await axios.get("/api/devices/list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDevices(response.data.devices || []);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch devices");
      }
    };

    fetchDevices();
  }, []);

  const handleSchedule = async () => {
    if (!deviceId || !startTime) {
      setError("Please select a device and start time");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "/api/schedules/create",
        {
          video_id: videoId,
          device_id: deviceId,
          start_time: startTime,
          end_time: endTime || null,
          repeat,
          play_mode: playMode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Schedule created successfully!");
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.msg || "Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Schedule Video</h3>
        {error && <p className="error">{error}</p>}

        <label>Device:</label>
        <select
          value={deviceId || ""}
          onChange={(e) => setDeviceId(Number(e.target.value))}
        >
          <option value="">Select Device</option>
          {devices.map((device) => (
            <option key={device.device_id} value={device.device_id}>
              {device.device_code} ({device.status})
            </option>
          ))}
        </select>

        <label>Start Time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        <label>End Time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />

        <label>
          Repeat:
          <input
            type="checkbox"
            checked={repeat}
            onChange={(e) => setRepeat(e.target.checked)}
          />
        </label>

        <label>Play Mode:</label>
        <select value={playMode} onChange={(e) => setPlayMode(e.target.value)}>
          <option value="loop">Loop</option>
          <option value="once">Once</option>
        </select>

        <div className="modal-buttons">
          <button onClick={handleSchedule} disabled={loading}>
            {loading ? "Scheduling..." : "Schedule"}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
