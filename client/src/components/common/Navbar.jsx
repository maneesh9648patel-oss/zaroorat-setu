import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Globe, ChevronDown, Check, Settings, Sun, Moon, 
  LogIn, LogOut, User as UserIcon, Menu, X 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import BrandLogo from './BrandLogo';
import KycBadge from './KycBadge';
import NotificationBell from '../matching/NotificationBell';
import TabBar from '../navigation/TabBar';

/**
 * Top Navbar Component
 * Renders brand header + desktop action controls.
 * Integrates horizontal <TabBar> below header ONLY for logged-in users.
 * Automatically hidden on Login/Signup pages.
 */
export default function Navbar({ 
  onOpenVoiceRecorder, 
  onOpenAssistant, 
  onOpenLens,
  badges = {}
}) {
  const { user, switchRole, openAuthModal, logout, isAuthenticated } = useAuth();
  const { language, currentLangObj, setIsLangModalOpen, t } = useLanguage();
  const { theme, toggleTheme, openSettings } = useSettings();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const personas = [
    { role: 'needer', label: 'Aarav (Needer)', area: 'Civil Lines' },
    { role: 'ngo', label: 'Seva Trust (NGO)', area: 'Civil Lines' },
    { role: 'donor', label: 'Priya (Donor)', area: 'District Hospital' },
    { role: 'lender', label: 'REC Maker Club (Lender)', area: 'REC Banda' },
    { role: 'verifier', label: 'Manoj (Verifier)', area: 'REC Banda' },
    { role: 'admin', label: 'Admin (Governance)', area: 'REC Banda' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-darkbrown text-cream border-b border-white/10 shadow-md">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
          <BrandLogo size="md" className="w-8 h-8 sm:w-10 sm:h-10" />
          <div className="min-w-0">
            <div className="font-black text-lg sm:text-xl tracking-tight leading-none text-white flex items-center gap-1.5 truncate">
              <span>Zaroorat<span className="text-softYellow">Setu</span></span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                HackFest 3.0
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-cream/70 font-semibold tracking-wide mt-0.5 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0"></span>
              <span className="truncate">{t('pilotSubtext')}</span>
            </div>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Smart Matching Realtime Notifications Bell */}
          <NotificationBell />

          {/* Regional Language Switcher */}
          <button
            onClick={() => setIsLangModalOpen(true)}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-cream transition border border-white/10 shrink-0"
            title="क्षेत्रीय भाषा बदलें (Hindi / Bundeli / Awadhi / English)"
            aria-label="Change Regional Language"
          >
            <Globe className="w-3.5 h-3.5 text-softYellow" />
            <span className="hidden sm:inline">{currentLangObj?.label || 'भाषा'}</span>
          </button>

          {/* Dark & Light Mode Toggle Switch */}
          <div 
            className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-full bg-white/10 border border-white/10 shrink-0"
            title={theme === 'dark' ? "डार्क मोड सक्रिय" : "लाइट मोड सक्रिय"}
          >
            <Sun className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition ${theme === 'light' ? 'text-softYellow' : 'text-cream/40'}`} />
            <button
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              onClick={toggleTheme}
              className={`relative inline-flex h-4 sm:h-5 w-7 sm:w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                theme === 'dark' ? 'bg-teal' : 'bg-black/40'
              }`}
              aria-label="Theme toggle switch"
            >
              <span
                className={`pointer-events-none inline-block h-3 sm:h-4 w-3 sm:w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  theme === 'dark' ? 'translate-x-3 sm:translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <Moon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition ${theme === 'dark' ? 'text-softYellow' : 'text-cream/40'}`} />
          </div>

          {/* Settings Trigger (Tablet/Desktop) */}
          <button
            onClick={openSettings}
            className="hidden md:flex p-2 rounded-full bg-white/10 hover:bg-white/20 text-cream/80 hover:text-white transition border border-white/10 shrink-0"
            title="सेटिंग्स (वेबसाइट मोड, माइक व कैमरा अनुमति)"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Persona Switcher Dropdown (Desktop >= 1024px) */}
          {isAuthenticated && (
            <div className="relative hidden lg:block">
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
          )}

          {/* User Auth Controls */}
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-cream transition border border-white/10"
                title="मेरा प्रोफाइल देखें (View Profile)"
              >
                <UserIcon className="w-3.5 h-3.5 text-softYellow" />
                <span className="max-w-[85px] truncate">{user.displayName || user.publicName}</span>
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
            !isAuthPage && (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-sm transition"
                title="लॉग इन अथवा नया खाता बनाएं (Login / Signup)"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>लॉग इन</span>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Desktop & Tablet Horizontal TabBar (Rendered ONLY after login, hidden on auth pages) */}
      {isAuthenticated && !isAuthPage && (
        <TabBar 
          onOpenVoiceRecorder={onOpenVoiceRecorder}
          onOpenAssistant={onOpenAssistant}
          onOpenLens={onOpenLens}
          badges={badges}
        />
      )}
    </header>
  );
}
