import React, { useState, useEffect } from 'react';
import BrandLogo from './BrandLogo';

/**
 * SplashScreen Component
 * 
 * Rules & Features:
 * 1. Website open hote hi SIRF logo screen ke center me dikhta hai (no navbar, no text, no buttons).
 * 2. Soft fade-in animation ke sath render hota hai.
 * 3. ~2.5 seconds tak dikhta hai, phir soft fade-out ke sath finish hota hai.
 * 4. sessionStorage ('zaroorat_splash_shown') use karta hai taaki har session me sirf ek baar dikhe.
 * 
 * Custom Logo Support:
 * - Default: renders the project's vector BrandLogo / `/logo.svg`
 * - Agar aap apna image file use karna chahein (jaise `/assets/logo.png`),
 *   to `customLogoSrc` prop pass karein ya public folder me logo.png rakh dein.
 */
export default function SplashScreen({ 
  onFinish, 
  duration = 2500,
  customLogoSrc = null 
}) {
  const [visible, setVisible] = useState(() => {
    try {
      return sessionStorage.getItem('zaroorat_splash_shown') !== 'true';
    } catch (e) {
      return true;
    }
  });

  const [isFadingOut, setIsFadingOut] = useState(false);
  const [logoMounted, setLogoMounted] = useState(false);

  useEffect(() => {
    // If splash was already shown in this browser session, finish immediately
    if (!visible) {
      if (onFinish) onFinish();
      return;
    }

    // Trigger soft fade-in animation immediately on mount
    const mountTimer = setTimeout(() => {
      setLogoMounted(true);
    }, 60);

    // Start soft fade-out ~350ms before duration ends
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(500, duration - 350));

    // Finish splash, record in sessionStorage, and invoke callback
    const finishTimer = setTimeout(() => {
      try {
        sessionStorage.setItem('zaroorat_splash_shown', 'true');
      } catch (e) {
        // ignore
      }
      setVisible(false);
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [visible, duration, onFinish]);

  if (!visible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-darkbrown text-cream overflow-hidden transition-opacity duration-350 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Website Splash Screen"
    >
      {/* Subtle Ambient Radial Glow */}
      <div 
        className="absolute w-72 h-72 sm:w-96 sm:h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div 
        className="absolute w-60 h-60 sm:w-80 sm:h-80 bg-teal/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Centered Logo ONLY (No text, no navbar, no buttons) */}
      <div 
        className={`relative z-10 flex items-center justify-center transform transition-all duration-1000 ease-out ${
          logoMounted 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-90 translate-y-3'
        }`}
      >
        {customLogoSrc ? (
          <img 
            src={customLogoSrc} 
            alt="Website Logo" 
            className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-2xl" 
          />
        ) : (
          <div className="p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md">
            <BrandLogo size="xl" className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl" />
          </div>
        )}
      </div>
    </div>
  );
}
