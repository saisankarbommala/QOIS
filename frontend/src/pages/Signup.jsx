// src/pages/Signup.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";

import { signupSendOtp, signupVerifyOtp } from "../authApi";
import loginVideo from './login.mp4';

const styles = `
@keyframes meshGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.auth-page { height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; background: #020617; overflow: hidden; position: fixed; top: 0; left: 0; }
.blob { position: absolute; width: 500px; height: 500px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(167, 139, 250, 0.3) 100%); filter: blur(80px); border-radius: 50%; z-index: 1; animation: move 20s infinite alternate; }
.blob-1 { top: -10%; left: -10%; background: rgba(99, 102, 241, 0.2); }
.blob-2 { bottom: -10%; right: -10%; background: rgba(139, 92, 246, 0.2); }
.blob-3 { top: 40%; left: 30%; width: 300px; height: 300px; background: rgba(236, 72, 153, 0.15); }
@keyframes move { from { transform: translate(0, 0) scale(1); } to { transform: translate(100px, 100px) scale(1.2) rotate(90deg); } }
.particles { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 50px 50px; z-index: 2; }
.orb { position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%); filter: blur(60px); z-index: 1; }
.auth-wrapper { width: 90%; max-width: 1200px; height: 640px; display: grid; grid-template-columns: 0.85fr 1.15fr; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(25px) saturate(180%); border: 1px solid rgba(255,255,255,0.08); transition: transform 0.35s ease, box-shadow 0.35s ease; border-radius: 32px; overflow: hidden; z-index: 10; position: relative; margin-top: 65px; }
.auth-wrapper::before { content: ""; position: absolute; inset: 0; padding: 1.4px; border-radius: inherit; background: linear-gradient(120deg, #00f0ff, #8b5cf6, #ff2fd3, #00f0ff); background-size: 400% 400%; animation: neonBorderSlide 6s linear infinite; -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0.85; pointer-events: none; }
.auth-visual { position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; justify-content: center; align-items: center; }
.auth-video { position: absolute; top: 50%; left: 50%; min-width: 100%; min-height: 100%; transform: translate(-50%, -50%); z-index: -1; }
.auth-content { position: relative; margin-top: 385px; z-index: 1; text-align: center; opacity: 0; transform: translateY(20px) scale(0.95); animation: fadeInUpScale 1s ease forwards; animation-delay: 1s; }
@keyframes fadeInUpScale { 0% { opacity: 0; transform: translateY(20px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
.auth-brand { font-size: 3.3rem; font-weight: 900; letter-spacing: 2px; }
.auth-quote { font-size: 1.5rem; font-weight: 700; line-height: 1.2; margin-top: 1rem; }
.auth-card { padding: 45px 65px; display: flex; flex-direction: column; justify-content: center; background: radial-gradient(circle at 20% 15%, rgba(0,240,255,0.18), transparent 40%), linear-gradient(180deg, #020617, #020617); backdrop-filter: blur(22px) saturate(160%); border: 1px solid rgba(255,255,255,0.18); box-shadow: 0 8px 32px rgba(0,0,0,0.35); border-top-right-radius: 24px; border-bottom-right-radius: 24px; }
.auth-step { font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #6366f1; margin-bottom: 8px; }
.auth-title { font-size: 45px; font-weight: 800; color: #f8fafc; margin: 0; }
.auth-sub { margin-top: 8px; font-size: 15px; color: #94a3b8; }
.auth-form { margin-top: 24px; display: grid; gap: 16px; }
.auth-field { background: rgba(0, 0, 0, 0.9); border: 2px solid transparent; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 12px; margin-bottom: 16px; background-image: linear-gradient(180deg, rgba(6, 12, 26, 0.95), rgba(30, 12, 45, 0.95)), linear-gradient(90deg, #2f00ff, #8b5cf6, #ff2fd3, #00ffa6, #00f0ff); background-origin: border-box; background-clip: padding-box, border-box; background-size: 300% 100%; }
.auth-field input { flex: 1; background: transparent; border: none; outline: none; color: white; font-size: 15px; }
.auth-btn { width: 100%; padding: 16px; border-radius: 35px; border: 2px solid transparent; background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(139, 92, 246, 0.3)); backdrop-filter: blur(10px); color: white; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; font-size: 16px; transition: 0.3s; }
.auth-outline { border: 1px solid rgba(71, 85, 105, 0.5); background: transparent; color: #cbd5e1; }
.auth-footer { margin-top: 28px; font-size: 14px; color: #94a3b8; display: flex; align-items: center; justify-content: space-between; }
.login-link-btn { background: none; border: none; color: #a78bfa; font-weight: 600; cursor: pointer; padding: 0; margin-left: 5px; font-size:13px; }
`;

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function Signup() {
  const navigate = useNavigate();
  const isProduction = import.meta.env.PROD; // Environment Detection

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", otp: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(300);
  const [otpActive, setOtpActive] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleOtpChange = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[i] = val;
    setOtp(newOtp);
    if (val && i < 5) document.getElementById(`otp-${i+1}`).focus();
    setForm(f => ({ ...f, otp: newOtp.join("") }));
  };

  const handleOtpKeyDown = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) document.getElementById(`otp-${i-1}`).focus();
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (!otpActive || isProduction) return; // Disable timer in production
    if (otpTimer <= 0) return setOtpActive(false);
    const t = setInterval(() => setOtpTimer((x) => x - 1), 1000);
    return () => clearInterval(t);
  }, [otpActive, otpTimer, isProduction]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupSendOtp({ name: form.name, email: form.email });
      setStep(2);
      if (!isProduction) {
        setOtpActive(true);
        setOtpTimer(300);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifySignup = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert("Passwords do not match");
    setLoading(true);
    try {
      await signupVerifyOtp({
        name: form.name,
        email: form.email,
        otp: isProduction ? "BYPASS" : form.otp, // Bypass in production
        password: form.password,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <style>{styles}</style>
      <div className="particles"></div>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <motion.div className="auth-wrapper" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
        <div className="auth-visual">
          <video autoPlay muted loop className="auth-video">
            <source src={loginVideo} type="video/mp4" />
          </video>
          <div className="auth-content">
            <div className="auth-brand">QEE</div>
            <div className="auth-quote">QUANTUM EXECUTION <span> ENGINE</span></div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-step">Step {step} of 2</div>
          <h1 className="auth-title">{step === 1 ? "Get Started" : "Account Setup"}</h1>
          <p className="auth-sub">{step === 1 ? "Join our premium community today." : 
              isProduction ? "Secure your account with a strong password." : "We sent a secure code to your email."}</p>

          {step === 2 && !isProduction && (
            <div style={{ marginTop: 15, fontSize: 13, color: "#a78bfa", display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} /> OTP expires in <span style={{ fontWeight: 700 }}>{formatTime(otpTimer)}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form key="s1" className="auth-form" onSubmit={handleSendOtp} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="auth-field"><User size={18} color="#6366f1" /><input name="name" placeholder="Full name" required onChange={handleChange} /></div>
                <div className="auth-field"><Mail size={18} color="#6366f1" /><input type="email" name="email" placeholder="Email address" required onChange={handleChange} /></div>
                <button className="auth-btn" type="submit">{loading ? <Loader2 className="animate-spin" size={20} /> : <>Continue <ArrowRight size={18} /></>}</button>
              </motion.form>
            ) : (
              <motion.form key="s2" className="auth-form" onSubmit={handleVerifySignup} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                
                {/* OTP BOXES: Visible only in Development */}
                {!isProduction && (
                  <div className="auth-field1" style={{ display:"flex", justifyContent:"flex-start", gap:"8px", marginBottom: "20px" }}>
                    {otp.map((d,i)=>(
                      <input key={i} id={`otp-${i}`} value={d} maxLength={1} onChange={(e)=>handleOtpChange(e.target.value,i)} onKeyDown={(e)=>handleOtpKeyDown(e,i)}
                        style={{ width:50, height:56, textAlign:"center", fontSize:22, borderRadius:14, color:"#fff", background:"#020617", border:"2px solid transparent", backgroundImage:`linear-gradient(#020617,#020617), linear-gradient(135deg,#00f0ff,#8b5cf6,#ff2fd3)`, backgroundOrigin:"border-box", backgroundClip:"padding-box, border-box", boxShadow:"0 0 12px rgba(139,92,246,0.5)", outline:"none" }} required />
                    ))}
                  </div>
                )}

                <div className="auth-field">
                  {showPass ? <EyeOff size={18} color="#a78bfa" style={{cursor:"pointer"}} onClick={()=>setShowPass(false)} /> : <Eye size={18} color="#a78bfa" style={{cursor:"pointer"}} onClick={()=>setShowPass(true)} />}
                  <input type={showPass ? "text" : "password"} name="password" placeholder="New Password" required onChange={handleChange} />
                </div>
                <div className="auth-field">
                  {showConfirmPass ? <EyeOff size={18} color="#a78bfa" style={{cursor:"pointer"}} onClick={()=>setShowConfirmPass(false)} /> : <Eye size={18} color="#a78bfa" style={{cursor:"pointer"}} onClick={()=>setShowConfirmPass(true)} />}
                  <input type={showConfirmPass ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} />
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <button type="button" className="auth-btn auth-outline" style={{ flex: 1 }} onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</button>
                  <button className="auth-btn" style={{ flex: 2 }} type="submit">{loading ? <Loader2 className="animate-spin" size={20} /> : <>Complete Signup <ArrowRight size={18} /></>}</button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          <div className="auth-footer"><span>Already a member?</span><button className="login-link-btn" onClick={() => navigate("/login")}>Login to Account</button></div>
        </div>
      </motion.div>
    </div>
  );
}
