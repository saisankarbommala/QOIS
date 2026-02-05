// src/pages/Login.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Smartphone,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

import {
  loginWithPassword,
  loginSendOtp,
  loginVerifyOtp,
  getGoogleAuthUrl
} from "../authApi";

import { useAuth } from "../context/AuthContext";
import loginVideo from "./login.mp4";

const styles = `
.auth-page { height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; background: #020617; overflow: hidden; }
.auth-wrapper { width: 90%; max-width: 1100px; height: 620px; display: grid; grid-template-columns: 1fr 1fr; background: rgba(15,23,42,0.8); backdrop-filter: blur(25px); border-radius: 25px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
.auth-visual { position: relative; }
.auth-video { width: 100%; height: 100%; object-fit: cover; }
.auth-card { padding: 40px; display: flex; flex-direction: column; justify-content: center; }
.auth-title { font-size: 34px; color: white; font-weight: bold; }
.auth-tabs { display: flex; margin: 25px 0; }
.auth-tab { flex: 1; padding: 12px; background: transparent; border: none; color: gray; cursor: pointer; font-weight: 600; }
.auth-tab.active { color: white; border-bottom: 2px solid #8b5cf6; }
.auth-field { background: #020617; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.auth-field input { background: transparent; border: none; color: white; outline: none; width: 100%; }
.auth-btn { width: 100%; padding: 14px; border-radius: 30px; background: linear-gradient(135deg,#00f0ff,#8b5cf6); border: none; color: white; font-weight: bold; cursor: pointer; }
.google-divider { text-align: center; margin: 15px 0; color: gray; }
.google-btn { background: white !important; color: black !important; }
`;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isProduction = import.meta.env.PROD; // Environment Detection

  const [mode, setMode] = useState("password");
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", otp: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`).focus();
    setForm(f => ({ ...f, otp: newOtp.join("") }));
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) document.getElementById(`otp-${index - 1}`).focus();
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let data;
      if (mode === "password") {
        data = await loginWithPassword(form);
      } else if (!otpSent) {
        await loginSendOtp({ email: form.email });
        setOtpSent(true);
        setLoading(false);
        return;
      } else {
        data = await loginVerifyOtp({ email: form.email, otp: isProduction ? "BYPASS" : form.otp });
      }

      login(data.user, data.token);
      navigate("/hiring");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <style>{styles}</style>
      <motion.div className="auth-wrapper" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="auth-visual">
          <video autoPlay muted loop className="auth-video">
            <source src={loginVideo} type="video/mp4" />
          </video>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Welcome Back</h1>

          {/* Tabs: Hide OTP tab in Production */}
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === "password" ? "active" : ""}`} onClick={() => { setMode("password"); setOtpSent(false); }}>
              Password
            </button>
            {!isProduction && (
             
            )}
          </div>

          <form onSubmit={handleAction}>
            <div className="auth-field"><Mail size={18} /><input name="email" type="email" placeholder="Email" required onChange={handleChange} /></div>

            <AnimatePresence>
              {mode === "password" ? (
                <motion.div className="auth-field">
                  {showPassword ? <EyeOff onClick={() => setShowPassword(false)} /> : <Eye onClick={() => setShowPassword(true)} />}
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" required onChange={handleChange} />
                </motion.div>
              ) : !isProduction && otpSent && (
                <motion.div className="auth-field">
                  <Smartphone />
                  <div style={{ display: "flex", gap: 8 }}>
                    {otp.map((d, i) => (
                      <input key={i} id={`otp-${i}`} value={d} maxLength={1} onChange={(e) => handleOtpChange(e.target.value, i)} onKeyDown={(e) => handleOtpKeyDown(e, i)}
                        style={{ width: 40, textAlign: "center", background: "#020617", color: "white", border: "1px solid #8b5cf6", borderRadius: 8 }} required />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}

            <button className="auth-btn" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 
               mode === "password" ? "Sign In" : 
               otpSent ? "Verify OTP" : "Send OTP"}
            </button>
          </form>

          <div className="google-divider">OR</div>
          <button className="auth-btn google-btn" onClick={() => (window.location.href = getGoogleAuthUrl())}>
            Continue with Google
          </button>

          <div style={{ marginTop: 15 }}>
            New here? <span onClick={() => navigate("/signup")} style={{ color: "#8b5cf6", cursor: "pointer" }}>Create account</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
