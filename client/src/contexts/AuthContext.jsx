import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zaroorat_user');
    return saved ? JSON.parse(saved) : {
      uid: "usr_aarav",
      displayName: "Aarav Kumar",
      publicName: "Aarav K.",
      role: "needer",
      kycLevel: "level_1",
      kycStatus: "basic_verified",
      area: "Civil Lines, Banda",
      city: "Banda"
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('zaroorat_token') || 'tok_usr_aarav');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('zaroorat_token', token);
    } else {
      localStorage.removeItem('zaroorat_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('zaroorat_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('zaroorat_user');
    }
  }, [user]);

  // Actions
  const openAuthModal = (step = 1) => {
    setAuthStep(step);
    setIsAuthModalOpen(true);
    setError(null);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setError(null);
  };

  const sendOtp = async (phone) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.sendOtp(phone);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const verifyOtp = async (phone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.verifyOtp(phone, otp);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const verifyEmail = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.verifyEmail(email);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.updateProfile(profileData);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const submitTier2Id = async (docData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.uploadIdPlaceholder(docData);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const switchRole = async (targetRole) => {
    setLoading(true);
    try {
      const data = await api.auth.switchDemoUser(targetRole);
      setToken(data.token);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      // Local fallback for quick mock
      const roleMap = {
        needer: { uid: "usr_aarav", displayName: "Aarav Kumar", publicName: "Aarav K.", role: "needer", kycLevel: "level_1", kycStatus: "basic_verified", area: "Civil Lines, Banda" },
        ngo: { uid: "usr_ngo_01", displayName: "Seva Sahayata Trust", publicName: "Seva Sahayata Trust", role: "ngo", kycLevel: "level_3", kycStatus: "fully_verified", area: "Civil Lines, Banda" },
        donor: { uid: "usr_donor_priya", displayName: "Priya Verma", publicName: "Priya V.", role: "donor", kycLevel: "level_2", kycStatus: "fully_verified", area: "District Hospital Banda" },
        verifier: { uid: "usr_verifier_01", displayName: "Manoj Tripathi", publicName: "Manoj T. (Reviewer)", role: "verifier", kycLevel: "level_2", kycStatus: "fully_verified", area: "REC Banda" },
        admin: { uid: "usr_admin", displayName: "Admin ZarooratSetu", publicName: "Platform Admin", role: "admin", kycLevel: "level_3", kycStatus: "fully_verified", area: "REC Banda" }
      };
      const fallbackUser = roleMap[targetRole] || roleMap.needer;
      setToken(`tok_${fallbackUser.uid}`);
      setUser(fallbackUser);
      setLoading(false);
      return { success: true, user: fallbackUser };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('zaroorat_user');
    localStorage.removeItem('zaroorat_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        kycLevel: user?.kycLevel || 'none',
        kycStatus: user?.kycStatus || 'unverified',
        isAuthModalOpen,
        authStep,
        setAuthStep,
        openAuthModal,
        closeAuthModal,
        sendOtp,
        verifyOtp,
        verifyEmail,
        updateProfile,
        submitTier2Id,
        switchRole,
        logout,
        loading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
