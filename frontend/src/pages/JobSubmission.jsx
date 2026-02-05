// src/pages/JobSubmission.jsx

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchBackends, createJob, submitJobToIbm } from "../jobsApi.js";

/* =========================================================
   🔥 GLOBAL NEON + GLASS STYLES (PLAIN CSS)
========================================================= */
const styles = `
.qjs-page {min-height: auto; 
  padding: 26px 34px 20px;
  background:black;
  color: #e5e7ff;
  font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow-x: hidden;
   box-sizing: border-box;
}

.qjs-page::before,
.qjs-page::after {
  content: "";
  position: fixed;
  width: 520px;
  height: 520px;
  border-radius: 999px;
  filter: blur(90px);
  opacity: 0.55;
  pointer-events: none;
  z-index: 0;
}
.qjs-page::before {
  top: -160px;
  left: -120px;
  
  background: radial-gradient(circle, rgba(56,189,248,0.7), transparent 70%);
}.qjs-page::after {
  position: absolute; /* fixed nundi absolute ki marchandi */
  bottom: 0; /* -180px badulu 0 pettandi */
  right: 0;
  /* migilina code... */
  background: radial-gradient(circle, rgba(168,85,247,0.8), transparent 70%);
}

.qjs-grid-bg {
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(rgba(148,163,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148,163,255,0.06) 1px, transparent 1px);
  background-size: 46px 46px;
  opacity: 0.6;
  z-index: 0;
  animation: qjs-grid-move 40s linear infinite;
  pointer-events: none;
}
@keyframes qjs-grid-move {
  0% { transform: translate3d(0,0,0); }
  100% { transform: translate3d(-92px,-92px,0); }
}

.qjs-inner {
  position: relative;
  z-index: 1;
}

/* header */
.qjs-header {
  display: flex;
  flex-direction: column; 
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  position: relative;
}
.qjs-header-main {
  display: flex;
  flex-direction: column;
}
  .qjs-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}
.qjs-title-main {
  font-size: 40px; 
  font-weight: 700;
  letter-spacing: 0.24em;
  white-space: nowrap;
  overflow: hidden;
  animation: typing 2.2s steps(26, end), blink-caret 1.1s step-end infinite;
}
.qjs-title-sub {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
  text-align: center; 
   margin-bottom:25px;
}
.qjs-kicker {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #9ca3ff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.qjs-kicker-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 14px #22c55e;
}
.qjs-title{
  font-size:40px;
  font-weight:900;
  letter-spacing:0.18em;
  text-transform:uppercase;
  text-align:center;
  color:white; /* white text */

}

/* Remove gradient if pure white kavali */
.qjs-title span{
  color:white;
  background:none;
}

.qjs-subtitle {
  margin-top: 7px;
  font-size: 13px;
  color: #9ca3ff;
  max-width: 680px;
  text-align:center;
}.qjs-header-pill,
.qjs-header-pill1
{
  position: absolute;
  top: 10PX;
  right: 18px; 
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  background: radial-gradient(circle at left, #22c55e44, transparent);
  border: 1px solid rgba(34,197,94,0.7);
  color: #bbf7d0;
  animation: aiPulse 1.8s infinite ease-in-out;
}

.qjs-header-pill1:hover {
transform: translateY(-4px) scale(1.01);

  background:
  0 0 15px rgba(139,92,246,.3),
  0 0 25px rgba(6,182,212,.25),
  0 10px 25px rgba(0,0,0,0.5);
}
/* tiny neon chip icon */
.qjs-pill-icon {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: radial-gradient(circle at 30% 20%, #4ade80, #22c55e, #16a34a);
  box-shadow: 0 0 10px rgba(34,197,94,0.9);
}

/* cards */
.qjs-card {
 border-radius: 20px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;

  /* 🌌 SUBTLE NEON BG — cyan, indigo, violet */
  background:
    radial-gradient(circle at 25% 20%, rgba(139,92,246,0.15), transparent 40%),  /* violet glow */
    radial-gradient(circle at 70% 80%, rgba(6,182,212,0.12), transparent 45%),   /* cyan glow */
    radial-gradient(circle at 60% 10%, rgba(99,102,241,0.10), transparent 40%),  /* indigo hint */
    linear-gradient(160deg,#040612,#0b0f2a 50%,#040612);

  border: 1px solid rgba(139,92,246,0.20);

  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  box-shadow:
    0 8px 25px rgba(0,0,0,0.5),
    0 0 15px rgba(139,92,246,0.15),
    inset 0 1px 1px rgba(255,255,255,0.05);

  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.qjs-card::before {
  content:"";
  position:absolute;
  inset:-1px;
  border-radius:inherit;
  padding:1.5px;

  background:linear-gradient(
    120deg,
    #0ea5e9,  /* cyan */
    #6366f1,  /* indigo */
    #8b5cf6,  /* violet */
    #0ea5e9
  );

  background-size:300% 300%;
  animation:borderMove 6s linear infinite;

  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;

  opacity:.7; /* subtle border glow */
  pointer-events:none;
}/* ✨ HOVER EFFECT */
.qjs-card:hover {
  transform: translateY(-4px) scale(1.01);

  box-shadow:
    0 0 15px rgba(139,92,246,.3),
    0 0 25px rgba(6,182,212,.25),
    0 10px 25px rgba(0,0,0,0.5);
}

/* 🔁 BORDER ANIMATION */
@keyframes borderMove {
  0% { background-position:0% 50%; }
  50% { background-position:100% 50%; }
  100% { background-position:0% 50%; }
}
.qjs-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 3;
}
  .qjs-card-header-bar {
  margin: -18px -20px 18px;
  padding: 16px 22px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255,255,255,0.12);

  /* ✅ Background FIXED */
  background:
    radial-gradient(circle at 82% 72%, rgba(168,85,247,0.28), transparent 52%),
    linear-gradient(120deg,#020617,#020617,#0b1120,#020617);

  background-size: 600% 600%;
  animation: quantumFlow 12s linear infinite;

  border-top-left-radius: 22px;
  border-top-right-radius: 22px;

  backdrop-filter: blur(14px);

  box-shadow:
    inset 0 1px 22px rgba(56,189,248,0.28),
    inset 0 -1px 12px rgba(139,92,246,0.22),
    0 10px 30px rgba(0,0,0,0.45);
}
    .qjs-card-header-bar::before {
  content: "";
  position: absolute;
  inset: 0;
  padding: 1.5px;
  border-radius: inherit;

  background: linear-gradient(
    120deg,
    #00f0ff,
    #8b5cf6,
    #ff2fd3,
    #00f0ff
  );
  background-size: 400% 400%;
  animation: borderSlide 6s linear infinite;

  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;

  opacity: 0.9;
  pointer-events: none;
}
.qjs-card-header-bar::after {
  content: "";
  position: absolute;
  inset: 0;

  background: linear-gradient(
    120deg,
    transparent 30%,
    rgba(255,255,255,0.25),
    transparent 70%
  );

  animation: lightSweep 4.5s ease-in-out infinite;
  mix-blend-mode: overlay;
  pointer-events: none;
}.qjs-card-header-bar .qjs-card-title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.6px;

  background: linear-gradient(
    90deg,
    #00f0ff,
    #8b5cf6,
    #ff2fd3,
    #00f0ff
  );
  background-size: 200% auto;

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  animation: titleShimmer 6s linear infinite;
}.qjs-card-header-bar .qjs-card-sub {
  font-size: 12px;
  margin-top: 4px;
  color: #bdf3ff;
  opacity: 0.95;

  text-shadow:
    0 0 8px rgba(0,240,255,0.45),
    0 0 14px rgba(139,92,246,0.3);
}
/* 🔁 ANIMATIONS */
@keyframes quantumFlow {
  0% {background-position:0% 50%}
  50% {background-position:100% 50%}
  100% {background-position:0% 50%}
}

@keyframes borderSlide {
  0% {background-position:0% 50%}
  50% {background-position:100% 50%}
  100% {background-position:0% 50%}
}

@keyframes lightSweep {
  0% {transform: translateX(-100%)}
  50% {transform: translateX(100%)}
  100% {transform: translateX(100%)}
}
/* stepper */
.qjs-stepper {
  display: flex;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.qjs-step-pill {
text-align:center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,255,0.6);
  background: rgba(14, 61, 55, 0.8);
  font-size: 11px;
  color: #c7d2fe;
  opacity: 0.7;
}
.qjs-step-pill-active {
  background: linear-gradient(90deg,#4f46e5,#7c3aed);
  border-color: rgba(191,219,254,0.95);
  box-shadow: 0 0 24px rgba(129,140,248,0.9);
  opacity: 1;
}
.qjs-step-index {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: cyan;
}

/* layout */
.qjs-layout {
  display: grid;
  grid-template-columns: minmax(0,1.5fr) minmax(0,1.2fr);
  gap: 18px;
  margin-bottom: 20px;
}
.qjs-right-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* algorithm cards */
.qjs-grid-2 {
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
  gap: 12px;
}
.qjs-algo-card {
 border-radius: 20px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;

  /* 🌌 SUBTLE NEON BG — cyan, indigo, violet */
  background:
    radial-gradient(circle at 25% 20%, rgba(139,92,246,0.15), transparent 40%),  /* violet glow */
    radial-gradient(circle at 70% 80%, rgba(6,182,212,0.12), transparent 45%),   /* cyan glow */
    radial-gradient(circle at 60% 10%, rgba(99,102,241,0.10), transparent 40%),  /* indigo hint */
    linear-gradient(160deg,#040612,#0b0f2a 50%,#040612);

  border: 1px solid rgba(139,92,246,0.20);

  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  box-shadow:
    0 8px 25px rgba(0,0,0,0.5),
    0 0 15px rgba(139,92,246,0.15),
    inset 0 1px 1px rgba(255,255,255,0.05);

  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
  .qjs-algo-card::before {
  content:"";
  position:absolute;
  inset:-1px;
  border-radius:inherit;
  padding:1.5px;
  background-size:300% 300%;
  animation:borderMove 6s linear infinite;

  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
  mask-composite:exclude;

  opacity:.7; /* subtle border glow */
  pointer-events:none;
}
.qjs-algo-card:hover { transform: translateY(-4px) scale(1.01);

  box-shadow:
    0 0 15px rgba(139,92,246,.3),
    0 0 25px rgba(6,182,212,.25),
    0 10px 25px rgba(0,0,0,0.5);
}
  
.qjs-algo-card-active {
  border-color: rgba(3, 26, 10, 0.9);
  box-shadow: 0 0 22px rgba(14, 58, 57, 0.7);
}
.qjs-algo-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;

  background: #5eead4;
   /* soft cyan */

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

  
.qd-algo-title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
}
.qd-algo-title-main {
  font-size: 40px; 
  font-weight: 700;
  letter-spacing: 0.24em;
  white-space: nowrap;
  overflow: hidden;
  animation: typing 2.2s steps(26, end), blink-caret 1.1s step-end infinite;
}
.qd-algo-title-sub {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
  text-align: center; 
   margin-bottom:25px;
}
.qjs-algo-pill {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  
  border: 1px solid rgba(148,163,255,0.7);
  color:cyan;
}

/* mini svg icon placeholder */
.qjs-icon-orb {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #60a5fa, #4f46e5, #7c3aed);
  box-shadow: 0 0 10px rgba(129,140,248,0.9);
}

/* form controls */
.qjs-form-grid {
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  gap: 10px 12px;
  margin-top: 12px;
}
.qjs-field {
  display: flex;
  flex-direction: column;
  font-size: 11px;
}
.qjs-label {
  margin-bottom: 3px;
}
.qjs-input,
.qjs-select,
.qjs-textarea {
  border-radius: 12px;
  border: 1px solid rgba(148,163,255,0.75);
  background: radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(15,23,42,0.96));
  color: #e5e7ff;
  padding: 7px 10px;
  font-size: 12px;
  outline: none;
}
.qjs-textarea {
  min-height: 80px;
  resize: vertical;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
.qjs-input::placeholder,
.qjs-textarea::placeholder {
  color: #64748b;
}
.qjs-input:focus,
.qjs-select:focus,
.qjs-textarea:focus {
  box-shadow: 0 0 0 1px rgba(191,219,254,0.9), 0 0 18px rgba(59,130,246,0.9);
}

/* buttons */
.qjs-btn {
  border-radius: 999px;
  padding: 8px 16px;
  border: none;
  background: linear-gradient(
  120deg,
  #0ea5e9,
  #6366f1,
  #8b5cf6,
  #0ea5e9
);

  color: #f9fafb;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 20px 45px rgba(88,28,135,0.6);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.qjs-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 24px 55px rgba(88,28,135,0.75);
}
.qjs-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}
.qjs-btn-outline {
  border-radius: 999px;
  padding: 7px 14px;
  border: 1px solid rgba(148,163,255,0.8);
  background: rgba(15,23,42,0.92);
  color: #e5e7ff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.qjs-btn-outline:hover {
  background: rgba(30,64,175,0.6);
}

/* footer actions */
.qjs-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  gap: 12px;
}

/* error bar */
.qjs-error {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid rgba(248,113,113,0.9);
  background: rgba(127,29,29,0.3);
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* === CIRCUIT CANVAS ======================================== */

.qjs-circuit-shell {
  display: grid;
  grid-template-columns: 260px minmax(0,1fr);
  gap: 12px;
}

.qjs-side-palette {
  border-radius: 18px;
  border: 1px solid rgba(148,163,255,0.6);
  background: radial-gradient(circle at top, rgba(15,23,42,0.96), rgba(15,23,42,0.98));
  padding: 10px 12px;
  font-size: 11px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qjs-side-palette-title {
  font-size: 12px;
  font-weight: 600;
  color: #e5e7ff;
}

.qjs-palette-group-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.7;
  margin-top: 4px;
}

.qjs-gate-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.qjs-gate-btn {
  border-radius: 999px;
  padding: 4px 8px;
  border: 1px solid rgba(129,140,248,0.8);
  background: rgba(15,23,42,0.95);
  font-size: 11px;
  color: #e5e7ff;
  cursor: grab;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.qjs-gate-btn span.qjs-gate-chip {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #38bdf8, #4f46e5);
}

.qjs-gate-btn:hover {
  background: rgba(37,99,235,0.8);
}

.qjs-top-palette {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 12px;
}
.qjs-top-gates {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* circuit canvas */
.qjs-circuit-card-inner {
  border-radius: 16px;
  border: 1px solid rgba(148,163,255,0.6);
  background: radial-gradient(circle at top left, rgba(37,99,235,0.35), rgba(15,23,42,0.98));
  padding: 8px 10px;
}

.qjs-circuit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  margin-bottom: 6px;
}

.qjs-canvas-scroll {
  overflow: auto;
  max-height: 290px;
  border-radius: 10px;
  background: rgba(15,23,42,0.98);
  border: 1px solid rgba(30,64,175,0.8);
}

.qjs-circuit-table {
  border-collapse: collapse;
  width: max-content;
  min-width: 100%;
}
.qjs-circuit-table td,
.qjs-circuit-table th {
  border: 1px solid rgba(31,41,55,0.9);
  padding: 2px 14px;
  min-width: 52px;
  text-align: center;
  font-size: 11px;
}
.qjs-circuit-qubit {
  color: #9ca3ff;
  font-weight: 500;
  min-width: 42px;
  padding-left: 6px;
  padding-right: 6px;
}
.qjs-circuit-cell {
  position: relative;
}
.qjs-circuit-cell-inner {
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.qjs-circuit-cell-empty {
  color: #4b5563;
}

.qjs-gate-pill {
  border-radius: 8px;
  padding: 2px 6px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  background: radial-gradient(circle at top, rgba(59,130,246,0.4), rgba(15,23,42,0.95));
  border: 1px solid rgba(129,140,248,0.9);
  box-shadow: 0 0 12px rgba(59,130,246,0.9);
}

.qjs-gate-role-control {
  color: #22c55e;
}
.qjs-gate-role-target {
  color: #fb7185;
}

/* selected cell highlight */
.qjs-cell-selected {
  box-shadow: inset 0 0 0 2px rgba(251,191,36,0.9);
}

/* floating palette */
.qjs-floating-palette {
  position: fixed;
  z-index: 40;
  min-width: 190px;
  border-radius: 14px;
  border: 1px solid rgba(148,163,255,0.9);
  background: radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(15,23,42,0.96));
  padding: 8px 10px;
  box-shadow: 0 18px 50px rgba(15,23,42,0.9);
  font-size: 11px;
}

/* param modal */
.qjs-modal-backdrop {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top, rgba(15,23,42,0.9), rgba(15,23,42,0.96));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.qjs-modal-panel {
  width: 320px;
  max-width: 90vw;
  border-radius: 18px;
  border: 1px solid rgba(129,140,248,0.9);
  background: radial-gradient(circle at top left, rgba(37,99,235,0.6), rgba(15,23,42,0.98));
  padding: 16px 18px;
  box-shadow: 0 24px 80px rgba(15,23,42,0.95);
}

.qjs-modal-title {
  font-size: 15px;
  font-weight: 600;
}
.qjs-modal-sub {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 2px;
}
.qjs-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

/* QASM wrapper & highlight */
.qjs-qasm-wrapper {
  border-radius: 16px;
  border: 1px solid rgba(148,163,255,0.5);
  background: radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(2,8,23,0.98));
  padding: 10px 12px;
  font-size: 12px;
}
.qjs-qasm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.qjs-qasm-badge {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 999px;
  border: 1px solid rgba(148,163,255,0.7);
  background: rgba(15,23,42,0.95);
}
.qjs-qasm-scroll {
  max-height: 210px;
  overflow-y: auto;
}
.qjs-qasm-code {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre;
}

/* syntax highlight classes */
.qjs-k-keyword { color: #60a5fa; }
.qjs-k-gate { color: #c4b5fd; }
.qjs-k-number { color: #22c55e; }
.qjs-k-comment { color: #a3e635; }

/* QASM editor textarea */
.qjs-qasm-textarea {
  width: 100%;
  margin-top: 8px;
  border-radius: 10px;
  border: 1px solid rgba(148,163,255,0.7);
  background: rgba(15,23,42,0.96);
  color: #e5e7ff;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  padding: 8px 10px;
  min-height: 90px;
  resize: vertical;
}

/* backend info list */
.qjs-backend-pill {
  border-radius: 12px;
  padding: 6px 8px;
  background: rgba(15,23,42,0.96);
  border: 1px solid rgba(148,163,255,0.5);
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

/* simple inline svg-style status dot */
.qjs-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
}

/* responsive */
@media (max-width: 1100px) {
  .qjs-layout {
    grid-template-columns: 1fr;
  }
  .qjs-circuit-shell {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .qjs-page {
    padding: 22px 18px 30px;
  }
  .qjs-stepper {
    flex-direction: column;
  }
}
  /* ==============================
   PERFECT MOBILE VERSION V2
============================== */

@media (max-width:768px){

/* GLOBAL SAFETY */
*{
  box-sizing:border-box;
}

body{
  overflow-x:hidden;
}

/* PAGE */
.qjs-page{
  padding:12px 10px 18px;
  overflow-x:hidden;
}

/* Reduce heavy glow for performance */
.qjs-page::before,
.qjs-page::after{
  width:180px;
  height:180px;
  filter:blur(40px);
  opacity:.18;
}

/* HEADER */
.qjs-header{
  gap:8px;
  margin-bottom:12px;
  text-align:center;
}

.qjs-title{
  font-size:20px;
  letter-spacing:.06em;
  line-height:1.2;
}

.qjs-title-main{
  font-size:18px;
  letter-spacing:.05em;
  white-space:normal;
  animation:none;
  line-height:1.3;
}

.qjs-subtitle{
  font-size:12px;
  padding:0 4px;
  line-height:1.4;
}

/* Pill center */
.qjs-header-pill{
  position:static;
  margin:6px auto 0;
  font-size:10px;
  padding:6px 10px;
}

/* CARDS */
.qjs-card{
  padding:12px;
  border-radius:12px;
  backdrop-filter:blur(6px);
}

.qjs-card-header-bar{
  padding:10px;
}

.qjs-card-header-bar .qjs-card-title{
  font-size:14px;
}

/* LAYOUT STACK */
.qjs-layout{
  display:flex;
  flex-direction:column;
  gap:10px;
}

/* ALGORITHM GRID */
.qjs-grid-2{
  grid-template-columns:1fr;
  gap:10px;
}

.qjs-algo-card{
  padding:12px;
}

/* STEPPER */
.qjs-stepper{
  flex-direction:column;
  gap:6px;
}

.qjs-step-pill{
  width:100%;
  justify-content:center;
  padding:8px;
  font-size:11px;
}

/* FORM */
.qjs-form-grid{
  grid-template-columns:1fr;
  gap:8px;
}

.qjs-input,
.qjs-select,
.qjs-textarea{
  font-size:14px;
  padding:12px;
  border-radius:10px;
}

/* BUTTONS */
.qjs-btn{
  width:100%;
  justify-content:center;
  padding:13px;
  font-size:14px;
  border-radius:12px;
}

.qjs-btn-outline{
  width:100%;
  justify-content:center;
  padding:12px;
}

/* CIRCUIT */
.qjs-circuit-shell{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.qjs-side-palette{
  order:2;
  padding:10px;
}

/* Better scroll */
.qjs-canvas-scroll{
  max-height:180px;
  overflow:auto;
  -webkit-overflow-scrolling:touch;
}

/* Gate buttons */
.qjs-gate-btn{
  padding:8px 12px;
  font-size:12px;
}

/* MODAL */
.qjs-modal-panel{
  width:95%;
  padding:12px;
  border-radius:12px;
}

/* FOOTER */
.qjs-footer-row{
  flex-direction:column;
  gap:8px;
}

/* Reduce heavy animations */
.qjs-card::before,
.qjs-card-header-bar::before,
.qjs-card-header-bar::after{
  animation:none;
  opacity:.5;
}

}

  
`;

/* =========================================================
   HELPERS & CONSTANTS
========================================================= */

const ALGO_TEMPLATES = [
  {
    key: "bell",
    label: "Bell Pair",
    badge: "Intro",
    description: "2-qubit entangled Bell state with Z-basis measurement.",
    minQubits: 2,
  },
  {
    key: "ghz",
    label: "GHZ State",
    badge: "Entanglement",
    description: "Multi-qubit GHZ state initialized across N qubits.",
    minQubits: 3,
  },
  {
    key: "deutsch",
    label: "Deutsch–Jozsa",
    badge: "Oracle",
    description: "Detect constant vs balanced oracle in one query.",
    minQubits: 3,
  },
  {
    key: "grover",
    label: "Grover Search",
    badge: "Search",
    description: "Single-iteration Grover search on small space.",
    minQubits: 3,
  },
  {
    key: "qft",
    label: "QFT",
    badge: "Fourier",
    description: "Approximate QFT on first few qubits.",
    minQubits: 3,
  },
  {
    key: "custom",
    label: "Custom",
    badge: "Advanced",
    description: "Start from a minimal OpenQASM template and edit freely.",
    minQubits: 1,
  },
];

// Gate definitions for palettes
const TOP_GATES = ["H", "X", "Z", "CX", "MEASURE"];

const ADVANCED_SINGLE_GATES = ["Y", "S", "T", "RX", "RY", "RZ"];
const ADVANCED_MULTI_GATES = ["CZ", "CP", "SWAP", "CCX"];
const PARAM_GATES = ["RZ", "RX", "RY", "U3", "CP"];

const MAX_INITIAL_COLUMNS = 24;

// Build an empty circuit
function createEmptyCircuit(numQubits, numCols) {
  const rows = [];
  for (let q = 0; q < numQubits; q++) {
    const gates = [];
    for (let c = 0; c < numCols; c++) {
      gates.push(null);
    }
    rows.push({ label: `q[${q}]`, gates });
  }
  return {
    numQubits,
    numCols,
    rows,
  };
}

// Generate a simple ID for multi-qubit gate linking
function makeGateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Generate template QASM given algorithm settings
function generateTemplateQasm({ algoKey, numQubits, oracleType }) {
  const n = Math.max(1, Number(numQubits) || 1);

  if (algoKey === "bell") {
    return `OPENQASM 3.0;
include "stdgates.inc";

qubit[2] q;
bit[2] c;

h q[0];
cx q[0], q[1];

c[0] = measure q[0];
c[1] = measure q[1];
`;
  }

  if (algoKey === "ghz") {
    const m = Math.max(3, n);
    const lines = [
      "OPENQASM 3.0;",
      'include "stdgates.inc";',
      "",
      `qubit[${m}] q;`,
      `bit[${m}] c;`,
      "",
      "// GHZ: H on q0, then CNOTs to others",
      "h q[0];",
    ];
    for (let i = 1; i < m; i++) {
      lines.push(`cx q[0], q[${i}];`);
    }
    lines.push("");
    for (let i = 0; i < m; i++) {
      lines.push(`c[${i}] = measure q[${i}];`);
    }
    lines.push("");
    return lines.join("\n");
  }

  if (algoKey === "deutsch") {
    const m = Math.max(3, n);
    const lines = [
      "OPENQASM 3.0;",
      'include "stdgates.inc";',
      "",
      `qubit[${m}] q;`,
      `bit[${m}] c;`,
      "",
      "// Initialize ancilla to |1>",
      `x q[${m - 1}];`,
      "",
      "// Apply Hadamards on all qubits",
    ];
    for (let i = 0; i < m; i++) {
      lines.push(`h q[${i}];`);
    }
    lines.push("");
    lines.push("// Simple oracle on first qubit");
    if (oracleType === "balanced") {
      lines.push(`cx q[0], q[${m - 1}];`);
    } else {
      lines.push("// constant oracle – identity");
    }
    lines.push("");
    lines.push("// Hadamards again on input qubits (except ancilla)");
    for (let i = 0; i < m - 1; i++) {
      lines.push(`h q[${i}];`);
    }
    lines.push("");
    for (let i = 0; i < m - 1; i++) {
      lines.push(`c[${i}] = measure q[${i}];`);
    }
    lines.push("");
    return lines.join("\n");
  }

  if (algoKey === "grover") {
    const m = Math.max(3, n);
    const lines = [
      "OPENQASM 3.0;",
      'include "stdgates.inc";',
      "",
      `qubit[${m}] q;`,
      `bit[${m}] c;`,
      "",
      "// Equal superposition",
    ];
    for (let i = 0; i < m; i++) {
      lines.push(`h q[${i}];`);
    }
    lines.push("");
    lines.push("// Simple phase oracle on last qubit");
    lines.push(`z q[${m - 1}];`);
    lines.push("");
    lines.push("// Diffuser (approx)");
    for (let i = 0; i < m; i++) {
      lines.push(`h q[${i}];`);
      lines.push(`x q[${i}];`);
    }
    lines.push(`h q[${m - 1}];`);
    lines.push(`cx q[0], q[${m - 1}];`);
    lines.push(`h q[${m - 1}];`);
    for (let i = 0; i < m; i++) {
      lines.push(`x q[${i}];`);
      lines.push(`h q[${i}];`);
    }
    lines.push("");
    for (let i = 0; i < m; i++) {
      lines.push(`c[${i}] = measure q[${i}];`);
    }
    lines.push("");
    return lines.join("\n");
  }

  if (algoKey === "qft") {
    const m = Math.max(3, n);
    const lines = [
      "OPENQASM 3.0;",
      'include "stdgates.inc";',
      "",
      `qubit[${m}] q;`,
      `bit[${m}] c;`,
      "",
      "// Approximate QFT on first 3 qubits",
    ];
    const max = Math.min(3, m);
    if (max >= 1) {
      lines.push("h q[0];");
      if (max >= 2) lines.push("cp(pi/2) q[1], q[0];");
      if (max >= 3) lines.push("cp(pi/4) q[2], q[0];");
    }
    if (max >= 2) {
      lines.push("h q[1];");
      if (max >= 3) lines.push("cp(pi/2) q[2], q[1];");
    }
    if (max >= 3) {
      lines.push("h q[2];");
    }
    lines.push("");
    for (let i = 0; i < max; i++) {
      lines.push(`c[${i}] = measure q[${i}];`);
    }
    lines.push("");
    return lines.join("\n");
  }

  // custom
  return `OPENQASM 3.0;
include "stdgates.inc";

qubit[${n}] q;
bit[${n}] c;

// Example: Hadamard on first qubit
h q[0];

// Example: measure all
c[0] = measure q[0];
`;
}

// Infer qubit count from QASM
function inferQubitCountFromQasm(qasm) {
  const match = qasm.match(/qubit\[(\d+)\]\s+q\s*;/i);
  if (match) return Number(match[1]) || 0;
  return 0;
}

// Build circuit structure from QASM (simple parser)
function parseQasmToCircuit(qasm) {
  const qubitMatch = qasm.match(/qubit\[(\d+)\]\s+q\s*;/i);
  const numQubits = qubitMatch ? Number(qubitMatch[1]) || 0 : 0;
  if (!numQubits) {
    return createEmptyCircuit(2, MAX_INITIAL_COLUMNS);
  }

  const lines = qasm
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//"));

  // Estimate columns ~ number of gate lines
  const gateLines = lines.filter((l) => /;$/g.test(l));
  const numCols = Math.max(MAX_INITIAL_COLUMNS, gateLines.length + 4);

  const circuit = createEmptyCircuit(numQubits, numCols);

  let col = 0;

  const gateRegex =
    /^(h|x|y|z|rx|ry|rz|cx|cz|cp|u3|swap|ccx|measure)\s*(\(([^)]*)\))?\s+q\[(\d+)\](?:\s*,\s*q\[(\d+)\])?/i;

  for (const line of lines) {
    const m = line.match(gateRegex);
    if (!m) continue;
    let gateType = m[1].toUpperCase();
    const paramStr = m[3] || "";
    const q1 = Number(m[4]);
    const q2 = m[5] !== undefined ? Number(m[5]) : null;

    if (col >= circuit.numCols) {
      // expand columns
      circuit.rows.forEach((r) => r.gates.push(null));
      circuit.numCols += 1;
    }

    if (gateType === "MEASURE") {
      // treat measure as cell gate
      if (q1 < numQubits) {
        circuit.rows[q1].gates[col] = {
          id: makeGateId(),
          type: "MEASURE",
        };
      }
      col += 1;
      continue;
    }

    if (q2 == null) {
      // single-qubit gate
      if (q1 < numQubits) {
        const gate = {
          id: makeGateId(),
          type: gateType,
        };
        if (gateType === "RZ" || gateType === "RX" || gateType === "RY") {
          gate.params = {
            theta: paramStr || "pi/2",
          };
        }
        if (gateType === "U3") {
          const parts = paramStr.split(",").map((s) => s.trim());
          gate.params = {
            phi: parts[0] || "0",
            theta: parts[1] || "pi/2",
            lambda: parts[2] || "0",
          };
        }
        circuit.rows[q1].gates[col] = gate;
      }
      col += 1;
    } else {
      // multi-qubit gate
      if (q1 < numQubits && q2 < numQubits) {
        const id = makeGateId();
        const paramObj = {};
        if (gateType === "CP") {
          paramObj.theta = paramStr || "pi/2";
        }
        const control = q1;
        const target = q2;
        const gateControl = {
          id,
          type: gateType,
          role: "control",
          otherQubit: target,
          params: Object.keys(paramObj).length ? paramObj : undefined,
        };
        const gateTarget = {
          id,
          type: gateType,
          role: "target",
          otherQubit: control,
          params: Object.keys(paramObj).length ? paramObj : undefined,
        };
        circuit.rows[control].gates[col] = gateControl;
        circuit.rows[target].gates[col] = gateTarget;
      }
      col += 1;
    }
  }

  return circuit;
}

// Generate QASM from circuit structure
function generateQasmFromCircuit(circuit) {
  const n = circuit.numQubits;
  const lines = [
    "OPENQASM 3.0;",
    'include "stdgates.inc";',
    "",
    `qubit[${n}] q;`,
    `bit[${n}] c;`,
    "",
  ];

  const visited = new Set();

  for (let c = 0; c < circuit.numCols; c++) {
    for (let q = 0; q < circuit.numQubits; q++) {
      const cell = circuit.rows[q].gates[c];
      if (!cell) continue;

      if (cell.type === "MEASURE") {
        lines.push(`c[${q}] = measure q[${q}];`);
        continue;
      }

      if (cell.role === "target") {
        // only emit from control row
        continue;
      }

      if (visited.has(cell.id)) continue;
      visited.add(cell.id);

      const gateType = cell.type;
      if (!gateType) continue;

      // single-qubit
      if (!cell.role || cell.role === "single") {
        const qb = q;
        if (gateType === "RZ" || gateType === "RX" || gateType === "RY") {
          const theta = cell.params?.theta || "pi/2";
          lines.push(`${gateType.toLowerCase()}(${theta}) q[${qb}];`);
        } else if (gateType === "U3") {
          const p = cell.params || {};
          lines.push(
            `u3(${p.phi || "0"}, ${p.theta || "pi/2"}, ${
              p.lambda || "0"
            }) q[${qb}];`
          );
        } else {
          lines.push(`${gateType.toLowerCase()} q[${qb}];`);
        }
        continue;
      }

      // multi-qubit
      if (cell.role === "control") {
        const control = q;
        const target = cell.otherQubit;
        if (target == null) continue;
        if (gateType === "CP") {
          const theta = cell.params?.theta || "pi/2";
          lines.push(
            `cp(${theta}) q[${control}], q[${target}];`
          );
        } else {
          lines.push(
            `${gateType.toLowerCase()} q[${control}], q[${target}];`
          );
        }
      }
    }
  }

  // If no measurement in circuit, add final measure all for safety
  const hasMeasure = lines.some((l) => l.toLowerCase().includes("measure"));
  if (!hasMeasure) {
    lines.push("");
    lines.push("// Auto-measure all qubits for sampler");
    for (let q = 0; q < n; q++) {
      lines.push(`c[${q}] = measure q[${q}];`);
    }
  }

  lines.push("");
  return lines.join("\n");
}

// Simple syntax highlighter → returns HTML string
function syntaxHighlightQasm(qasm) {
  if (!qasm) return "";

  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const keywordRegex = /\b(OPENQASM|include|qubit|bit|measure)\b/g;
  const gateRegex =
    /\b(h|x|y|z|rx|ry|rz|cx|cz|cp|u3|swap|ccx)\b/gi;
  const numberRegex = /\b(\d+(\.\d+)?|pi|π)\b/g;

  const lines = qasm.split("\n");
  const outLines = [];

  for (let line of lines) {
    let escaped = escapeHtml(line);

    // comments
    const commentMatch = escaped.match(/(\/\/.*)$/);
    let commentPart = "";
    if (commentMatch) {
      commentPart = commentMatch[1];
      escaped = escaped.slice(0, escaped.length - commentPart.length);
    }

    escaped = escaped.replace(keywordRegex, (m) => {
      return `<span class="qjs-k-keyword">${m}</span>`;
    });

    escaped = escaped.replace(gateRegex, (m) => {
      return `<span class="qjs-k-gate">${m}</span>`;
    });

    escaped = escaped.replace(numberRegex, (m) => {
      return `<span class="qjs-k-number">${m}</span>`;
    });

    if (commentPart) {
      escaped += ` <span class="qjs-k-comment">${commentPart}</span>`;
    }

    outLines.push(escaped);
  }

  return outLines.join("\n");
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function JobSubmission() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Step 1: algorithm-level choices
  const [algoKey, setAlgoKey] = useState("bell");
  const [numQubits, setNumQubits] = useState(2);
  const [oracleType, setOracleType] = useState("balanced");
  const [jobName, setJobName] = useState("");
  const [notes, setNotes] = useState("");

  // Circuit builder (step 2)
  const [circuit, setCircuit] = useState(() =>
    createEmptyCircuit(2, MAX_INITIAL_COLUMNS)
  );
  const [qasmText, setQasmText] = useState("");
  const [circuitDirtyFromEditor, setCircuitDirtyFromEditor] = useState(false);

  const [selectedCell, setSelectedCell] = useState(null); // {row, col}
  const [floatingPalette, setFloatingPalette] = useState(null); // {x,y, visible}

  // Parameter modal
  const [paramModal, setParamModal] = useState(null); // {type, row, col, role?, otherQubit?, params?}
  const [paramTheta, setParamTheta] = useState("pi/2");
  const [paramPhi, setParamPhi] = useState("0");
  const [paramLambda, setParamLambda] = useState("0");

  // Multi-qubit gate config modal (if needed)
  const [multiModal, setMultiModal] = useState(null); // {type, row, col, control, target, theta?}

  // Step 3: execution & backend
  const [backends, setBackends] = useState([]);
  const [backendLoading, setBackendLoading] = useState(false);
  const [selectedBackend, setSelectedBackend] = useState("");
  const [shots, setShots] = useState(1024);
  const [circuitType, setCircuitType] = useState("sampler");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // New state to hold backend-specific error
  const [backendError, setBackendError] = useState(""); 

  // highlight preview
  const highlightedQasm = useMemo(
    () => ({ __html: syntaxHighlightQasm(qasmText) }),
    [qasmText]
  );

  // Load backends
  useEffect(() => {
    let mounted = true;
    async function loadBackends() {
      try {
        setBackendLoading(true);
        setBackendError(""); // Clear any previous backend error
        const list = await fetchBackends();
        if (!mounted) return;

        const formatted = Array.isArray(list)
          ? list.map((d) => ({
              name: d.name || d.device_name,
              status: d.operational ? "online" : "offline",
              reason: d.status?.reason || "",
              qubits: d.num_qubits ?? d.qubits ?? 0,
              queue_length: d.queue_length ?? d.queue ?? 0,
              clops: d.clops?.value ?? d.clops ?? null,
              raw: d,
            }))
          : [];

        setBackends(formatted);
        
        // Only set selectedBackend if we have options AND nothing is selected yet
        if (formatted.length && !selectedBackend) {
          setSelectedBackend(formatted[0].name);
        } else if (!formatted.length) {
          // If no backends are returned, ensure selectedBackend is cleared
          setSelectedBackend("");
        }

      } catch (err) {
        console.error("Failed to load backends", err);
        if (mounted) {
          const errMsg = "Failed to load IBM backends. Check API key/instance configuration.";
          setBackendError(errMsg);
          setError(errMsg); // Also set global error for visibility
          setBackends([]);
          setSelectedBackend("");
        }
      } finally {
        if (mounted) setBackendLoading(false);
      }
    }
    // Dependency list changed to include selectedBackend to re-run if it changes (e.g., cleared)
    loadBackends();
    return () => {
      mounted = false;
    };
  }, []); // Note: Removed selectedBackend from dependency list to prevent infinite loop. It's safe since initial load is primary concern.


  const currentAlgo = useMemo(
    () => ALGO_TEMPLATES.find((a) => a.key === algoKey),
    [algoKey]
  );

  // Initialize from algorithm on mount
  useEffect(() => {
    const initialQasm = generateTemplateQasm({
      algoKey,
      numQubits,
      oracleType,
    });
    setQasmText(initialQasm);
    const parsed = parseQasmToCircuit(initialQasm);
    setCircuit(parsed);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Regenerate from algorithm (button)
  const regenerateFromAlgo = useCallback(() => {
    const mQubits = Math.max(
      currentAlgo?.minQubits || 1,
      Number(numQubits) || 1
    );
    const qasm = generateTemplateQasm({
      algoKey,
      numQubits: mQubits,
      oracleType,
    });
    setQasmText(qasm);
    const parsed = parseQasmToCircuit(qasm);
    setCircuit(parsed);
    setCircuitDirtyFromEditor(false);
  }, [algoKey, currentAlgo, numQubits, oracleType]);

  // When numQubits changes, expand/shrink circuit
  useEffect(() => {
    setCircuit((prev) => {
      let n = Math.max(1, Number(numQubits) || 1);
      // keep at least min qubits for selected algo
      const min = currentAlgo?.minQubits || 1;
      if (n < min) n = min;

      if (!prev || !prev.rows) return createEmptyCircuit(n, MAX_INITIAL_COLUMNS);

      let rows = prev.rows;

      if (n > prev.numQubits) {
        // add rows
        for (let q = prev.numQubits; q < n; q++) {
          const gates = [];
          for (let c = 0; c < prev.numCols; c++) {
            gates.push(null);
          }
          rows.push({ label: `q[${q}]`, gates });
        }
      } else if (n < prev.numQubits) {
        rows = prev.rows.slice(0, n);
      }

      const updated = {
        ...prev,
        numQubits: n,
        rows,
      };

      const newQasm = generateQasmFromCircuit(updated);
      setQasmText(newQasm);

      return updated;
    });
  }, [numQubits, currentAlgo]);

  // Sync QASM when circuit changes (but not when we just applied from editor)
  const circuitRef = useRef(circuit);
  useEffect(() => {
    circuitRef.current = circuit;
  }, [circuit]);

  const updateCircuitAndQasm = useCallback((nextCircuit) => {
    setCircuit(nextCircuit);
    const q = generateQasmFromCircuit(nextCircuit);
    setQasmText(q);
    setCircuitDirtyFromEditor(false);
  }, []);

  /* =========================================================
     DRAG & DROP + GATE INSERTION
  ========================================================== */

  const handleGateDragStart = (gateType) => (e) => {
    e.dataTransfer.setData("gateType", gateType);
  };

  const handleCellDragOver = (e) => {
    e.preventDefault();
  };

  const openParamModalForGate = (type, row, col, extra = {}) => {
    // set defaults
    if (type === "RZ" || type === "RX" || type === "RY" || type === "CP") {
      setParamTheta(extra.theta || "pi/2");
    } else if (type === "U3") {
      setParamPhi(extra.phi || "0");
      setParamTheta(extra.theta || "pi/2");
      setParamLambda(extra.lambda || "0");
    }
    setParamModal({
      type,
      row,
      col,
      ...extra,
    });
  };

  const handlePlaceSingleGate = (type, rowIdx, colIdx, params) => {
    setCircuit((prev) => {
      const next = {
        ...prev,
        rows: prev.rows.map((r, ri) => ({
          ...r,
          gates: r.gates.slice(),
        })),
      };
      const row = next.rows[rowIdx];
      const gate = {
        id: makeGateId(),
        type,
        role: "single",
      };
      if (params && Object.keys(params).length) {
        gate.params = params;
      }
      row.gates[colIdx] = gate;
      return next;
    });
  };

  const handlePlaceMultiGate = ({
    type,
    control,
    target,
    colIdx,
    theta,
  }) => {
    setCircuit((prev) => {
      const next = {
        ...prev,
        rows: prev.rows.map((r) => ({
          ...r,
          gates: r.gates.slice(),
        })),
      };
      if (
        control < 0 ||
        control >= next.numQubits ||
        target < 0 ||
        target >= next.numQubits
      ) {
        return prev;
      }
      const id = makeGateId();
      const params = {};
      if (type === "CP") {
        params.theta = theta || "pi/2";
      }
      next.rows[control].gates[colIdx] = {
        id,
        type,
        role: "control",
        otherQubit: target,
        params: Object.keys(params).length ? params : undefined,
      };
      next.rows[target].gates[colIdx] = {
        id,
        type,
        role: "target",
        otherQubit: control,
        params: Object.keys(params).length ? params : undefined,
      };
      return next;
    });
  };

  const handleCellDrop = (rowIdx, colIdx) => (e) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData("gateType");
    if (!gateType) return;

    setError("");

    if (gateType === "MEASURE") {
      setCircuit((prev) => {
        const next = {
          ...prev,
          rows: prev.rows.map((r) => ({
            ...r,
            gates: r.gates.slice(),
          })),
        };
        next.rows[rowIdx].gates[colIdx] = {
          id: makeGateId(),
          type: "MEASURE",
        };
        return next;
      });
      return;
    }

    if (["RZ", "RX", "RY", "U3"].includes(gateType)) {
      openParamModalForGate(gateType, rowIdx, colIdx);
      return;
    }

    if (["CP", "CX", "CZ", "SWAP", "CCX"].includes(gateType)) {
      // open multi-qubit gate configuration
      setMultiModal({
        type: gateType,
        row: rowIdx,
        col: colIdx,
        control: rowIdx,
        target:
          rowIdx + 1 < circuitRef.current.numQubits
            ? rowIdx + 1
            : Math.max(0, rowIdx - 1),
        theta: "pi/2",
      });
      return;
    }

    // normal single-qubit gate
    handlePlaceSingleGate(gateType, rowIdx, colIdx);
  };

  const handleCellClick = (rowIdx, colIdx) => (e) => {
    setSelectedCell({ row: rowIdx, col: colIdx });
  };

  const handleCellContextMenu = (rowIdx, colIdx) => (e) => {
    e.preventDefault();
    setSelectedCell({ row: rowIdx, col: colIdx });
    setFloatingPalette({
      x: e.clientX + 8,
      y: e.clientY + 8,
    });
  };

  // Floating palette keyboard shortcut: Shift+G
  useEffect(() => {
    const onKey = (e) => {
      if (e.shiftKey && (e.key === "g" || e.key === "G")) {
        if (selectedCell) {
          setFloatingPalette({
            x: window.innerWidth / 2 - 120,
            y: 140,
          });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedCell]);

  const handleFloatingGateClick = (type) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    if (["RZ", "RX", "RY", "U3"].includes(type)) {
      openParamModalForGate(type, row, col);
      setFloatingPalette(null);
      return;
    }
    if (["CP", "CX", "CZ", "SWAP", "CCX"].includes(type)) {
      setMultiModal({
        type,
        row,
        col,
        control: row,
        target:
          row + 1 < circuitRef.current.numQubits
            ? row + 1
            : Math.max(0, row - 1),
        theta: "pi/2",
      });
      setFloatingPalette(null);
      return;
    }
    // simple single
    handlePlaceSingleGate(type, row, col);
    setFloatingPalette(null);
  };

  const handleDeleteGateAtCell = (rowIdx, colIdx) => {
    setCircuit((prev) => {
      const next = {
        ...prev,
        rows: prev.rows.map((r) => ({
          ...r,
          gates: r.gates.slice(),
        })),
      };
      const cell = next.rows[rowIdx].gates[colIdx];
      if (!cell) return prev;

      // for multi-qubit gates, clear both
      if (cell.role === "control" || cell.role === "target") {
        const otherRow = cell.otherQubit;
        if (
          otherRow != null &&
          otherRow >= 0 &&
          otherRow < next.numQubits
        ) {
          next.rows[otherRow].gates[colIdx] = null;
        }
      }
      next.rows[rowIdx].gates[colIdx] = null;
      return next;
    });
  };

  /* =========================================================
     PARAM / MULTI MODALS APPLY
  ========================================================== */

  const handleParamModalSave = () => {
    if (!paramModal) return;
    const { type, row, col } = paramModal;

    const params = {};
    if (type === "RZ" || type === "RX" || type === "RY" || type === "CP") {
      params.theta = paramTheta || "pi/2";
    }
    if (type === "U3") {
      params.phi = paramPhi || "0";
      params.theta = paramTheta || "pi/2";
      params.lambda = paramLambda || "0";
    }

    if (type === "CP") {
      // need both control & target: if multiModal open, we handle there instead
      setParamModal(null);
      return;
    }

    handlePlaceSingleGate(type, row, col, params);
    setParamModal(null);
  };

  const handleMultiModalSave = () => {
    if (!multiModal) return;
    const { type, control, target, col, theta } = multiModal;
    if (control === target) {
      setError("Control and target must be different qubits.");
      return;
    }
    handlePlaceMultiGate({
      type,
      control,
      target,
      colIdx: col,
      theta,
    });
    setMultiModal(null);
  };

  /* =========================================================
     QASM EDITOR → CIRCUIT APPLY
  ========================================================== */

  const handleApplyQasmToCircuit = () => {
    try {
      const parsed = parseQasmToCircuit(qasmText);
      setCircuit(parsed);
      setCircuitDirtyFromEditor(false);
      setError("");
    } catch (err) {
      console.error("QASM parse error", err);
      setError(
        "Unable to parse QASM into circuit grid. Check syntax or use simple gates only."
      );
    }
  };

  /* =========================================================
     STEPPER NAVIGATION
  ========================================================== */

  const canGoNextFromStep1 = !!qasmText?.trim();

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (!canGoNextFromStep1) {
        setError("Please generate or use a valid QASM circuit first.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // small preflight validation
      if (!qasmText.trim()) {
        setError("Circuit is empty. Please add gates or regenerate.");
        return;
      }
      if (!qasmText.toLowerCase().includes("openqasm")) {
        setError('QASM must start with an "OPENQASM 3.0" header.');
        return;
      }
      // Clear general error if it was a backend error previously
      if (backendError) {
        setError("");
      }
      setStep(3);
    }
  };

  const handlePrev = () => {
    setError("");
    // If going back from Step 3, clear the specific backend error
    if (step === 3 && backendError) {
      setError("");
    }
    setStep((s) => Math.max(1, s - 1));
  };

  /* =========================================================
     JOB SUBMISSION (STEP 3)
  ========================================================== */

  const selectedBackendObj = useMemo(
    () => backends.find((b) => b.name === selectedBackend),
    [backends, selectedBackend]
  );

  const handleSubmitJob = async () => {
    setError("");
    setBackendError(""); // Clear before submission attempt

    if (!selectedBackend) {
      const errMsg = "Please choose a backend. Backend list might be empty if the API key/instance is misconfigured.";
      setError(errMsg);
      setBackendError(errMsg);
      return;
    }
    if (!qasmText.trim()) {
      setError("QASM program is empty.");
      return;
    }
    if (!qasmText.toLowerCase().includes("openqasm")) {
      setError('QASM must start with an "OPENQASM 3.0" header.');
      return;
    }

    // basic qubit vs backend check
    const inferred = inferQubitCountFromQasm(qasmText);
    if (
      selectedBackendObj &&
      inferred > 0 &&
      inferred > (selectedBackendObj.qubits || 0)
    ) {
      setError(
        `Circuit uses ${inferred} qubits but backend ${selectedBackendObj.name} only has ${selectedBackendObj.qubits}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const fallbackName =
        jobName || `${currentAlgo?.label || "Quantum Job"} on ${selectedBackend}`;

      const payload = {
        name: fallbackName,
        backend: selectedBackend,
        circuitType,
        shots: Number(shots) || 1024,
        rawQASM: qasmText,
        notes:
          notes ||
          `Algo=${currentAlgo?.label || algoKey}, qubits=${
            inferQubitCountFromQasm(qasmText) || circuit.numQubits
          }`,
      };

      // 1. Create Job in internal database
      const created = await createJob(payload);
      const jobId = created?._id;
      if (!jobId) {
        throw new Error("Job created but no internal ID was returned.");
      }

      // 2. Submit Job to IBM
      await submitJobToIbm(jobId);

      navigate(`/hiring/job/${jobId}`);
    } catch (err) {
      console.error("Job submission failed", err);
      setError(
        err?.message ||
          "Failed to submit job. Check backend logs for IBM Runtime details."
      );
      setBackendError(
        err?.message ||
          "Failed to submit job. Check backend logs for IBM Runtime details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     RENDER HELPERS
  ========================================================== */

  const renderGateLabel = (gate) => {
    if (!gate) return null;
    if (gate.type === "MEASURE") return "M";
    if (gate.type === "CX") {
      if (gate.role === "control") return "● CX";
      if (gate.role === "target") return "⊕";
      return "CX";
    }
    if (gate.type === "CZ") {
      if (gate.role === "control") return "● CZ";
      if (gate.role === "target") return "◎";
      return "CZ";
    }
    if (gate.type === "CP") {
      if (gate.role === "control")
        return `● CP(${gate.params?.theta || "θ"})`;
      if (gate.role === "target") return "ϕ";
      return `CP`;
    }
    if (["RZ", "RX", "RY"].includes(gate.type)) {
      return `${gate.type}(${gate.params?.theta || "θ"})`;
    }
    if (gate.type === "U3") {
      const p = gate.params || {};
      return `U3(${p.phi || "φ"}, ${p.theta || "θ"}, ${
        p.lambda || "λ"
      })`;
    }
    return gate.type;
  };

  const linesOfQasm = useMemo(
    () =>
      qasmText
        ? qasmText
            .split("\n")
            .filter((l) => l.trim() && !l.trim().startsWith("//")).length
        : 0,
    [qasmText]
  );

  const gateColumns = useMemo(() => {
    if (!circuit.rows.length) return 0;
    return circuit.rows[0].gates.length;
  }, [circuit]);

  const inferredQubits = useMemo(
    () => inferQubitCountFromQasm(qasmText) || circuit.numQubits,
    [qasmText, circuit.numQubits]
  );

  const hasFloatingPalette = !!floatingPalette;

  /* =========================================================
     JSX
  ========================================================== */

  return (
    <div className="qjs-page">
      <style>{styles}</style>
      <div className="qjs-grid-bg" />
      <div className="qjs-inner">
        {/* HEADER */}
        <motion.div
          className="qjs-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="qjs-header-main">
            
            <div className="qjs-title">
              <span>JOB SUBMISSION PLATFORM</span>
            </div>
            <div className="qjs-subtitle">
"Design, review, submit safely."  </div>
          </div>
          
        </motion.div>

        {/* STEPPER */}
        <motion.div
          className="qjs-stepper"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className={
              "qjs-step-pill " + (step === 1 ? "qjs-step-pill-active" : "")
            }
          >
            <span className="qjs-step-index">1</span>
            <span>Algorithm & Inputs</span>
          </div>
          <div
            className={
              "qjs-step-pill " + (step === 2 ? "qjs-step-pill-active" : "")
            }
          >
            <span className="qjs-step-index">2</span>
            <span>Circuit Designer & QASM</span>
          </div>
          <div
            className={
              "qjs-step-pill " + (step === 3 ? "qjs-step-pill-active" : "")
            }
          >
            <span className="qjs-step-index">3</span>
            <span>Execution & Submit</span>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="qjs-layout"
            >
              {/* LEFT: Algorithm picker */}
              <div className="qjs-card">
                <div>
                      <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" /> Choose Quantum Algorithm
                      </div>
                       
                      <div className="qjs-card-sub">
                        Select a high-level template. The System will generate an IBM- friendly OpenQASM program which you can refine later.
                        
                      </div>
                    
                      
                    </div>
                  
                  <button
                    type="button"
                    className="qjs-btn-outline"
                    onClick={regenerateFromAlgo}
                  >
                    Regenerate from template
                  </button>
                </div>

                <div className="qjs-grid-2">
                  {ALGO_TEMPLATES.map((algo) => (
                    <button
                      key={algo.key}
                      type="button"
                      onClick={() => {
                        setAlgoKey(algo.key);
                        if (numQubits < algo.minQubits) {
                          setNumQubits(algo.minQubits);
                        }
                        const qasm = generateTemplateQasm({
                          algoKey: algo.key,
                          numQubits:
                            numQubits < algo.minQubits
                              ? algo.minQubits
                              : numQubits,
                          oracleType,
                        });
                        setQasmText(qasm);
                        const parsed = parseQasmToCircuit(qasm);
                        setCircuit(parsed);
                        setCircuitDirtyFromEditor(false);
                      }}
                      className={
                        "qjs-algo-card " +
                        (algoKey === algo.key ? "qjs-algo-card-active" : "")
                      }
                    >
                      <div className="qjs-algo-title">
                        <span className="qjs-icon-orb" />
                        {algo.label}
                        
                        <span className="qjs-algo-pill">{algo.badge}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#c7d2fe",
                          marginTop: 4,
                          
                        }}
                      >
                        {algo.description}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 4,
                          opacity: 0.8,
                          color:"#f97373",
                        }}
                      >
                        min qubits: {algo.minQubits}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="qjs-form-grid">
                  <div className="qjs-field">
                    <label className="qjs-label">Number of qubits</label>
                    <input
                      className="qjs-input"
                      type="number"
                      min={1}
                      max={32}
                      value={numQubits}
                      onChange={(e) =>
                        setNumQubits(
                          Math.max(
                            1,
                            Math.min(32, Number(e.target.value) || 1)
                          )
                        )
                      }
                    />
                  </div>

                  <div className="qjs-field">
                    <label className="qjs-label">
                      Oracle type (Deutsch–Jozsa)
                    </label>
                    <select
                      className="qjs-select"
                      value={oracleType}
                      onChange={(e) => setOracleType(e.target.value)}
                    >
                      <option value="balanced">Balanced</option>
                      <option value="constant">Constant</option>
                    </select>
                  </div>

                  <div className="qjs-field">
                    <label className="qjs-label">Suggested job name</label>
                    <input
                      className="qjs-input"
                      placeholder="GHZ on ibm_fez, 5 qubits…"
                      value={jobName}
                      onChange={(e) => setJobName(e.target.value)}
                    />
                  </div>

                  <div className="qjs-field">
                    <label className="qjs-label">Quick notes (optional)</label>
                    <input
                      className="qjs-input"
                      placeholder="Experiment notes / tags"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: Circuit skeleton + QASM snapshot */}
              <div className="qjs-right-stack">
                <div className="qjs-card">
                  <div className="qjs-card-header">
                    <div>
                      <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" /> Skeleton Circuit
                        Preview
                      </div>
                        <div className="qjs-header-pill">
            <div className="qjs-pill-icon" />
            Runtime-safe
          </div>
                      <div className="qjs-card-sub">
                        Lightweight gate grid reconstructed from the current
                        template. Great for sanity-checking your algorithm
                        layout.
                        
                      </div>
                    
                      
                    </div>
                    
                  </div>
                  
                  </div>
                  <div className="qjs-circuit-card-inner">
                    <div className="qjs-circuit-header">
                      <span>
                        Qubits inferred:{" "}
                        <strong>{inferredQubits || circuit.numQubits}</strong>
                      </span>
                      <span style={{ fontSize: 11, opacity: 0.8 }}>
                        Columns: {gateColumns}
                      </span>
                    </div>
                    <div className="qjs-canvas-scroll">
                      <table className="qjs-circuit-table">
                        <tbody>
                          {circuit.rows.map((row, rIdx) => (
                            <tr key={row.label}>
                              <td className="qjs-circuit-qubit">
                                {row.label}
                              </td>
                              {row.gates.map((g, cIdx) => (
                                <td key={cIdx}>
                                  {g ? (
                                    <div className="qjs-gate-pill">
                                      {renderGateLabel(g)}
                                    </div>
                                  ) : (
                                    <span className="qjs-circuit-cell-empty">
                                      ·
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="qjs-card">
                  <div className="qjs-card-header">
                    <div>
                      <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" /> Generated QASM Snapshot
                      </div>
                        
                      <div className="qjs-card-sub">
                       This is the OpenQASM 3.0 code that will be sent to IBM Quantum, which you can review and refine in next step. </div>
                    
                      
                    </div>
                    </div>
                  </div>
                  <div className="qjs-qasm-wrapper">
                    <div className="qjs-qasm-header">
                      <span className="qjs-qasm-badge">
                        OPENQASM 3.0 • auto-generated
                      </span>
                      <span style={{ fontSize: 11, opacity: 0.85 }}>
                        ~ {linesOfQasm} effective lines
                      </span>
                    </div>
                    <div
                      className="qjs-qasm-scroll qjs-qasm-code"
                      dangerouslySetInnerHTML={highlightedQasm}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="qjs-layout"
            >
              {/* LEFT: Circuit designer */}
              <div className="qjs-card">
                <div className="qjs-card-header">
                  <div>
                   <div>
                      <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" /> Drag and Drop Circuit Designer
                      </div>
                        
                      <div className="qjs-card-sub">
                       Build your quantum circuit visually by dragging gates onto the timeline; right-click any cell or press Shift+G to open the floating gate palette for quick access  </div>
                       
           
                    <button
                    type="button"
                    className="qjs-header-pill1"
                    onClick={regenerateFromAlgo}
                  >
                    Reset from algorithm
                  </button>
                 
          
                      
                    </div>
                    </div>
                  </div>
                  
                </div>

                <div className="qjs-circuit-shell">
                  {/* SIDE PALETTE */}
                  <div className="qjs-side-palette">
                    <div className="qjs-side-pallette-title">
                      Advanced Gate Palette
                    </div>
                    <div className="qjs-card-sub">
                      Drag any gate onto a cell. Parameterized gates will ask
                      for angles.
                    </div>

                    <div className="qjs-palette-group-label">
                      Core single-qubit
                    </div>
                    <div className="qjs-gate-row">
                      {ADVANCED_SINGLE_GATES.map((g) => (
                        <button
                          key={g}
                          className="qjs-gate-btn"
                          draggable
                          onDragStart={handleGateDragStart(g)}
                        >
                          <span className="qjs-gate-chip" />
                          {g}
                        </button>
                      ))}
                    </div>

                    <div className="qjs-palette-group-label">
                      Multi-qubit
                    </div>
                    <div className="qjs-gate-row">
                      {ADVANCED_MULTI_GATES.map((g) => (
                        <button
                          key={g}
                          className="qjs-gate-btn"
                          draggable
                          onDragStart={handleGateDragStart(g)}
                        >
                          <span className="qjs-gate-chip" />
                          {g}
                        </button>
                      ))}
                    </div>

                    <div className="qjs-palette-group-label">
                      Measurements
                    </div>
                    <div className="qjs-gate-row">
                      <button
                        className="qjs-gate-btn"
                        draggable
                        onDragStart={handleGateDragStart("MEASURE")}
                      >
                        <span className="qjs-gate-chip" />
                        MEASURE
                      </button>
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        opacity: 0.75,
                        marginTop: 8,
                      }}
                    >
                      Tip: Use the{" "}
                      <strong>top palette</strong> for quick gates, and this
                      advanced list for parameter / multi-qubit operations.
                    </div>
                  </div>

                  {/* CANVAS */}
                  <div className="qjs-circuit-card-inner">
                    <div className="qjs-top-palette">
                      <div style={{ fontSize: 11, opacity: 0.85 }}>
                        Top Palette – core gates
                      </div>
                      <div className="qjs-top-gates">
                        {TOP_GATES.map((g) => (
                          <button
                            key={g}
                            className="qjs-gate-btn"
                            draggable
                            onDragStart={handleGateDragStart(g)}
                          >
                            <span className="qjs-gate-chip" />
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="qjs-circuit-header">
                      <span style={{ fontSize: 11 }}>
                        Qubits:{" "}
                        <strong>{circuit.numQubits}</strong> • Columns:{" "}
                        <strong>{circuit.numCols}</strong>
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          opacity: 0.8,
                        }}
                      >
                        Right-click cell for floating gate palette
                      </span>
                    </div>

                    <div className="qjs-canvas-scroll">
                      <table className="qjs-circuit-table">
                        <tbody>
                          {circuit.rows.map((row, rIdx) => (
                            <tr key={row.label}>
                              <td className="qjs-circuit-qubit">
                                {row.label}
                              </td>
                              {row.gates.map((gate, cIdx) => {
                                const isSelected =
                                  selectedCell &&
                                  selectedCell.row === rIdx &&
                                  selectedCell.col === cIdx;
                                return (
                                  <td
                                    key={cIdx}
                                    className="qjs-circuit-cell"
                                  >
                                    <div
                                      className={
                                        "qjs-circuit-cell-inner " +
                                        (isSelected ? "qjs-cell-selected" : "")
                                      }
                                      onClick={handleCellClick(
                                        rIdx,
                                        cIdx
                                      )}
                                      onContextMenu={handleCellContextMenu(
                                        rIdx,
                                        cIdx
                                      )}
                                      onDragOver={handleCellDragOver}
                                      onDrop={handleCellDrop(rIdx, cIdx)}
                                      onDoubleClick={() =>
                                        handleDeleteGateAtCell(
                                          rIdx,
                                          cIdx
                                        )
                                      }
                                    >
                                      {gate ? (
                                        <span
                                          className={
                                            "qjs-gate-pill " +
                                            (gate.role === "control"
                                              ? "qjs-gate-role-control"
                                              : gate.role === "target"
                                              ? "qjs-gate-role-target"
                                              : "")
                                          }
                                        >
                                          {renderGateLabel(gate)}
                                        </span>
                                      ) : (
                                        <span className="qjs-circuit-cell-empty">
                                          ·
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                      }}
                    >
                      <span>
                        Double-click gate cell to{" "}
                        <strong>delete</strong>. Multi-qubit gates clear both
                        control &amp; target.
                      </span>
                      <button
                        type="button"
                        className="qjs-btn-outline"
                        onClick={() =>
                          updateCircuitAndQasm({ ...circuit })
                        }
                      >
                        Re-sync QASM from circuit
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: QASM editor + stats */}
              <div className="qjs-right-stack">
                <div className="qjs-card">
                  <div className="qjs-card-header">
                   <div>
                      <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" />QASM Editor & Preview
                      </div>
                        
                      <div className="qjs-card-sub">
                     You can directly edit the OpenQASM 3.0 program and then apply your changes back to the circuit grid by clicking the Apply button. </div>
                    
                      
                    </div>
                    </div>
                  </div>
                  <div className="qjs-qasm-wrapper">
                    <div className="qjs-qasm-header">
                      <span className="qjs-qasm-badge">
                        OPENQASM 3.0 • editable
                      </span>
                      <span style={{ fontSize: 11, opacity: 0.85 }}>
                        Lines: {linesOfQasm} • Inferred qubits:{" "}
                        {inferredQubits || "—"}
                      </span>
                    </div>

                    <textarea
                      className="qjs-qasm-textarea"
                      value={qasmText}
                      onChange={(e) => {
                        setQasmText(e.target.value);
                        setCircuitDirtyFromEditor(true);
                      }}
                    />

                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <button
                        type="button"
                        className="qjs-btn-outline"
                        onClick={handleApplyQasmToCircuit}
                      >
                        Apply QASM → circuit
                      </button>
                      {circuitDirtyFromEditor && (
                        <span
                          style={{
                            fontSize: 11,
                            color: "#facc15",
                          }}
                        >
                          Edited QASM not yet applied to circuit.
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 11,
                        opacity: 0.85,
                      }}
                    >
                      Highlighted preview:
                    </div>
                    <div
                      className="qjs-qasm-scroll qjs-qasm-code"
                      dangerouslySetInnerHTML={highlightedQasm}
                    />
                  </div>
                </div>

                <div className="qjs-card">
                  <div className="qjs-card-header">
                    <div> <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" />QASM Editor & Preview
                      </div></div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3,minmax(0,1fr))",
                      gap: 10,
                      fontSize: 11,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          opacity: 0.7,
                          marginBottom: 2,
                        }}
                      >
                        Lines of QASM
                      </div>
                      <div style={{ fontWeight: 600 }}>{linesOfQasm}</div>
                    </div>
                    <div>
                      <div
                        style={{
                          opacity: 0.7,
                          marginBottom: 2,
                        }}
                      >
                        Inferred qubits
                      </div>
                      <div style={{ fontWeight: 600 }}>
                        {inferredQubits || "—"}
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          opacity: 0.7,
                          marginBottom: 2,
                        }}
                      >
                        Gate columns (approx)
                      </div>
                      <div style={{ fontWeight: 600 }}>{gateColumns}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="qjs-layout"
            >
              {/* LEFT: Execution settings */}
              <div className="qjs-card">
                <div className="qjs-card-header">
                  <div>
                    <div className="qjs-card-header">
                   <div>
                      <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" />Execution Settings
                      </div>
                        
                      <div className="qjs-card-sub">
                        Select the primitive, backend, and shot count; the chosen backend then converts your selections into a REST call for execution on IBM Qiskit Runtime Primitives, seamlessly linking your configuration to the quantum runtime.
                     </div>   
                    </div></div></div></div>
                </div>

                <div className="qjs-form-grid">
                  <div className="qjs-field">
                    <label className="qjs-label">Circuit primitive</label>
                    <select
                      className="qjs-select"
                      value={circuitType}
                      onChange={(e) => setCircuitType(e.target.value)}
                    >
                      <option value="sampler">
                        Sampler (bitstring sampling)
                      </option>
                      <option value="estimator" disabled>
                        Estimator (coming soon)
                      </option>
                    </select>
                  </div>

                  <div className="qjs-field">
                    <label className="qjs-label">
                      Backend (QPU / simulator)
                    </label>
                    <select
                      className="qjs-select"
                      value={selectedBackend}
                      onChange={(e) => setSelectedBackend(e.target.value)}
                      disabled={!backends.length || backendLoading} // Disable if no backends or loading
                    >
                      {backendLoading ? (
                        <option value="">Loading backends...</option>
                      ) : backends.length === 0 ? (
                        <option value="">No backends available</option>
                      ) : (
                        backends.map((b) => (
                          <option key={b.name} value={b.name}>
                            {b.name} • q={b.qubits} • queue={b.queue_length}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="qjs-field">
                    <label className="qjs-label">Shots</label>
                    <input
                      className="qjs-input"
                      type="number"
                      min={1}
                      max={8192}
                      value={shots}
                      onChange={(e) =>
                        setShots(
                          Math.max(
                            1,
                            Math.min(8192, Number(e.target.value) || 1)
                          )
                        )
                      }
                    />
                  </div>

                  <div className="qjs-field">
                    <label className="qjs-label">Job name (override)</label>
                    <input
                      className="qjs-input"
                      placeholder={currentAlgo?.label}
                      value={jobName}
                      onChange={(e) => setJobName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="qjs-footer-row">
                  <button
                    type="button"
                    className="qjs-btn-outline"
                    onClick={handlePrev}
                  >
                    ← Back to circuit
                  </button>
                  <button
                    type="button"
                    className="qjs-btn"
                    disabled={submitting || !selectedBackend} // Cannot submit if no backend selected
                    onClick={handleSubmitJob}
                  >
                    {submitting ? "Submitting to backend…" : "Submit Job → IBM"}
                  </button>
                </div>
              </div>

              {/* RIGHT: Summary & backend snapshot */}
              <div className="qjs-right-stack">
                <div className="qjs-card">
                  <div className="qjs-card-header">
                     <div className="qjs-card-header">
                   <div>
                      <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" />Submission Summary
                      </div>
                        
                      <div className="qjs-card-sub">
                     Review all your selections and settings in the Submission Summary before sending your job to the quantum backend.</div>   </div></div></div>
                  </div>
                  <ul
                    style={{
                      fontSize: 12,
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "grid",
                      gap: 6,
                    }}
                  >
                    <li>
                      <strong>Algorithm:</strong>{" "}
                      {currentAlgo?.label || algoKey}
                    </li>
                    <li>
                      <strong>Primitive:</strong>{" "}
                      {circuitType === "sampler"
                        ? "Sampler (bitstring sampling)"
                        : "Estimator (future)"}
                    </li>
                    <li>
                      <strong>Qubits (inferred):</strong>{" "}
                      {inferredQubits || circuit.numQubits}
                    </li>
                    <li>
                      <strong>Backend:</strong>{" "}
                      {selectedBackendObj?.name || "—"}
                    </li>
                    <li>
                      <strong>Backend status:</strong>{" "}
                      {selectedBackendObj?.status || "—"} (
                      {selectedBackendObj?.queue_length ?? "?"} in queue)
                    </li>
                    <li>
                      <strong>Shots:</strong> {shots}
                    </li>
                    <li>
                      <strong>Job name:</strong>{" "}
                      {jobName ||
                        `${currentAlgo?.label || "Quantum Job"}`}
                    </li>
                  </ul>
                </div>

                <div className="qjs-card">
                  <div className="qjs-card-header">
                     <div>
                      <div className="qjs-card-header-bar">
                      <div className="qjs-card-title">
                        <span className="qjs-icon-orb" />Backend Snapshot
                      </div>
                        
                      <div className="qjs-card-sub">Use the Backend Snapshot to view a detailed overview of the selected backend, including its current operational status and key performance metrics</div></div></div>
                  </div>
                  {/* UPDATED LOADING/ERROR STATE */}
                  {backendLoading ? (
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.8,
                        color: "#9ca3ff",
                      }}
                    >
                      Loading IBM backend list…
                    </div>
                  ) : backendError ? (
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.9,
                        color: "#f87171",
                      }}
                    >
                      <strong style={{ display: 'block', marginBottom: '4px' }}>Backend Error:</strong> 
                      {backendError}
                    </div>
                  ) : backends.length ? (
                    <>
                      <div
                        style={{
                          fontSize: 11,
                          opacity: 0.8,
                        }}
                      >
                        Top devices from your IBM instance:
                      </div>
                      {backends.slice(0, 3).map((b) => (
                        <div key={b.name} className="qjs-backend-pill">
                          <div>
                            <div
                              style={{
                                fontWeight: 500,
                                fontSize: 12,
                              }}
                            >
                              {b.name}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                opacity: 0.8,
                              }}
                            >
                              q={b.qubits} • queue={b.queue_length} • clops=
                              {b.clops ?? "—"}
                            </div>
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              className="qjs-status-dot"
                              style={{
                                background:
                                  b.status === "online"
                                    ? "#22c55e"
                                    : "#f97373",
                                boxShadow:
                                  b.status === "online"
                                    ? "0 0 10px #22c55e"
                                    : "0 0 10px #f97373",
                              }}
                            />
                            <span style={{ fontSize: 11 }}>{b.status}</span>
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: 12,
                        opacity: 0.8,
                      }}
                    >
                      No backends available. Check your IBM API key and instance
                      CRN configuration on the backend.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* bottom navigation for step 1 & 2 */}
        {step <= 2 && (
          <div className="qjs-footer-row">
            <button
              type="button"
              className="qjs-btn-outline"
              onClick={step === 1 ? () => navigate("/hiring") : handlePrev}
            >
              {step === 1 ? "← Back to dashboard" : "← Back"}
            </button>
            <button type="button" className="qjs-btn" onClick={handleNext}>
              Continue →
            </button>
          </div>
        )}

        {error && (
          <div className="qjs-error" style={{ marginTop: 10 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "999px",
                background:
                  "radial-gradient(circle at 30% 20%, #fecaca, #f87171)",
                boxShadow: "0 0 10px rgba(248,113,113,0.9)",
              }}
            />
            {error}
          </div>
        )}

        {/* FLOATING PALETTE */}
        <AnimatePresence>
          {hasFloatingPalette && (
            <motion.div
              className="qjs-floating-palette"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                left: floatingPalette.x,
                top: floatingPalette.y,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  marginBottom: 4,
                  opacity: 0.8,
                }}
              >
                Floating gate palette
              </div>
              <div className="qjs-gate-row">
                {TOP_GATES.concat(ADVANCED_SINGLE_GATES).map((g) => (
                  <button
                    key={g}
                    className="qjs-gate-btn"
                    onClick={() => handleFloatingGateClick(g)}
                  >
                    <span className="qjs-gate-chip" />
                    {g}
                  </button>
                ))}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 10,
                  opacity: 0.8,
                }}
              >
                Click a gate to insert at the selected cell. Esc to close.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PARAM MODAL */}
        <AnimatePresence>
          {paramModal && (
            <motion.div
              className="qjs-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="qjs-modal-panel"
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
              >
                <div className="qjs-modal-title">
                  Configure {paramModal.type} gate
                </div>
                <div className="qjs-modal-sub">
                  Qubit: q[{paramModal.row}] • Column {paramModal.col}
                </div>

                {["RZ", "RX", "RY"].includes(paramModal.type) && (
                  <div className="qjs-field" style={{ marginTop: 10 }}>
                    <label className="qjs-label">
                      Angle θ (e.g. pi/2, pi/4)
                    </label>
                    <input
                      className="qjs-input"
                      value={paramTheta}
                      onChange={(e) => setParamTheta(e.target.value)}
                    />
                  </div>
                )}

                {paramModal.type === "U3" && (
                  <>
                    <div className="qjs-field" style={{ marginTop: 10 }}>
                      <label className="qjs-label">φ</label>
                      <input
                        className="qjs-input"
                        value={paramPhi}
                        onChange={(e) => setParamPhi(e.target.value)}
                      />
                    </div>
                    <div className="qjs-field" style={{ marginTop: 10 }}>
                      <label className="qjs-label">θ</label>
                      <input
                        className="qjs-input"
                        value={paramTheta}
                        onChange={(e) => setParamTheta(e.target.value)}
                      />
                    </div>
                    <div className="qjs-field" style={{ marginTop: 10 }}>
                      <label className="qjs-label">λ</label>
                      <input
                        className="qjs-input"
                        value={paramLambda}
                        onChange={(e) => setParamLambda(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="qjs-modal-footer">
                  <button
                    type="button"
                    className="qjs-btn-outline"
                    onClick={() => setParamModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="qjs-btn"
                    onClick={handleParamModalSave}
                  >
                    Apply gate
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MULTI-GATE MODAL */}
        <AnimatePresence>
          {multiModal && (
            <motion.div
              className="qjs-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="qjs-modal-panel"
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
              >
                <div className="qjs-modal-title">
                  Configure {multiModal.type} gate
                </div>
                <div className="qjs-modal-sub">
                  Column {multiModal.col} • choose control and target qubits.
                </div>

                <div className="qjs-field" style={{ marginTop: 10 }}>
                  <label className="qjs-label">Control qubit</label>
                  <select
                    className="qjs-select"
                    value={multiModal.control}
                    onChange={(e) =>
                      setMultiModal((m) => ({
                        ...m,
                        control: Number(e.target.value),
                      }))
                    }
                  >
                    {Array.from(
                      { length: circuit.numQubits },
                      (_, i) => i
                    ).map((q) => (
                      <option key={q} value={q}>
                        q[{q}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="qjs-field" style={{ marginTop: 10 }}>
                  <label className="qjs-label">Target qubit</label>
                  <select
                    className="qjs-select"
                    value={multiModal.target}
                    onChange={(e) =>
                      setMultiModal((m) => ({
                        ...m,
                        target: Number(e.target.value),
                      }))
                    }
                  >
                    {Array.from(
                      { length: circuit.numQubits },
                      (_, i) => i
                    ).map((q) => (
                      <option key={q} value={q}>
                        q[{q}]
                      </option>
                    ))}
                  </select>
                </div>

                {multiModal.type === "CP" && (
                  <div className="qjs-field" style={{ marginTop: 10 }}>
                    <label className="qjs-label">
                      Phase θ (e.g. pi/2, pi/4)
                    </label>
                    <input
                      className="qjs-input"
                      value={multiModal.theta}
                      onChange={(e) =>
                        setMultiModal((m) => ({
                          ...m,
                          theta: e.target.value || "pi/2",
                        }))
                      }
                    />
                  </div>
                )}

                <div className="qjs-modal-footer">
                  <button
                    type="button"
                    className="qjs-btn-outline"
                    onClick={() => setMultiModal(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="qjs-btn"
                    onClick={handleMultiModalSave}
                  >
                    Apply gate
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
