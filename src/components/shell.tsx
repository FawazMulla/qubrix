import { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronRight,
  FlaskConical,
  Globe2,
  GraduationCap,
  Home,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ScanLine,
  Settings,
  Sparkles,
  Target,
  Trophy,
  User as UserIcon,
  X,
  Zap,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { navItems, currentUser } from "../mockData";
import type { RouteKey } from "../types";
import { Toast } from "./ui";
import { useLearning } from "../context/LearningContext";
import { useI18n, localeNames, type Locale } from "../context/I18nContext";

const icons: Record<RouteKey, typeof Home> = {
  dashboard: Home,
  learn: BookOpen,
  designer: ScanLine,
  simulator: FlaskConical,
  visualizer: BrainCircuit,
  tutor: Bot,
  assessments: Target,
  progress: BarChart3,
  instructor: GraduationCap,
};

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [languageMenu, setLanguageMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { overallProgress } = useLearning();
  const { locale, setLocale } = useI18n();

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
        setLanguageMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    setLanguageMenu(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const active =
    navItems.find(
      (x) => x.path === location.pathname || (x.path !== "/" && location.pathname.startsWith(x.path))
    ) || navItems[0];

  const notify = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? "sidebar-collapsed " : ""}${mobileOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="brand-row">
          <NavLink to="/" className="brand">
            <span className="brand-mark">Q</span>
            {!collapsed && <span>Qubrix</span>}
          </NavLink>
          <div className="sidebar-controls">
            <button
              type="button"
              className="icon-button desktop-nav-toggle"
              aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
              title={collapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
            <button
              type="button"
              className="icon-button mobile-close"
              aria-label="Close navigation"
              title="Close navigation"
              onClick={() => setMobileOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <span className="nav-section-label">{collapsed ? "" : "Workspace"}</span>
          {navItems.map((item) => {
            const Icon = icons[item.key] || Home;
            return (
              <NavLink
                key={item.key}
                to={item.path}
                end={item.path === "/"}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `nav-item ${isActive ? "nav-item-active" : ""}`}
              >
                <Icon className="nav-icon" size={18} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="sidebar-tip">
              <Sparkles size={15} />
              <strong>Quantum tip</strong>
              <span>Try an H gate to explore superposition.</span>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Application Area */}
      <div className="app-main">
        {/* Fixed Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="navigation-control">
              <button
                type="button"
                className="icon-button mobile-menu"
                aria-label="Open navigation"
                title="Open navigation"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>
            </div>
            <div className="breadcrumbs" aria-label="Breadcrumb">
              <span className="crumb-root">Qubrix</span>
              <span className="crumb-sep">/</span>
              <strong className="crumb-current">{active.label}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Notifications Menu */}
            <div className="topbar-menu-anchor" ref={notificationsRef}>
              <button
                type="button"
                className={`icon-button ${notificationsOpen ? "active" : ""}`}
                aria-label="Notifications"
                title="Notifications"
                onClick={() => {
                  setNotificationsOpen((v) => !v);
                  setProfileOpen(false);
                }}
              >
                <Bell size={18} />
                <span className="alert-dot" />
              </button>

              {notificationsOpen && (
                <div className="notifications-dropdown-panel">
                  <div className="notifications-head">
                    <strong>Notifications</strong>
                    <button
                      type="button"
                      className="icon-btn-text"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="notification-item">
                    <span className="notification-icon success">
                      <Check size={15} />
                    </span>
                    <div>
                      <strong>Quantum Fundamentals completed!</strong>
                      <time>18 min ago</time>
                    </div>
                  </div>
                  <div className="notification-item">
                    <span className="notification-icon purple">
                      <BookOpen size={15} />
                    </span>
                    <div>
                      <strong>Next up: Quantum Gates & Circuits</strong>
                      <time>1 hour ago</time>
                    </div>
                  </div>
                  <div className="notification-item">
                    <span className="notification-icon amber">
                      <Trophy size={15} />
                    </span>
                    <div>
                      <strong>Achievement unlocked: Circuit Architect</strong>
                      <time>Yesterday</time>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="topbar-menu-anchor" ref={profileRef}>
              <button
                type="button"
                className={`profile-pill-button ${profileOpen ? "active" : ""}`}
                aria-label="User menu"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotificationsOpen(false);
                }}
              >
                <span className="avatar">{currentUser.initials}</span>
                <div className="profile-pill-info">
                  <strong>{currentUser.name}</strong>
                  <small>{currentUser.role}</small>
                </div>
                <ChevronDown size={14} className={`profile-chevron ${profileOpen ? "open" : ""}`} />
              </button>

              {profileOpen && (
                <div className="profile-floating-menu">
                  <div className="dropdown-user">
                    <span className="avatar large">{currentUser.initials}</span>
                    <div>
                      <strong>{currentUser.name}</strong>
                      <small>{currentUser.role} · {overallProgress}% Progress</small>
                    </div>
                  </div>

                  <div className="dropdown-menu-list">
                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={() => {
                        navigate("/progress");
                        setProfileOpen(false);
                      }}
                    >
                      <UserIcon size={16} />
                      <span>Your Learning Profile</span>
                      <ChevronRight size={14} className="dropdown-item-arrow" />
                    </button>

                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={() => setLanguageMenu((v) => !v)}
                    >
                      <Globe2 size={16} />
                      <span>Language</span>
                      <small className="dropdown-item-badge">{localeNames[locale]}</small>
                      <ChevronDown
                        size={14}
                        className={`dropdown-item-arrow ${languageMenu ? "rotate" : ""}`}
                      />
                    </button>

                    {languageMenu && (
                      <div className="dropdown-languages">
                        {Object.entries(localeNames).map(([val, label]) => (
                          <button
                            type="button"
                            key={val}
                            className={`dropdown-lang-btn ${locale === val ? "selected" : ""}`}
                            onClick={() => {
                              setLocale(val as Locale);
                              notify(`Language set to ${label}`);
                            }}
                          >
                            <span>{val.toUpperCase()}</span>
                            {label}
                            {locale === val && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      className="dropdown-item-btn"
                      onClick={() => {
                        notify("Preferences saved");
                        setProfileOpen(false);
                      }}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                      <ChevronRight size={14} className="dropdown-item-arrow" />
                    </button>
                  </div>

                  <div className="dropdown-foot">
                    <span>
                      <span className="status-dot" /> Qubrix AI is active
                    </span>
                    <small>Personalization ON</small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="content-container">
          <Outlet />
        </main>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}