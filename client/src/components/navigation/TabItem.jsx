import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable TabItem Component
 * Follows WAI-ARIA tab pattern:
 * role="tab", aria-selected, aria-controls, tabindex, keyboard support
 * Bilingual display (Hindi + English) with red accent matching dark theme
 */
export default function TabItem({
  tab,
  isActive = false,
  language = 'hi',
  badgeCount = 0,
  onClick,
  onKeyDown,
  isDrawer = false,
  tabIndex = 0,
  innerRef
}) {
  const Icon = tab.icon;
  const isHindi = language === 'hi' || language === 'bho' || language === 'awa' || language === 'bun';
  
  // Primary label follows selected language, secondary label shows the alternative language
  const primaryLabel = isHindi ? tab.labelHi : tab.labelEn;
  const secondaryLabel = isHindi ? tab.labelEn : tab.labelHi;

  const content = (
    <>
      <div className="relative shrink-0 flex items-center justify-center">
        <Icon className={`transition-transform duration-200 ${
          isDrawer 
            ? 'w-5 h-5' 
            : 'w-4 h-4'
        } ${isActive ? 'scale-110' : 'group-hover:scale-105 opacity-80'}`} />
        
        {/* Dynamic Numeric Badge */}
        {badgeCount > 0 && (
          <span 
            className="absolute -top-1.5 -right-2 px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] font-black leading-tight shadow-sm animate-pulse"
            aria-label={`${badgeCount} unread items`}
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </div>

      <div className={`flex flex-col text-left leading-tight truncate ${isDrawer ? 'min-w-0' : ''}`}>
        <span className={`truncate text-xs font-bold ${isActive ? 'font-black' : ''}`}>
          {primaryLabel}
        </span>
        <span className={`truncate text-[9px] opacity-60 tracking-tight font-medium hidden sm:inline`}>
          {secondaryLabel}
        </span>
      </div>
    </>
  );

  // If in Drawer (Mobile full-width sheet)
  if (isDrawer) {
    const drawerClasses = `w-full flex items-center justify-between p-3 rounded-2xl transition group text-left ${
      isActive
        ? 'bg-red-900/40 text-red-400 border border-red-500/30 font-bold shadow-sm'
        : 'text-cream/80 hover:text-white hover:bg-white/10'
    }`;

    if (tab.route) {
      return (
        <Link
          to={tab.route}
          onClick={onClick}
          className={drawerClasses}
          role="tab"
          aria-selected={isActive}
          id={`tab-${tab.id}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {content}
          </div>
          {badgeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold">
              {badgeCount}
            </span>
          )}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className={drawerClasses}
        role="tab"
        aria-selected={isActive}
        id={`tab-${tab.id}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {content}
        </div>
      </button>
    );
  }

  // Desktop / Tablet Horizontal TabBar Item
  const desktopClasses = `group relative shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-red-500/70 ${
    isActive
      ? 'bg-red-950/60 text-white font-extrabold shadow-md border-b-2 border-red-500 ring-1 ring-red-500/30'
      : 'text-cream/75 hover:text-white hover:bg-white/10'
  }`;

  if (tab.route) {
    return (
      <Link
        ref={innerRef}
        to={tab.route}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${tab.id}`}
        id={`tab-${tab.id}`}
        tabIndex={tabIndex}
        onKeyDown={onKeyDown}
        className={desktopClasses}
        title={`${tab.labelHi} (${tab.labelEn}) - ${tab.descriptionHi || ''}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={innerRef}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${tab.id}`}
      id={`tab-${tab.id}`}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={desktopClasses}
      title={`${tab.labelHi} (${tab.labelEn}) - ${tab.descriptionHi || ''}`}
    >
      {content}
    </button>
  );
}
