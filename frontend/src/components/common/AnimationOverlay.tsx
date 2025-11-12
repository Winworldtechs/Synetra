import React from "react";
import Lottie from "lottie-react";
import { loading as loadingAnim, success as successAnim, error as errorAnim } from "../../assets/animations";
import "./AnimationOverlay.css";

export type AnimationType = "loading" | "success" | "error";

interface AnimationOverlayProps {
  type: AnimationType;
  message?: string;
}

const AnimationOverlay: React.FC<AnimationOverlayProps> = ({ type, message }) => {
  const animationData =
    type === "loading" ? loadingAnim : type === "success" ? successAnim : errorAnim;

  return (
    <div className="animation-overlay">
      <div className="animation-box">
        <Lottie animationData={animationData} loop={type === "loading"} className="global-lottie" />
        {message && <div className="animation-message">{message}</div>}
      </div>
    </div>
  );
};

export default AnimationOverlay;
