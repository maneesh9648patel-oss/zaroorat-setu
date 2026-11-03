import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPrimaryMobileTabs } from '../../config/navigationTabs';
import MoreDrawer from '../navigation/MoreDrawer';

/**
 * Mobile Fixed Bottom Tab Bar (< 768px)
 * Displays top 4 primary tabs (Home, Requests, Items & Borrow, My History) + 1 'More' Tab
 * Red accent active tab highlight matching dark theme.
 * Bilingual labels and badges support.
 */
export default function BottomNav({
  onOpenVoiceRecorder,
  onOpenAssistant,
  onOpenLens,
  badges = {}
}) {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // If user is not logged in, do NOT render the bottom tab bar
  if (!isAuthenticated || !user) {
    return null;
  }

  const isHindi = language === 'hi' || language === 'bho' || language === 'awa' || language === 'bun';
  const primaryTabs = getPrimaryMobileTabs(user?.role || 'needer');

  return (
    <>
      <nav 
        role="tablist"
        aria-label="Mobile Navigation Tabs"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-darkbrown/95 backdrop-blur-md border-t border-white/10 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.35)]"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
          {/* Primary Mobile Tabs */}
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const primaryLabel = isHindi ? tab.labelHi : tab.labelEn;
            const badgeCount = tab.badgeKey ? (badges[tab.badgeKey] || 0) : 0;
            const isActive = tab.route === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(tab.route);

            return (
              <NavLink
                key={tab.id}
                to={tab.route}
                end={tab.route === '/'}
                role="tab"
                aria-selected={isActive}
                id={`bottom-tab-${tab.id}`}
                className={`relative flex flex-col items-center justify-center h-full transition-colors duration-150 ${
                  isActive 
                    ? 'text-red-400 font-black' 
                    : 'text-cream/60 hover:text-cream'
                }`}
              >
                {/* Active Indicator Top Line */}
                {isActive && (
                  <span 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-red-500 shadow-sm shadow-red-500/50" 
                    aria-hidden="true" 
                  />
                )}

                <div className="relative mb-0.5">
                  <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                  {badgeCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-red-600 text-white text-[8px] font-black leading-tight shadow-sm animate-pulse"
                      aria-label={`${badgeCount} unread`}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] leading-tight truncate max-w-[62px]">
                  {primaryLabel}
                </span>
              </NavLink>
            );
          })}

          {/* 5th Tab: "More (अधिक)" */}
          <button
            type="button"
            role="tab"
            aria-selected={isMoreOpen}
            aria-haspopup="dialog"
            onClick={() => setIsMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center h-full transition-colors duration-150 ${
              isMoreOpen 
                ? 'text-red-400 font-black' 
                : 'text-cream/60 hover:text-cream'
            }`}
          >
            {isMoreOpen && (
              <span 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-red-500 shadow-sm shadow-red-500/50" 
                aria-hidden="true" 
              />
            )}
            <div className="relative mb-0.5">
              <MoreHorizontal className="w-5 h-5" />
              {/* If secondary tabs like offline queue or verifier have items, show small dot */}
              {((badges.offlineQueue || 0) + (badges.verifierQueue || 0)) > 0 && (
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-darkbrown animate-pulse" />
              )}
            </div>
            <span className="text-[10px] leading-tight">
              {isHindi ? 'अधिक' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-Up More Drawer */}
      <MoreDrawer
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        onOpenVoiceRecorder={onOpenVoiceRecorder}
        onOpenAssistant={onOpenAssistant}
        onOpenLens={onOpenLens}
        badges={badges}
      />
    </>
  );
}
