import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";
import { setAuthToken } from "../../utils/auth";
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/uploading.json";
import ForgotPasswordModal from "./ForgotPasswordModal";
import AnimationOverlay from "../common/AnimationOverlay";
import "./login.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_URL = import.meta.env.VITE_API_URL;

const LoginComponent: React.FC = () => {
  const navigate = useNavigate();

  // Common states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [type, setType] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
   const [mobileNumber, setMobileNumber] = useState("");

  // OTP signup states
  const [tempUser, setTempUser] = useState<{
    email: string;
    username: string;
    password: string; // hashed password returned by API
    mobile_number: string;
  } | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [signupOtp, setSignupOtp] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleOnClick = (mode: "signIn" | "signUp") => {
    if (mode !== type) setType(mode);
    setErrorMessage("");
    setOtpStep(false);
    setTempUser(null);
  };

  // Demo Login Handler
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await axios.post(
        `${API_URL}/auth/login`,
        { email: "xotomir427@gusronk.com", password: "Admin@#" },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );
      const token = res.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", res.data.user.id);
      setAuthToken(token);
      navigate("/home");
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // State for Forgot Password Modal
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  // ---------- AUTH SUBMIT ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      if (type === "signUp" && !otpStep) {
        // Initial signup → send OTP (include mobile number)
        const res = await axios.post(
          `${API_URL}/auth/signup`,
          { email, username, password, mobile_number: mobileNumber },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        setTempUser(res.data.temp_user);
        setOtpStep(true);
        // alert(res.data.message);
      } else if (type === "signUp" && otpStep && tempUser) {
        // Verify OTP
        await axios.post(
          `${API_URL}/auth/verify-signup-otp`,
          {
            email: tempUser.email,
            username: tempUser.username,
            password: tempUser.password,
            mobile_number: tempUser.mobile_number,
            otp: signupOtp,
          },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        // On successful verification show success animation and return user to sign-in
        setSignupSuccess(true);
        setTimeout(() => {
          setSignupSuccess(false);
          setType("signIn");
          setOtpStep(false);
          setTempUser(null);
          setSignupOtp("");
        }, 3000);
      } else {
        // Normal sign-in
        const res = await axios.post(
          `${API_URL}/auth/login`,
          { email, password },
          { headers: { "Content-Type": "application/json" }, withCredentials: true }
        );
        const token = res.data.token;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", res.data.user.id);
        setAuthToken(token);
        navigate("/home");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- GOOGLE LOGIN ----------
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    try {
      if (!credentialResponse.credential) throw new Error("No credential received");
      const decoded = jwtDecode(credentialResponse.credential);
      console.log("Google user:", decoded);

      const res = await axios.post(
        `${API_URL}/auth/google-login`,
        { token: credentialResponse.credential },
        { headers: { "Content-Type": "application/json" }, withCredentials: true }
      );

      if (res.data.token) {
        setAuthToken(res.data.token);
        navigate("/home");
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      setErrorMessage("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="login-container-wrapper">
      {/* 🔹 Global Loading Overlay */}
      {isLoading && (
        <div className="login-loading-overlay">
          <div className="login-loading-popup">
            <Lottie animationData={loadingAnimation} loop className="login-loading-lottie" />
            <p className="login-loading-text">Please wait...</p>
          </div>
        </div>
      )}

      {/* Success overlay shown after OTP verification (brief) */}
      {signupSuccess && (
        <AnimationOverlay type="success" message="Signup successful! Please log in." />
      )}

      <ForgotPasswordModal
        isOpen={isForgotPasswordModalOpen}
        onClose={() => setIsForgotPasswordModalOpen(false)}
      />

      <div
        className={`login-main-container ${
          type === "signUp" ? "login-container-right-panel-active" : ""
        }`}
      >
        {/* ========== SIGN UP ========== */}
        <div className="login-form-container login-sign-up-container">
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Mobile toggle shown above the form on small screens */}
            {isMobile && (
              <div className="mobile-toggle">
              <span>Already have an account? </span>
              <button type="button" className="mobile-toggle-btn" onClick={() => handleOnClick("signIn")}>
                Sign In
              </button>
              </div>
            )}
            <h1 className="login-heading">Create Account</h1>
            {/* <div className="login-social-container">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log("Google Login Failed")}
                />
              </GoogleOAuthProvider>
            </div> */}

            {errorMessage && <p className="login-error-text">{errorMessage}</p>}

            {!otpStep && (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  className="login-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="login-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  className="login-input"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
                <div className="login-password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="login-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                  </button>
                </div>
                <button className="login-button" type="submit" disabled={isLoading}>
                  Sign Up
                </button>
              </>
            )}

            {otpStep && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="login-input"
                  value={signupOtp}
                  onChange={(e) => setSignupOtp(e.target.value)}
                  required
                />
                <button className="login-button" type="submit" disabled={isLoading}>
                  Verify OTP
                </button>
              </>
            )}
          </form>
        </div>

        {/* ========== SIGN IN ========== */}
        <div className="login-form-container login-sign-in-container">
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Mobile toggle shown above the form on small screens */}
            {isMobile && (
              <div className="mobile-toggle">
              <span>Don't have an account? </span>
              <button type="button" className="mobile-toggle-btn" onClick={() => handleOnClick("signUp")}>
                Sign Up
              </button>
              </div>
            )}
            <h1 className="login-heading">Sign In</h1>
            <div className="login-social-container">
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.log("Google Login Failed")}
                />
              </GoogleOAuthProvider>
            </div>
            <span className="login-span">or use your account</span>

            {errorMessage && <p className="login-error-text">{errorMessage}</p>}

            <input
              type="email"
              placeholder="Email"
              className="login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="login-password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            <button className="login-button" type="submit" disabled={isLoading}>
              Sign In
            </button>

            {/* Demo Login and Forgot Password Links */}
            <div className="login-forgot-password">
              <a
                href="#"
                className="login-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  handleDemoLogin();
                }}
              >
                Try Demo Account
              </a>
              {" | "}
              <a
                href="#"
                className="login-forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsForgotPasswordModalOpen(true);
                }}
              >
                Forgot Password?
              </a>
            </div>
          </form>
        </div>

        {/* ========== OVERLAY PANELS ========== */}
        <div className="login-overlay-container">
          <div className="login-overlay">
            <div className="login-overlay-panel login-overlay-left">
              <h1 className="login-heading">Welcome Back!</h1>
              <p className="login-paragraph">Login with your personal info</p>
              <button className="login-button ghost" onClick={() => handleOnClick("signIn")}>
                Sign In
              </button>
            </div>
            <div className="login-overlay-panel login-overlay-right">
              <h1 className="login-heading">Hello!</h1>
              <p className="login-paragraph">Start your journey with us</p>
              <button className="login-button ghost" onClick={() => handleOnClick("signUp")}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
