import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Theme: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('zaroorat_theme') || 'light';
  });

  // Hardware permissions: 'allowed' | 'not_allowed'
  const [micPermission, setMicPermissionState] = useState(() => {
    return localStorage.getItem('zaroorat_mic_perm') || 'allowed';
  });

  const [cameraPermission, setCameraPermissionState] = useState(() => {
    return localStorage.getItem('zaroorat_cam_perm') || 'allowed';
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Apply theme to HTML root element
  useEffect(() => {
    localStorage.setItem('zaroorat_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Persist microphone permission setting
  const setMicPermission = (val) => {
    setMicPermissionState(val);
    localStorage.setItem('zaroorat_mic_perm', val);
  };

  const toggleMicPermission = () => {
    const next = micPermission === 'allowed' ? 'not_allowed' : 'allowed';
    setMicPermission(next);
  };

  // Persist camera permission setting
  const setCameraPermission = (val) => {
    setCameraPermissionState(val);
    localStorage.setItem('zaroorat_cam_perm', val);
  };

  const toggleCameraPermission = () => {
    const next = cameraPermission === 'allowed' ? 'not_allowed' : 'allowed';
    setCameraPermission(next);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const openSettings = () => setIsSettingsModalOpen(true);
  const closeSettings = () => setIsSettingsModalOpen(false);

  const resetSettings = () => {
    setTheme('light');
    setMicPermission('allowed');
    setCameraPermission('allowed');
    localStorage.removeItem('zaroorat_theme');
    localStorage.removeItem('zaroorat_mic_perm');
    localStorage.removeItem('zaroorat_cam_perm');
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        micPermission,
        setMicPermission,
        toggleMicPermission,
        cameraPermission,
        setCameraPermission,
        toggleCameraPermission,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        openSettings,
        closeSettings,
        resetSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}