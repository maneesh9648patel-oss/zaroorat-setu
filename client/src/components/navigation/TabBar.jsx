import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTabsForRole } from '../../config/navigationTabs';
import TabItem from './TabItem';

/**
 * Desktop & Tablet Horizontal TabBar Component
 * Fully keyboard accessible (Arrow keys, Tab, Enter), WAI-ARIA tablist
 * Scrollable with smooth gradient fade edges on tablet viewports
 */
export default function TabBar({
  onOpenVoiceRecorder,
  onOpenAssistant,
  onOpenLens,
  badges = {}
}) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const tabListRef = useRef(null);
  const tabItemRefs = useRef([]);

  // Filter tabs according to current authenticated user's role
  const accessibleTabs = getTabsForRole(user?.role || 'needer');

  // Determine active tab based on current pathname
  const currentPath = location.pathname;
  const activeIndex = accessibleTabs.findIndex(t => {
    if (!t.route) return false;
    if (t.route === currentPath) return true;
    if (t.aliasRoutes && t.aliasRoutes.includes(currentPath)) return true;
    if (t.route !== '/' && currentPath.startsWith(t.route)) return true;
    return false;
  });

  // Action dispatcher for modal tabs
  const handleTabAction = (tab) => {
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

  // Keyboard accessibility handler for WAI-ARIA tablist
  const handleKeyDown = (e, index) => {
    let targetIndex = -1;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      targetIndex = (index + 1) % accessibleTabs.length;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      targetIndex = (index - 1 + accessibleTabs.length) % accessibleTabs.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = accessibleTabs.length - 1;
    }

    if (targetIndex >= 0) {
      const targetTab = accessibleTabs[targetIndex];
      const targetEl = tabItemRefs.current[targetIndex];
      if (targetEl) {
        targetEl.focus();
      }
      handleTabAction(targetTab);
    }
  };

  return (
    <div className="w-full bg-darkbrown/90 border-t border-white/10 relative">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 relative">
        
        {/* Left Fade Edge (Visual affordance for scrollable tablet widths) */}
        <div 
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-darkbrown to-transparent z-10 md:block hidden"
          aria-hidden="true"
        />

        {/* Tab List Container */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="ZarooratSetu Navigation Tabs"
          className="flex items-center gap-1 sm:gap-1.5 py-1.5 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {accessibleTabs.map((tab, idx) => {
            const isTabActive = activeIndex === idx;
            const badgeCount = tab.badgeKey ? (badges[tab.badgeKey] || 0) : 0;

            return (
              <TabItem
                key={tab.id}
                tab={tab}
                innerRef={(el) => (tabItemRefs.current[idx] = el)}
                isActive={isTabActive}
                language={language}
                badgeCount={badgeCount}
                tabIndex={isTabActive ? 0 : -1}
                onClick={() => handleTabAction(tab)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              />
            );
          })}
        </div>

        {/* Right Fade Edge */}
        <div 
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-darkbrown to-transparent z-10 md:block hidden"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
