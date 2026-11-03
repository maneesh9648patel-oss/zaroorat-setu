import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, ShieldCheck, Settings, LogOut, Moon, Sun, 
  HelpCircle, ChevronRight, User as UserIcon 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { getMoreDrawerTabs } from '../../config/navigationTabs';
import TabItem from './TabItem';

/**
 * Mobile 'More' Drawer Component
 * Slides up from bottom on mobile viewports (< 768px)
 * Displays remaining secondary tabs, AI triggers, Verifier queue (role-filtered), settings, and user actions.
 */
export default function MoreDrawer({
  isOpen,
  onClose,
  onOpenVoiceRecorder,
  onOpenAssistant,
  onOpenLens,
  badges = {}
}) {
  const { user, logout, openAuthModal } = useAuth();
  const { language, t } = useLanguage();
  const { theme, toggleTheme, openSettings } = useSettings();
  const navigate = useNavigate();

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const secondaryTabs = getMoreDrawerTabs(user?.role || 'needer');

  const handleTabClick = (tab) => {
    onClose();
    if (tab.actionKey === 'openLens' && onOpenLens) {
      onOpenLens();
    } else if (tab.actionKey === 'openVoice' && onOpenVoiceRecorder) {
      onOpenVoiceRecorder();
    } else if (tab.actionKey === 'openAssistant' && onOpenAssistant) {
      onOpenAssistant();
    } else if (tab.route) {
      navigate(tab.route);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="more-drawer-title"
    >
      <div 
        className="w-full max-w-lg bg-darkbrown text-cream rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600/30 text-red-400 border border-red-500/30 flex items-center justify-center font-bold">
              ☰
            </div>
            <div>
              <h2 id="more-drawer-title" className="text-sm font-black text-white">
                अधिक विकल्प (More Features & Tools)
              </h2>
              <p className="text-[10px] text-cream/70">
                अतिरिक्त डैशबोर्ड, सत्यापन व AI सुविधाएं
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-cream/70 hover:text-white transition"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content (Scrollable) */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          
          {/* User Status Bar */}
          {user && (
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal to-teal-dark text-white flex items-center justify-center font-black text-sm shadow-sm">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{user.displayName || user.publicName}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-teal text-white text-[9px] uppercase font-bold">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-[10px] text-cream/70 mt-0.5">
                    {user.phone || user.area || 'REC Banda'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  navigate('/profile');
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-softYellow transition"
                title="View Profile"
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Secondary Tabs Grid / List */}
          <div>
            <div className="text-[10px] uppercase font-bold text-cream/50 tracking-wider mb-2 px-1">
              पोर्टल सेवाएं एवं टूल्स (Portal Services)
            </div>
            <div className="space-y-1.5" role="tablist">
              {secondaryTabs.map((tab) => {
                const badgeCount = tab.badgeKey ? (badges[tab.badgeKey] || 0) : 0;
                return (
                  <TabItem
                    key={tab.id}
                    tab={tab}
                    isDrawer={true}
                    language={language}
                    badgeCount={badgeCount}
                    onClick={() => handleTabClick(tab)}
                  />
                );
              })}
            </div>
          </div>

          {/* Utilities & Preferences */}
          <div>
            <div className="text-[10px] uppercase font-bold text-cream/50 tracking-wider mb-2 px-1">
              प्राथमिकताएं (Preferences)
            </div>
            <div className="space-y-1.5">
              
              {/* Dark/Light Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-left text-xs font-semibold text-cream"
              >
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-softYellow" /> : <Sun className="w-4 h-4 text-softYellow" />}
                  <span>{theme === 'dark' ? 'डार्क मोड (Dark Mode: Active)' : 'लाइट मोड (Light Mode: Active)'}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              {/* Hardware & App Settings */}
              <button
                onClick={() => {
                  onClose();
                  openSettings();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-left text-xs font-semibold text-cream"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-teal" />
                  <span>सिस्टम सेटिंग्स एवं अनुमतियां (Settings)</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer / Logout */}
        {user && (
          <div className="p-3 border-t border-white/10 bg-white/5 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>लॉग आउट करें (Logout)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
