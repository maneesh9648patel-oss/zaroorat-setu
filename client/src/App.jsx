import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthKYCModal from './components/auth/AuthKYCModal';
import RegionalLanguageModal from './components/common/RegionalLanguageModal';
import VoiceRecorderModal from './components/voice/VoiceRecorderModal';
import AIAssistantWidget from './components/assistant/AIAssistantWidget';
import AILensModal from './components/lens/AILensModal';
import SettingsModal from './components/common/SettingsModal';
import HomeDashboard from './pages/HomeDashboard';
import NewRequestPage from './pages/NewRequestPage';
import TrackStatusPage from './pages/TrackStatusPage';
import BorrowReturnPage from './pages/BorrowReturnPage';
import VerifierDashboard from './pages/VerifierDashboard';
import VolunteerAssistPage from './pages/VolunteerAssistPage';
import AuthPortalPage from './pages/AuthPortalPage';
import ProfilePage from './pages/ProfilePage';
import MyHistoryPage from './pages/MyHistoryPage';
import StockDashboardPage from './pages/StockDashboardPage';
import AadhaarQRScannerModal from './components/aadhaar/AadhaarQRScannerModal';

function AppContent() {
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isLensOpen, setIsLensOpen] = useState(false);
  const [lensScannedItem, setLensScannedItem] = useState(null);
  const navigate = useNavigate();

  const handleApplyLensItem = (scannedItem) => {
    setLensScannedItem(scannedItem);
    setIsLensOpen(false);
    navigate('/borrow-return');
  };

  return (
    <div className="min-h-screen bg-cream text-darkbrown flex flex-col font-sans selection:bg-terracotta selection:text-white">
      <Navbar 
        onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenLens={() => setIsLensOpen(true)}
      />
      <main className="flex-1">
        <Routes>
          {/* Public Auth Portal Routes */}
          <Route path="/login" element={<AuthPortalPage initialTab="login" />} />
          <Route path="/signup" element={<AuthPortalPage initialTab="signup" />} />

          {/* Protected Routes: Only logged-in users can access dashboard & give/take item pages */}
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
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <MyHistoryPage />
              </ProtectedRoute>
            } 
          />
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

          {/* Other App Routes */}
          <Route path="/requests/:id/status" element={<TrackStatusPage />} />
          <Route path="/verifier" element={<VerifierDashboard />} />
          <Route path="/volunteer-assist" element={<VolunteerAssistPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav onOpenLens={() => setIsLensOpen(true)} />
      <AuthKYCModal />
      <RegionalLanguageModal />
      <VoiceRecorderModal 
        isOpen={isVoiceRecorderOpen} 
        onClose={() => setIsVoiceRecorderOpen(false)} 
      />
      {/* 24/7 AI Setu Sahayak Assistant Widget */}
      <AIAssistantWidget 
        isOpen={isAssistantOpen} 
        onClose={() => setIsAssistantOpen(false)} 
        onOpen={() => setIsAssistantOpen(true)}
      />
      {/* AI Lens Camera Scanner Modal */}
      <AILensModal
        isOpen={isLensOpen}
        onClose={() => setIsLensOpen(false)}
        onApplyToLend={handleApplyLensItem}
      />
      {/* Settings Modal (Theme Dark/Light & Hardware Permissions) */}
      <SettingsModal />
      {/* mAadhaar / UIDAI Secure QR Verification Modal */}
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
