import { useState } from "react";
import "./VideoUpload.css";
import { useAnimation } from "../../context/AnimationContext";
interface VideoUploadProps {
  onClose?: () => void;
}
const API_URL = import.meta.env.VITE_API_URL;

const VideoUpload: React.FC<VideoUploadProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { showAnimation, hideAnimation } = useAnimation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTitle(e.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a video");

    setUploading(true);
    setUploadProgress(0);
    // Show global loading animation while the upload is in progress
    showAnimation("loading", "Uploading video... 0%");

    try {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";

      videoElement.onloadedmetadata = async () => {
        const duration = Math.floor(videoElement.duration);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("is_default", isDefault ? "true" : "false");
        formData.append("duration", duration.toString());

        const token = localStorage.getItem("authToken");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_URL}/api/videos/upload`);
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        // Track upload progress and update animation
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentage);
            // Update the animation message with current percentage
            showAnimation("loading", `Uploading video... ${percentage}%`);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { JSON.parse(xhr.responseText); } catch {}
            setUploading(false);
            setUploadProgress(100);
            hideAnimation();
            showAnimation("success", "Video uploaded successfully!", 2000);
            setTimeout(() => { 
              onClose && onClose(); 
              setUploadProgress(0);
            }, 1600);
          } else {
            setUploading(false);
            setUploadProgress(0);
            hideAnimation();
            showAnimation("error", "Upload failed. Please try again.", 2000);
          }
        };


        xhr.onerror = () => {
          setUploading(false);
          setUploadProgress(0);
          hideAnimation();
          showAnimation("error", "Upload failed. Please try again.", 2000);
        };

        xhr.send(formData);
      };

      videoElement.src = URL.createObjectURL(file);
    } catch (err: any) {
      setUploading(false);
      setUploadProgress(0);
      hideAnimation();
      showAnimation("error", "Upload failed. Please try again.", 2000);
    }
  };

  return (
    <div className="video-upload-modal">
      <h2>Upload Video</h2>

      {/* ---------- Upload Form ---------- */}
        <>
          <div
            className="vu-dropzone"
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
                setTitle(e.dataTransfer.files[0].name);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {file ? (
              <p>{file.name}</p>
            ) : (
              <p>Drag & drop a video here or click to select</p>
            )}
            <input type="file" accept="video/*" onChange={handleFileChange} />
          </div>

          <input
            type="text"
            className="vu-text-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="vu-textarea"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="vu-default-toggle">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            Set as default
          </label>

          <button
            className="vu-upload-button"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            Upload
          </button>

          <button className="vu-cancel-button" onClick={onClose}>
            Cancel
          </button>
        </>
    </div>
  );

};

export default VideoUpload;
