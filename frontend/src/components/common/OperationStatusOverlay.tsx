import React, { useEffect } from 'react';
import Lottie from "lottie-react";
import loadingAnim from "../../assets/loading1.json";
import { success as successAnim } from "../../assets/animations";
import errorAnim from "../../assets/error.json";
import uploadingAnim from "../../assets/uploading.json";
import deleteLoadingAnim from "../../assets/delete_loading.json";
import './OperationStatusOverlay.css';

export type OperationType = "default" | "upload" | "delete";
export type OperationStatus = "loading" | "success" | "error" | null;

interface OperationStatusOverlayProps {
  status: OperationStatus;
  message?: string;
  onClose?: () => void;
  operationType?: OperationType;
  autoCloseDelay?: number;
}

const OperationStatusOverlay: React.FC<OperationStatusOverlayProps> = ({
  status,
  message,
  onClose,
  operationType = "default",
  autoCloseDelay = 2000
}) => {
  useEffect(() => {
    if ((status === "success" || status === "error") && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [status, onClose, autoCloseDelay]);

  if (!status) return null;

  const getAnimationData = () => {
    if (status === "loading") {
      switch (operationType) {
        case "upload":
          return uploadingAnim;
        case "delete":
          return deleteLoadingAnim;
        default:
          return loadingAnim;
      }
    }
    return status === "success" ? successAnim : errorAnim;
  };

  const getDefaultMessage = () => {
    if (status === "loading") {
      switch (operationType) {
        case "upload":
          return "Uploading...";
        case "delete":
          return "Deleting...";
        default:
          return "Loading...";
      }
    }
    return status === "success" ? "Operation successful!" : "Operation failed!";
  };

  return (
    <div className="operation-overlay">
      <div className="operation-content">
        <Lottie 
          animationData={getAnimationData()} 
          loop={status === "loading"}
          className="operation-animation"
        />
        <p className={`operation-message ${status}`}>
          {message || getDefaultMessage()}
        </p>
      </div>
    </div>
  );
};

export default OperationStatusOverlay;