import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, Box, User, CheckSquare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export default function BottomNav() {
  const { t } = useLanguage();
  const { user, openAuthModal } = useAuth();

  const isVerifierOrAdmin = user?.role === 'verifier' || user?.role === 'admin';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-darkbrown/10 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto grid grid-cols-4 sm:grid-cols-5 h-16 items-center px-2">
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
          <span className="text-[11px] leading-none">{t('navHome')}</span>
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
          <span className="text-[11px] leading-none">{t('navRequests')}</span>
        </NavLink>

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
          <span className="text-[11px] leading-none">{t('navItems')}</span>
        </NavLink>

        {/* Verifier Panel (If Verifier/Admin) */}
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
            <span className="text-[11px] leading-none text-teal font-semibold">Verifier</span>
          </NavLink>
        ) : null}

        {/* Profile */}
        <button
          onClick={() => openAuthModal(1)}
          className="flex flex-col items-center justify-center h-full text-darkbrown/60 hover:text-darkbrown transition"
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-none">{t('navProfile')}</span>
        </button>
      </div>
    </nav>
  );
}
