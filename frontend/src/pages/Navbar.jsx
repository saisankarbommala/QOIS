import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const colors = {
    bgDark: "#05001a",
    accentAqua: "#00E5FF",
    accentViolet: "#C400FF",
    textLight: "#E0E0FF",
    glassBg: "rgba(255,255,255,0.05)",
    glassBorder: "rgba(0,229,255,0.2)",
    logoBgIndigo: "rgba(10,0,30,0.8)"
  };

  const isActiveLink = (path) => location.pathname === path;

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__logo">
        <div className="quantum-logo-container">
          <svg className="quantum-logo-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="10" fill="url(#core-gradient)" className="logo-core-glow"/>

            <defs>
              <radialGradient id="core-gradient">
                <stop offset="0%" stopColor="#FFF"/>
                <stop offset="60%" stopColor={colors.accentAqua}/>
                <stop offset="100%" stopColor={colors.accentViolet}/>
              </radialGradient>
            </defs>
          </svg>
        </div>
        <span className="logo-text">
          QOP's<span className="logo-accent">System</span>
        </span>
      </div>

      {/* Toggle */}
      <div className={`navbar__toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Links */}
      <ul className={`navbar__links ${isOpen ? "open" : ""}`}>
        <li>
          <Link to="/" className={`navbar__link ${isActiveLink("/") ? "active" : ""}`}>
            Q-Home
          </Link>
        </li>

        <li>
          <Link to="/dashboard" className={`navbar__link ${isActiveLink("/dashboard") ? "active" : ""}`}>
            Q-Vision
          </Link>
        </li>

        <li>
          <Link to="/hiring" className={`navbar__link ${isActiveLink("/hiring") ? "active" : ""}`}>
            Q-Execute
          </Link>
        </li>

        {/* ⭐ AUTH AREA */}
        {user ? (
          <>
            {/* Profile */}
            <li>
              <div className="profile-circle">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </li>

            {/* Logout */}
            <li>
              <button className="btn-cta" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className="btn-cta">
              Login
            </Link>
          </li>
        )}
      </ul>

      {/* CSS */}
      <style>{`
        .navbar {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:0.3rem 2.5rem;
          background:linear-gradient(135deg, ${colors.bgDark}, #000);
          position:sticky;
          top:0;
          z-index:1000;
        }

        .navbar__logo{
          display:flex;
          align-items:center;
          font-size:1.6rem;
          font-weight:800;
        }

        .logo-accent{
          background:linear-gradient(90deg, ${colors.accentAqua}, ${colors.accentViolet});
          -webkit-background-clip:text;
          color:transparent;
        }

        .navbar__links{
          list-style:none;
          display:flex;
          align-items:center;
          gap:1.8rem;
        }

        .navbar__link{
          text-decoration:none;
          color:${colors.textLight};
          font-size:0.9rem;
          opacity:0.7;
          transition:0.3s;
        }

        .navbar__link:hover,
        .navbar__link.active{
          color:${colors.accentAqua};
          opacity:1;
        }

        .btn-cta{
          background:linear-gradient(90deg, ${colors.accentAqua}, ${colors.accentViolet});
          color:${colors.bgDark};
          border:none;
          padding:0.5rem 1.2rem;
          border-radius:5px;
          font-weight:700;
          cursor:pointer;
        }

        .profile-circle{
          width:38px;
          height:38px;
          border-radius:50%;
          border:2px solid ${colors.accentAqua};
          display:flex;
          align-items:center;
          justify-content:center;
          color:${colors.accentAqua};
          font-weight:bold;
        }

        .navbar__toggle{
          display:none;
          cursor:pointer;
          flex-direction:column;
          gap:4px;
        }

        .bar{
          width:24px;
          height:2px;
          background:${colors.accentAqua};
        }

        @media(max-width:768px){
          .navbar__toggle{
            display:flex;
          }

          .navbar__links{
            position:absolute;
            right:0;
            top:100%;
            flex-direction:column;
            background:#02020a;
            width:200px;
            padding:1rem;
            opacity:0;
            pointer-events:none;
          }

          .navbar__links.open{
            opacity:1;
            pointer-events:all;
          }
        }
      `}</style>
    </nav>
  );
}
