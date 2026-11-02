import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Globe, ChevronDown, Check, Mic, Home, ClipboardList, Box, CheckSquare, PhoneCall, Bot, Sparkles, Camera, Settings, Sun, Moon, LogIn, LogOut, User as UserIcon, History, Layers } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import BrandLogo from './BrandLogo';
import KycBadge from './KycBadge';

export default function Navbar({ onOpenVoiceRecorder, onOpenAssistant, onOpenLens }) {
  const { user, switchRole, openAuthModal, logout, isAuthenticated } = useAuth();
  const { language, currentLangObj, setIsLangModalOpen, t } = useLanguage();
  const { theme, toggleTheme, openSettings } = useSettings();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const personas = [
    { role: 'needer', label: 'Aarav (Needer)', area: 'Civil Lines' },
    { role: 'ngo', label: 'Seva Trust (NGO)', area: 'Civil Lines' },
    { role: 'donor', label: 'Priya (Donor)', area: 'District Hospital' },
    { role: 'lender', label: 'REC Maker Club (Lender)', area: 'REC Banda' },
    { role: 'verifier', label: 'Manoj (Verifier)', area: 'REC Banda' },
    { role: 'admin', label: 'Admin (Governance)', area: 'REC Banda' }
  ];

  const navLinks = [
    { to: '/', label: t('navHome'), icon: Home },
    { to: '/requests', label: t('navRequests'), icon: ClipboardList },
    { to: '/borrow-return', label: t('navItems'), icon: Box },
    { to: '/dashboard', label: 'स्टॉक डैशबोर्ड', icon: Layers },
    { to: '/history', label: 'मेरा इतिहास', icon: History },
    { to: '/verifier', label: t('navVerifier'), icon: CheckSquare },
    { to: '/volunteer-assist', label: t('navOfflineAssist'), icon: PhoneCall },
  ];

  return (
    <header className="sticky top-0 z-40 bg-darkbrown text-cream border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <BrandLogo size="md" />
          <div>
            <div className="font-black text-xl tracking-tight leading-none text-white flex items-center gap-1.5">
              <span>Zaroorat<span className="text-softYellow">Setu</span></span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-extrabold uppercase tracking-wider">
                HackFest 3.0
              </span>
            </div>
            <div className="text-[11px] text-cream/70 font-semibold tracking-wide mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal"></span>
              <span>{t('pilotSubtext')}</span>
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links (Full Website Experience) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white/15 text-softYellow shadow-sm'
                    : 'text-cream/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 opacity-80" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Lens Camera Trigger */}
          {onOpenLens && (
            <button
              onClick={onOpenLens}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-dark to-teal hover:opacity-95 text-white text-xs font-extrabold shadow-sm transition border border-teal/40"
              title="Open AI Lens Camera (सामान जांच एवं 50% धरोहर स्कैनर)"
              aria-label="AI Lens Camera"
            >
              <Camera className="w-3.5 h-3.5 text-softYellow" />
              <span className="hidden sm:inline">AI Lens</span>
              <span className="sm:hidden">Lens</span>
            </button>
          )}

          {/* AI Voice Recorder Trigger */}
          {onOpenVoiceRecorder && (
            <button
              onClick={onOpenVoiceRecorder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-xs font-extrabold shadow-sm transition"
              title="Open AI Voice Recorder (बोलकर दर्ज करें)"
              aria-label="AI Voice Recorder"
            >
              <Mic className="w-3.5 h-3.5 stroke-[2.5] animate-pulse" />
              <span>Voice</span>
            </button>
          )}

          {/* AI Assistant Trigger */}
          {onOpenAssistant && (
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal hover:bg-teal-hover text-white text-xs font-extrabold shadow-sm transition"
              title="Open AI Sahayak (AI सहायक साथी)"
              aria-label="AI Assistant"
            >
              <Bot className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">AI Sahayak</span>
              <span className="sm:hidden">AI</span>
            </button>
          )}

          {/* Regional Language Switcher */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-cream transition border border-white/10"
            title="क्षेत्रीय भाषा बदलें (Hindi / Bundeli / Awadhi / English)"
            aria-label="Change Regional Language"
          >
            <Globe className="w-3.5 h-3.5 text-softYellow" />
            <span>{currentLangObj?.label || 'भाषा'}</span>
          </button>

          {/* Dark & Light Mode Toggle Switch (टॉगल स्विच) */}
          <div 
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 border border-white/10 shrink-0"
            title={theme === 'dark' ? "डार्क मोड सक्रिय (Dark Mode Active) - क्लिक कर लाइट मोड करें" : "लाइट मोड सक्रिय (Light Mode Active) - क्लिक कर डार्क मोड करें"}
          >
            <Sun className={`w-3.5 h-3.5 transition ${theme === 'light' ? 'text-softYellow' : 'text-cream/40'}`} />
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              onClick={toggleTheme}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                theme === 'dark' ? 'bg-teal' : 'bg-black/40'
              }`}
              aria-label="Theme toggle switch"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <Moon className={`w-3.5 h-3.5 transition ${theme === 'dark' ? 'text-softYellow' : 'text-cream/40'}`} />
          </div>

          {/* Settings Modal Trigger (Theme, Mic & Camera Permissions) */}
          <button
            onClick={openSettings}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-cream/80 hover:text-white transition border border-white/10 shrink-0"
            title="सेटिंग्स (वेबसाइट मोड, माइक व कैमरा अनुमति)"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal text-cream text-xs font-bold hover:bg-teal-hover transition shadow-sm"
              title="Switch demo persona for testing"
            >
              <span className="capitalize">{user?.role || 'Guest'}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white text-darkbrown shadow-2xl border border-darkbrown/10 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] uppercase font-bold text-darkbrown/50 px-2 py-1">
                  {t('switchDemoUser')}
                </div>
                {personas.map((p) => (
                  <button
                    key={p.role}
                    onClick={() => {
                      switchRole(p.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-xs font-medium transition ${
                      user?.role === p.role ? 'bg-teal-light text-teal font-bold' : 'hover:bg-cream'
                    }`}
                  >
                    <div>
                      <div>{p.label}</div>
                      <div className="text-[10px] text-darkbrown/60">{p.area}</div>
                    </div>
                    {user?.role === p.role && <Check className="w-3.5 h-3.5 text-teal" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Auth Portal & Profile Controls */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-cream transition border border-white/10"
                title="मेरा प्रोफाइल देखें (View Profile)"
              >
                <UserIcon className="w-3.5 h-3.5 text-softYellow" />
                <span className="hidden sm:inline max-w-[85px] truncate">{user.displayName || user.publicName}</span>
              </Link>
              <button
                onClick={() => openAuthModal(1)}
                className="p-1 rounded-full hover:bg-white/10 transition"
                title="KYC Status"
              >
                <KycBadge level={user?.kycLevel} status={user?.kycStatus} size="sm" />
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-full hover:bg-red-500/20 text-cream/70 hover:text-red-400 transition"
                title="लॉग आउट करें (Logout)"
                aria-label="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black shadow-sm transition"
              title="लॉग इन अथवा नया खाता बनाएं (Login / Signup)"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>लॉग इन</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
