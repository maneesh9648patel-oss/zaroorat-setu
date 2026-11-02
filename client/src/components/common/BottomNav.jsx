import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Box, User, CheckSquare, Camera } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function BottomNav({ onOpenLens }) {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();

  const isVerifierOrAdmin = user?.role === 'verifier' || user?.role === 'admin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-darkbrown/10 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16 items-center px-1">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center h-full transition ${
              isActive ? 'text-terracotta font-extrabold' : 'text-darkbrown/60 hover:text-darkbrown'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">{t('navHome')}</span>
        </NavLink>

        {/* Requests */}
        <NavLink
          to="/requests"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center h-full transition ${
              isActive ? 'text-terracotta font-extrabold' : 'text-darkbrown/60 hover:text-darkbrown'
            }`
          }
        >
          <ClipboardList className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">{t('navRequests')}</span>
        </NavLink>

        {/* Center AI Lens Button */}
        <button
          onClick={onOpenLens}
          className="flex flex-col items-center justify-center -mt-4 group tap-target"
          title="Open AI Lens Camera (वस्तु स्कैनर व 50% धरोहर)"
          aria-label="AI Lens Camera"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-darkbrown via-teal to-terracotta text-white flex items-center justify-center shadow-lg group-active:scale-95 transition border-2 border-white">
            <Camera className="w-5 h-5 text-softYellow" />
          </div>
          <span className="text-[10px] font-black text-darkbrown mt-0.5">AI Lens</span>
        </button>

        {/* Items (Borrow & Return) */}
        <NavLink
          to="/borrow-return"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center h-full transition ${
              isActive ? 'text-terracotta font-extrabold' : 'text-darkbrown/60 hover:text-darkbrown'
            }`
          }
        >
          <Box className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">{t('navItems')}</span>
        </NavLink>

        {/* Profile / Verifier */}
        {isVerifierOrAdmin ? (
          <NavLink
            to="/verifier"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full transition ${
                isActive ? 'text-terracotta font-extrabold' : 'text-darkbrown/60 hover:text-darkbrown'
              }`
            }
          >
            <CheckSquare className="w-5 h-5 mb-0.5 text-teal" />
            <span className="text-[10px] leading-none text-teal font-semibold">Verifier</span>
          </NavLink>
        ) : (
          <NavLink
            to={user ? "/profile" : "/login"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center h-full transition ${
                isActive ? 'text-terracotta font-extrabold' : 'text-darkbrown/60 hover:text-darkbrown'
              }`
            }
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] leading-none">{user ? t('navProfile') : 'Login'}</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
