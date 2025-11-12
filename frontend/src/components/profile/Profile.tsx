import React, { useEffect, useState } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/loading1.json";
import "./Profile.css";

interface Device {
  device_id: number;
  device_code: string;
  status: string;
  last_seen: string | null;
  playback_state: string;
  current_video_id: number | null;
}

interface User {
  userId: number;
  username: string;
  email: string;
  created_at: string;
  profile_photo_url?: string;
}

const Profile: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [newDeviceInfo, setNewDeviceInfo] = useState<{
    device_code: string;
    device_token: string;
  } | null>(null);
  
  // Photo upload states
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const userId = Number(localStorage.getItem("userId"));
  const token = localStorage.getItem("authToken"); 

  useEffect(() => {
    if (!userId || !token) {
      console.error("No userId or token found in localStorage");
      setLoading(false);
      return;
    }

    const fetchProfileAndDevices = async () => {
      try {
        const userRes = await axios.get(`${API_URL}/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Set user data and ensure profile photo URL is handled
        if (userRes.data) {
          console.log('User data:', userRes.data); // Debug log
          setUser(userRes.data);
        }

        const devicesRes = await axios.get(`${API_URL}/api/devices/list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (devicesRes.data.devices) setDevices(devicesRes.data.devices);
      } catch (err) {
        console.error("Error fetching profile or devices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndDevices();
  }, [userId, token, API_URL]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a PNG, JPEG, or GIF image.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleUploadPhoto(file);
  };

  const handleUploadPhoto = async (file: File) => {
    setUploadLoading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${API_URL}/auth/upload-photo`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data && response.data.photo_url) {
        // Update user state with new photo URL
        setUser(prev => prev ? { ...prev, profile_photo_url: response.data.photo_url } : null);
        setUploadError(null);
        
        // Refresh user data to ensure we have the latest profile photo
        const userRes = await axios.get(`${API_URL}/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.data && userRes.data.profile_photo_url) {
          setUser(userRes.data);
        }
      } else {
        throw new Error('No photo URL in response');
      }
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setUploadError(err.response?.data?.error || 'Failed to upload photo');
      // Clear preview on error
      setPreviewUrl(null);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const handleAddDevice = () => {
    setShowAddDevice(true);
    setNewDeviceInfo(null);
  };

  const handleSubmitDevice = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_URL}/api/devices/create`,
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
      setShowAddDevice(false);
    } catch (err: any) {
      console.error("Failed to create device:", err);
    }
  };

  const handleRegisterDevice = async (device_code: string, device_token: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/devices/register`, {
        device_code,
        device_token,
      });
      
      // Refresh devices list
      const devicesRes = await axios.get(`${API_URL}/api/devices/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (devicesRes.data.devices) setDevices(devicesRes.data.devices);
      
      setNewDeviceInfo(null);
    } catch (err: any) {
      console.error("Failed to register device:", err);
    }
  };


  if (loading)
    return (
      <div className="profile-loading-overlay">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          className="profile-loading-lottie"
        />
      </div>
    );

  if (!user) return <div>User not found</div>;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="profile-dashboard">
      <div className="profile-container">
        <button 
          className="profile-close-button" 
          onClick={handleClose}
          title="Close profile"
        >
          X
        </button>
        {/* Banner and Avatar Section */}
        <div className="profile-banner">
          <div className="profile-avatar">
            <label htmlFor="photo-upload" className="avatar-upload-label">
              <img 
                src={previewUrl || user.profile_photo_url}
                alt="User Avatar" 
                className="avatar-image"
              />
              <div className="avatar-overlay">
                <span className="upload-icon">📷</span>
                <span className="upload-text">Change Photo</span>
              </div>
            </label>
            <input
              type="file"
              id="photo-upload"
              accept="image/png,image/jpeg,image/gif"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>
          {uploadLoading && (
            <div className="upload-status">
              <Lottie 
                animationData={loadingAnimation} 
                style={{ width: 30, height: 30 }} 
              />
              <span>Uploading...</span>
            </div>
          )}
          {uploadError && (
            <div className="upload-error">
              {uploadError}
            </div>
          )}
        </div>

        {/* Header Section */}
        <div className="profile-header">
          <h1 className="profile-name">{user.username}</h1>
          <p className="profile-role">Administrator</p>
        </div>

        {/* Personal Information Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">Personal Information</h2>
          </div>
          
          <div className="info-grid">
            <div className="info-field">
              <label className="info-label">Email</label>
              <input 
                type="email" 
                className="info-input" 
                value={user.email} 
                disabled 
              />
            </div>
            <div className="info-field">
              <label className="info-label">User ID</label>
              <input 
                type="text" 
                className="info-input" 
                value={`ID-${user.userId}`} 
                disabled 
              />
            </div>
            <div className="info-field">
              <label className="info-label">Join Date</label>
              <input 
                type="text" 
                className="info-input" 
                value={new Date(user.created_at).toLocaleDateString()} 
                disabled 
              />
            </div>
            <div className="info-field">
              <label className="info-label">Role</label>
              <input 
                type="text" 
                className="info-input" 
                value="Administrator" 
                disabled 
              />
            </div>
          </div>
        </div>

        {/* Connected Devices Card */}
        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">Connected Devices</h2>
            <button className="add-device-button" onClick={handleAddDevice}>Add Device</button>
          </div>

          {showAddDevice && (
            <div className="device-form-container">
              <form className="device-form" onSubmit={handleSubmitDevice}>
                <input
                  type="text"
                  placeholder="Enter device name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                  className="device-input"
                />
                <div className="form-buttons">
                  <button type="submit" className="save-button">Save</button>
                  <button type="button" className="cancel-button" onClick={() => setShowAddDevice(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {newDeviceInfo && (
            <div className="new-device-info">
              <div className="info-row">
                <span className="info-label">Device Code:</span>
                <span className="info-value">{newDeviceInfo.device_code}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Device Token:</span>
                <span className="info-value">{newDeviceInfo.device_token}</span>
              </div>
              <button
                className="register-button"
                onClick={() => handleRegisterDevice(newDeviceInfo.device_code, newDeviceInfo.device_token)}
              >
                Register Now
              </button>
            </div>
          )}
          
          <div className="devices-grid">
            {devices.length > 0 ? (
              devices.map((device) => (
                <div key={device.device_id} className="device-item">
                  <div className="device-header">
                    <div className="device-title">
                      <h3 className="device-name">{device.device_code}</h3>
                      <span className="device-id">ID: {device.device_id}</span>
                    </div>
                    <span className={`device-status ${device.status?.toLowerCase() === 'active' ? 'status-active' : 'status-inactive'}`}>
                      {device.status || 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="device-info">
                    {device.last_seen && (
                      <span className="device-detail">
                        Last seen: {new Date(device.last_seen).toLocaleString()}
                      </span>
                    )}
                    <span className="device-detail">
                      Playback: {device.playback_state || "Stopped"}
                    </span>
                    {device.current_video_id && (
                      <span className="device-detail">
                        Current Video ID: {device.current_video_id}
                      </span>
                    )}
                  </div>
                  
                  <div className="device-actions">
                    <button
                      className="download-button"
                      onClick={async () => {
                        try {
                          setLoading(true);
                          const res = await axios.get(
                            `${API_URL}/api/devices/${device.device_id}/download-config`,
                            {
                              headers: { Authorization: `Bearer ${token}` },
                              responseType: "blob",
                            }
                          );
                          const url = window.URL.createObjectURL(new Blob([res.data]));
                          const link = document.createElement("a");
                          link.href = url;
                          link.setAttribute("download", `${device.device_code}.zip`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } catch (err) {
                          console.error("Error downloading config:", err);
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Download Config
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-devices">No devices connected</div>
            )}
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Profile;
