import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import BottomNav from './components/common/BottomNav';
import AuthKYCModal from './components/auth/AuthKYCModal';
import RegionalLanguageModal from './components/common/RegionalLanguageModal';
import VoiceRecorderModal from './components/voice/VoiceRecorderModal';
import AIAssistantWidget from './components/assistant/AIAssistantWidget';
import HomeDashboard from './pages/HomeDashboard';
import NewRequestPage from './pages/NewRequestPage';
import TrackStatusPage from './pages/TrackStatusPage';
import BorrowReturnPage from './pages/BorrowReturnPage';
import VerifierDashboard from './pages/VerifierDashboard';
import VolunteerAssistPage from './pages/VolunteerAssistPage';

function AppContent() {
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream text-darkbrown flex flex-col font-sans selection:bg-terracotta selection:text-white">
      <Navbar 
        onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />
      <main className="flex-1">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomeDashboard 
                onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
                onOpenAssistant={() => setIsAssistantOpen(true)}
              />
            } 
          />
          <Route 
            path="/requests" 
            element={
              <HomeDashboard 
                onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
                onOpenAssistant={() => setIsAssistantOpen(true)}
              />
            } 
          />
          <Route 
            path="/new-request" 
            element={
              <NewRequestPage 
                onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)} 
              />
            } 
          />
          <Route path="/requests/:id/status" element={<TrackStatusPage />} />
          <Route path="/borrow-return" element={<BorrowReturnPage />} />
          <Route path="/verifier" element={<VerifierDashboard />} />
          <Route path="/volunteer-assist" element={<VolunteerAssistPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
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
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
