import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // 1. Display / Theme: default false (Light mode original website colors)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('zaroorat_theme') === 'dark';
  });

  // 2. Hardware permissions (Boolean switches)
  const [micPermission, setMicPermissionState] = useState(() => {
    const stored = localStorage.getItem('zaroorat_mic_perm');
    return stored === null ? true : stored === 'true' || stored === 'allowed';
  });

  const [cameraPermission, setCameraPermissionState] = useState(() => {
    const stored = localStorage.getItem('zaroorat_cam_perm');
    return stored === null ? true : stored === 'true' || stored === 'allowed';
  });

  // 3. Audio & Voice Sound Output
  const [soundOutput, setSoundOutput] = useState(() => {
    const stored = localStorage.getItem('zaroorat_sound_output');
    return stored === null ? true : stored === 'true';
  });

  // 4. Accessibility & Performance
  const [largeFont, setLargeFont] = useState(() => {
    return localStorage.getItem('zaroorat_large_font') === 'true';
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    return localStorage.getItem('zaroorat_reduce_motion') === 'true';
  });

  // 5. Notifications & Alerts
  const [urgentAlerts, setUrgentAlerts] = useState(() => {
    const stored = localStorage.getItem('zaroorat_urgent_alerts');
    return stored === null ? true : stored === 'true';
  });

  const [returnReminders, setReturnReminders] = useState(() => {
    const stored = localStorage.getItem('zaroorat_return_reminders');
    return stored === null ? true : stored === 'true';
  });

  // 6. Privacy & Location
  const [maskPhone, setMaskPhone] = useState(() => {
    const stored = localStorage.getItem('zaroorat_mask_phone');
    return stored === null ? true : stored === 'true';
  });

  const [autoLocation, setAutoLocation] = useState(() => {
    const stored = localStorage.getItem('zaroorat_auto_location');
    return stored === null ? true : stored === 'true';
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync Dark Mode with Document Element
  useEffect(() => {
    localStorage.setItem('zaroorat_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync Large Font
  useEffect(() => {
    localStorage.setItem('zaroorat_large_font', String(largeFont));
    if (largeFont) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }
  }, [largeFont]);

  // Sync Hardware permissions
  const setMicPermission = (val) => {
    setMicPermissionState(val);
    localStorage.setItem('zaroorat_mic_perm', String(val));
  };

  const toggleMicPermission = () => {
    setMicPermission(!micPermission);
  };

  const setCameraPermission = (val) => {
    setCameraPermissionState(val);
    localStorage.setItem('zaroorat_cam_perm', String(val));
  };

  const toggleCameraPermission = () => {
    setCameraPermission(!cameraPermission);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleSoundOutput = () => {
    const next = !soundOutput;
    setSoundOutput(next);
    localStorage.setItem('zaroorat_sound_output', String(next));
  };

  const toggleLargeFont = () => {
    setLargeFont(prev => !prev);
  };

  const toggleReduceMotion = () => {
    const next = !reduceMotion;
    setReduceMotion(next);
    localStorage.setItem('zaroorat_reduce_motion', String(next));
  };

  const toggleUrgentAlerts = () => {
    const next = !urgentAlerts;
    setUrgentAlerts(next);
    localStorage.setItem('zaroorat_urgent_alerts', String(next));
  };

  const toggleReturnReminders = () => {
    const next = !returnReminders;
    setReturnReminders(next);
    localStorage.setItem('zaroorat_return_reminders', String(next));
  };

  const toggleMaskPhone = () => {
    const next = !maskPhone;
    setMaskPhone(next);
    localStorage.setItem('zaroorat_mask_phone', String(next));
  };

  const toggleAutoLocation = () => {
    const next = !autoLocation;
    setAutoLocation(next);
    localStorage.setItem('zaroorat_auto_location', String(next));
  };

  const openSettings = () => setIsSettingsModalOpen(true);
  const closeSettings = () => setIsSettingsModalOpen(false);

  // Restore 100% original defaults
  const resetToOriginal = () => {
    setDarkMode(false);
    setMicPermission(true);
    setCameraPermission(true);
    setSoundOutput(true);
    setLargeFont(false);
    setReduceMotion(false);
    setUrgentAlerts(true);
    setReturnReminders(true);
    setMaskPhone(true);
    setAutoLocation(true);
    localStorage.removeItem('zaroorat_theme');
    localStorage.removeItem('zaroorat_mic_perm');
    localStorage.removeItem('zaroorat_cam_perm');
    localStorage.removeItem('zaroorat_sound_output');
    localStorage.removeItem('zaroorat_large_font');
    localStorage.removeItem('zaroorat_reduce_motion');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('large-text');
  };

  return (
    <SettingsContext.Provider
      value={{
        theme: darkMode ? 'dark' : 'light',
        darkMode,
        setDarkMode,
        toggleDarkMode,
        toggleTheme: toggleDarkMode,
        micPermission: micPermission ? 'allowed' : 'not_allowed',
        isMicAllowed: micPermission,
        setMicPermission,
        toggleMicPermission,
        cameraPermission: cameraPermission ? 'allowed' : 'not_allowed',
        isCameraAllowed: cameraPermission,
        setCameraPermission,
        toggleCameraPermission,
        soundOutput,
        toggleSoundOutput,
        largeFont,
        toggleLargeFont,
        reduceMotion,
        toggleReduceMotion,
        urgentAlerts,
        toggleUrgentAlerts,
        returnReminders,
        toggleReturnReminders,
        maskPhone,
        toggleMaskPhone,
        autoLocation,
        toggleAutoLocation,
        isSettingsModalOpen,
        setIsSettingsModalOpen,
        openSettings,
        closeSettings,
        resetSettings: resetToOriginal,
        resetToOriginal
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