import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthKYCModal from './components/auth/AuthKYCModal';
import RegionalLanguageModal from './components/common/RegionalLanguageModal';
import VoiceRecorderModal from './components/voice/VoiceRecorderModal';
import AIAssistantWidget from './components/assistant/AIAssistantWidget';
import AILensModal from './components/lens/AILensModal';
import SettingsModal from './components/common/SettingsModal';
import AadhaarQRScannerModal from './components/aadhaar/AadhaarQRScannerModal';
import SplashScreen from './components/common/SplashScreen';
import { api } from './services/api';

// Lazy-loaded Tab Content Pages for Maximum Initial Load Speed
const HomeDashboard = lazy(() => import('./pages/HomeDashboard'));
const NewRequestPage = lazy(() => import('./pages/NewRequestPage'));
const TrackStatusPage = lazy(() => import('./pages/TrackStatusPage'));
const BorrowReturnPage = lazy(() => import('./pages/BorrowReturnPage'));
const VerifierDashboard = lazy(() => import('./pages/VerifierDashboard'));
const VolunteerAssistPage = lazy(() => import('./pages/VolunteerAssistPage'));
const AuthPortalPage = lazy(() => import('./pages/AuthPortalPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MyHistoryPage = lazy(() => import('./pages/MyHistoryPage'));
const StockDashboardPage = lazy(() => import('./pages/StockDashboardPage'));
const SmartMatchingPage = lazy(() => import('./pages/SmartMatchingPage'));

/**
 * Clean Suspense Loading Skeleton
 */
function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-10 bg-darkbrown/10 rounded-2xl w-48"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-darkbrown/10 rounded-3xl"></div>
        <div className="h-32 bg-darkbrown/10 rounded-3xl"></div>
        <div className="h-32 bg-darkbrown/10 rounded-3xl"></div>
      </div>
      <div className="h-64 bg-darkbrown/10 rounded-3xl"></div>
    </div>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      return sessionStorage.getItem('zaroorat_splash_shown') !== 'true';
    } catch (e) {
      return true;
    }
  });

  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isLensOpen, setIsLensOpen] = useState(false);
  const [lensScannedItem, setLensScannedItem] = useState(null);
  const [badges, setBadges] = useState({
    pendingRequests: 0,
    offlineQueue: 3,
    verifierQueue: 2,
    smartMatches: 1
  });

  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSplashFinish = () => {
    setShowSplash(false);
    // Flow logic:
    // If user is already logged in (valid token), skip login page and go straight to Homepage
    // If user is NOT logged in, automatically show Login page
    if (isAuthenticated) {
      if (location.pathname === '/login' || location.pathname === '/signup') {
        navigate('/', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  };

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  // Fetch dynamic badge counts where data is available
  useEffect(() => {
    let isMounted = true;
    const fetchBadgeData = async () => {
      if (!isAuthenticated) return;
      try {
        const [reqRes, offRes] = await Promise.allSettled([
          api.requests.getAll ? api.requests.getAll() : Promise.resolve([]),
          api.offline.getQueue ? api.offline.getQueue() : Promise.resolve({ queue: [] })
        ]);

        if (isMounted) {
          const newBadges = { ...badges };
          if (reqRes.status === 'fulfilled' && Array.isArray(reqRes.value)) {
            const pending = reqRes.value.filter(r => r.status === 'pending' || r.status === 'in_progress').length;
            newBadges.pendingRequests = pending;
          }
          if (offRes.status === 'fulfilled' && offRes.value?.queue) {
            newBadges.offlineQueue = offRes.value.queue.length;
          }
          setBadges(newBadges);
        }
      } catch (e) {
        // Silently use defaults
      }
    };

    fetchBadgeData();
  }, [isAuthenticated, location.pathname]);

  const handleApplyLensItem = (scannedItem) => {
    setLensScannedItem(scannedItem);
    setIsLensOpen(false);
    navigate('/borrow-return');
  };

  // During splash screen: ONLY the centered website logo is shown (no navbar, no text, no buttons)
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} duration={2500} />;
  }

  return (
    <div className="min-h-screen bg-cream text-darkbrown flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar with integrated horizontal TabBar (Rendered ONLY after login / on main pages) */}
      {!isAuthRoute && (
        <Navbar 
          onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenLens={() => setIsLensOpen(true)}
          badges={badges}
        />
      )}

      {/* Main Tab Content Viewport with lazy loading */}
      <main className={`flex-1 ${isAuthenticated && !isAuthRoute ? 'pb-20 md:pb-6' : ''}`}>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            {/* Public Auth Portal Routes (Tab bar is completely hidden) */}
            <Route path="/login" element={<AuthPortalPage initialTab="login" />} />
            <Route path="/signup" element={<AuthPortalPage initialTab="signup" />} />

            {/* Tab 1: Home Dashboard */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <HomeDashboard 
                    onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
                    onOpenAssistant={() => setIsAssistantOpen(true)}
                    onOpenLens={() => setIsLensOpen(true)}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomeDashboard 
                    onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
                    onOpenAssistant={() => setIsAssistantOpen(true)}
                    onOpenLens={() => setIsLensOpen(true)}
                  />
                </ProtectedRoute>
              } 
            />

            {/* Tab 2: Requests */}
            <Route 
              path="/requests" 
              element={
                <ProtectedRoute>
                  <HomeDashboard 
                    onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
                    onOpenAssistant={() => setIsAssistantOpen(true)}
                    onOpenLens={() => setIsLensOpen(true)}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/new-request" 
              element={
                <ProtectedRoute>
                  <NewRequestPage 
                    onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
                  />
                </ProtectedRoute>
              } 
            />

            {/* Tab 3: Items & Borrow */}
            <Route 
              path="/borrow-return" 
              element={
                <ProtectedRoute>
                  <BorrowReturnPage 
                    onOpenLens={() => setIsLensOpen(true)}
                    prefilledLensItem={lensScannedItem}
                    onClearPrefill={() => setLensScannedItem(null)}
                  />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/items" 
              element={
                <ProtectedRoute>
                  <BorrowReturnPage 
                    onOpenLens={() => setIsLensOpen(true)}
                    prefilledLensItem={lensScannedItem}
                    onClearPrefill={() => setLensScannedItem(null)}
                  />
                </ProtectedRoute>
              } 
            />

            {/* Tab 4: My History */}
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <MyHistoryPage />
                </ProtectedRoute>
              } 
            />

            {/* Tab 5: Stock Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <StockDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <StockDashboardPage />
                </ProtectedRoute>
              } 
            />

            {/* Tab 6: Smart Matching */}
            <Route 
              path="/smart-matching" 
              element={
                <ProtectedRoute>
                  <SmartMatchingPage />
                </ProtectedRoute>
              } 
            />

            {/* Tab 7: Verifier Panel (Strictly protected for verifier / admin roles) */}
            <Route 
              path="/verifier" 
              element={
                <ProtectedRoute allowedRoles={['verifier', 'admin']}>
                  <VerifierDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Tab 8: Offline Queue (Volunteer Assist) */}
            <Route 
              path="/volunteer-assist" 
              element={
                <ProtectedRoute>
                  <VolunteerAssistPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/offline" 
              element={
                <ProtectedRoute>
                  <VolunteerAssistPage />
                </ProtectedRoute>
              } 
            />

            {/* Profile & Status */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="/requests/:id/status" element={<TrackStatusPage />} />

            {/* Wildcard Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Responsive Footer (Rendered on main dashboard & inner pages) */}
      {!isAuthRoute && <Footer />}

      {/* Mobile Fixed Bottom Nav (< 768px, shown ONLY for logged in users) */}
      {isAuthenticated && !isAuthRoute && (
        <BottomNav 
          onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenLens={() => setIsLensOpen(true)}
          badges={badges}
        />
      )}

      {/* Global Modals */}
      <AuthKYCModal />
      <RegionalLanguageModal />
      <VoiceRecorderModal 
        isOpen={isVoiceRecorderOpen} 
        onClose={() => setIsVoiceRecorderOpen(false)} 
      />
      <AIAssistantWidget 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
        onOpen={() => setIsAssistantOpen(true)}
      />
      <AILensModal
        isOpen={isLensOpen}
        onClose={() => setIsLensOpen(false)}
        onApplyToLend={handleApplyLensItem}
      />
      <SettingsModal />
      <AadhaarQRScannerModal />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}
