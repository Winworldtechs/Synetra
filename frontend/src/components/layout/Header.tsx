import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import VideoUpload from "../videos/VideoUpload";
import Profile from "../profile/Profile";
import MultiScheduleModal from "../videos/MultiScheduleModal";
import DeviceList from "../videos/DeviceList";
import "./Header.css";
import axios from "../../utils/axios";

const Header: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDeviceList, setShowDeviceList] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [devices, setDevices] = useState<
    { device_id: number; device_code: string; status: string; last_fetch_time?: string }[]
  >([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  const [userProfile, setUserProfile] = useState<{ profile_photo_url?: string } | null>(null);

  // Fetch devices
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    let mounted = true;
    axios
      .get("/api/devices/list", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!mounted) return;
        setDevices(res.data.devices || []);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");
      const userId = localStorage.getItem("userId");
      if (!token || !userId) return;

      try {
        const userRes = await axios.get(`/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.data && userRes.data.profile_photo_url) {
          setUserProfile(userRes.data);
        } else {
          console.warn("No photo URL found in user response");
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showNotifs && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [showNotifs]);

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <Link to="/">
              <img 
                src="/synetra.png"
                alt="Logo" 
                style={{ 
                  width: "80px", 
                  height: "auto", 
                  display: "block",
                  maxWidth: "100%"
                }} 
              />
            </Link>
          </div>

          <div className="header-right">
            <button
              className="menu-toggle show-sm"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="menu-label">Menu</span>
            </button>

            <nav className="header-nav">
              <NavLink
                to="/home"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Home
              </NavLink>
              <NavLink
                to="/designers"
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                Creative designs
              </NavLink>
            </nav>

            {/* Upload Button */}
            <button
              type="button"
              className="btn-upload"
              onClick={() => setShowUploadModal(true)}
            >
              <img src="/upload.png" alt="Upload" className="upload-icon" />
              Upload
            </button>

            {/* Notification bell */}
            <div className="header-notif" ref={notifRef}>
              <button
                className="notif-btn"
                onClick={() => setShowNotifs((s) => !s)}
                aria-label="Notifications"
                aria-expanded={showNotifs}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 1 0-3 0v0.68C7.64 5.36 6 7.929 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {devices.filter((d) =>
                  ["inactive", "offline", "disconnected"].includes(
                    String(d.status).toLowerCase()
                  )
                ).length > 0 && (
                  <span className="notif-badge">
                    {
                      devices.filter((d) =>
                        ["inactive", "offline", "disconnected"].includes(
                          String(d.status).toLowerCase()
                        )
                      ).length
                    }
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-title">Device Alerts</div>
                  {devices.filter((d) =>
                    ["inactive", "offline", "disconnected"].includes(
                      String(d.status).toLowerCase()
                    )
                  ).length === 0 ? (
                    <div className="notif-empty">No alerts</div>
                  ) : (
                    devices
                      .filter((d) =>
                        ["inactive", "offline", "disconnected"].includes(
                          String(d.status).toLowerCase()
                        )
                      )
                      .map((d) => (
                        <div key={`hdr-alert-${d.device_id}`} className="notif-item">
                          <div className="notif-item-title">
                            {d.device_code} is <strong>{d.status}</strong>
                          </div>
                          <div className="notif-item-sub">
                            Last fetch:{" "}
                            {d.last_fetch_time
                              ? new Date(d.last_fetch_time).toLocaleString()
                              : "—"}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <div className="avatar" onClick={() => setShowProfileModal(true)}>
              <img
                src={userProfile?.profile_photo_url || "/icons8-profile-48.png"}
                alt="User Avatar"
                className="header-avatar"
              />
            </div>
          </div>
        </div>

        {/* Mobile dropdown panel */}
        {menuOpen && (
          <div className="mobile-nav show-sm" onClick={() => setMenuOpen(false)}>
            <div className="mobile-nav-inner" onClick={(e) => e.stopPropagation()}>
              <NavLink to="/home" className={({ isActive }) => (isActive ? "m-nav-link active" : "m-nav-link")}>
                Home
              </NavLink>
              <NavLink to="/designers" className={({ isActive }) => (isActive ? "m-nav-link active" : "m-nav-link")}>
                Creative designs
              </NavLink>
              <button
                type="button"
                className="btn-upload m-btn"
                onClick={() => {
                  setShowUploadModal(true);
                  setMenuOpen(false);
                }}
              >
                <img src="/upload.png" alt="Upload" className="upload-icon" />
                Upload
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      {showUploadModal && (
        <div
          className="video-upload-modal-backdrop"
          onClick={() => setShowUploadModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <VideoUpload onClose={() => setShowUploadModal(false)} />
          </div>
        </div>
      )}

      {showProfileModal && (
        <div
          className="video-upload-modal-backdrop"
          onClick={() => setShowProfileModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Profile onClose={() => setShowProfileModal(false)} />
          </div>
        </div>
      )}

      {showScheduleModal && (
        <div
          className="video-upload-modal-backdrop"
          onClick={() => setShowScheduleModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <MultiScheduleModal onClose={() => setShowScheduleModal(false)} />
          </div>
        </div>
      )}

      {showDeviceList && (
        <div
          className="video-upload-modal-backdrop"
          onClick={() => setShowDeviceList(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <DeviceList />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
