import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Globe, ChevronDown, Check, Mic, Home, ClipboardList, Box, CheckSquare, PhoneCall } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import BrandLogo from './BrandLogo';
import KycBadge from './KycBadge';

export default function Navbar({ onOpenVoiceRecorder }) {
  const { user, switchRole, openAuthModal } = useAuth();
  const { language, currentLangObj, setIsLangModalOpen, t } = useLanguage();
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

          {/* KYC Status / Login Trigger */}
          <button
            onClick={() => openAuthModal(1)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/10 transition"
          >
            <KycBadge level={user?.kycLevel} status={user?.kycStatus} size="sm" />
          </button>
        </div>
      </div>
    </header>
  );
}
