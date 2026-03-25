import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "./context/AuthContext";
import "./i18n";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import Marketplace from "./pages/Marketplace";
import Preservation from "./pages/Preservation";
import HelpChat from "./pages/HelpChat";

function AppInner() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("en");
  const [menuOpen, setMenuOpen] = useState(false);

  const changeLang = (l) => { setLang(l); i18n.changeLanguage(l); };

  const navItems = user
    ? [
        { id: "home",     label: "🌾 " + t("app_name") },
        user.role === "farmer" && { id: "farmer", label: t("farmer_dashboard") },
        user.role === "buyer"  && { id: "buyer",  label: t("buyer_dashboard") },
        { id: "market",  label: t("marketplace") },
        { id: "preserve",label: t("preservation") },
        { id: "help",    label: t("help") },
      ].filter(Boolean)
    : [
        { id: "home",     label: "🌾 " + t("app_name") },
        { id: "market",  label: t("marketplace") },
        { id: "preserve",label: t("preservation") },
        { id: "help",    label: t("help") },
      ];

  const renderPage = () => {
    switch (page) {
      case "farmer":   return <FarmerDashboard lang={lang} />;
      case "buyer":    return <BuyerDashboard lang={lang} />;
      case "market":   return <Marketplace lang={lang} />;
      case "preserve": return <Preservation lang={lang} />;
      case "help":     return <HelpChat lang={lang} />;
      case "login":    return <Login onDone={(dest) => setPage(dest === "register" ? "register" : user ? (user.role === "farmer" ? "farmer" : "buyer") : "home")} />;
      case "register": return <Register onDone={() => setPage("login")} />;
      default:         return <Dashboard lang={lang} />;
    }
  };

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <button className="brand" onClick={() => setPage("home")}>
            <span className="brand-icon">🌾</span>
            <span className="brand-name">{t("app_name")}</span>
            <span className="brand-tag">Beta</span>
          </button>

          {/* Desktop nav */}
          <nav className="desktop-nav">
            {navItems.slice(1).map(n => (
              <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`}
                onClick={() => setPage(n.id)}>{n.label}</button>
            ))}
          </nav>

          <div className="header-right">
            {/* Language selector */}
            <div className="lang-pills">
              {[["en","EN"],["hi","हि"],["mr","म"]].map(([code,label]) => (
                <button key={code} className={`lang-pill ${lang === code ? "active" : ""}`}
                  onClick={() => changeLang(code)}>{label}</button>
              ))}
            </div>

            {user ? (
              <div className="user-menu">
                <button className="user-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                  {user.name?.[0]?.toUpperCase() || "U"}
                </button>
                {menuOpen && (
                  <div className="user-dropdown">
                    <div className="user-name">{user.name}</div>
                    <div className="user-role">{user.role}</div>
                    <hr />
                    <button onClick={() => { logout(); setMenuOpen(false); setPage("home"); }}>
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-btns">
                <button className="btn-ghost" onClick={() => setPage("login")}>{t("login")}</button>
                <button className="btn-primary" onClick={() => setPage("register")}>{t("register")}</button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="mobile-nav">
            {navItems.slice(1).map(n => (
              <button key={n.id} onClick={() => { setPage(n.id); setMenuOpen(false); }}
                className="mobile-nav-item">{n.label}</button>
            ))}
            {!user && <>
              <button className="mobile-nav-item" onClick={() => { setPage("login"); setMenuOpen(false); }}>{t("login")}</button>
              <button className="mobile-nav-item" onClick={() => { setPage("register"); setMenuOpen(false); }}>{t("register")}</button>
            </>}
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <span>KisanSight © 2024 · ₹0 cost · Built for Indian Farmers</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
