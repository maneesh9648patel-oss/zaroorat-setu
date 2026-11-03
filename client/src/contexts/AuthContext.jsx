import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zaroorat_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('zaroorat_token') || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup' | 'otp' | 'kyc'
  const [authStep, setAuthStep] = useState(1);
  const [isAadhaarModalOpen, setIsAadhaarModalOpen] = useState(false);
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
  const openAuthModal = (step = 1, mode = 'login') => {
    setAuthStep(step);
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setError(null);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setError(null);
  };

  const openAadhaarModal = () => {
    setIsAadhaarModalOpen(true);
    setError(null);
  };

  const closeAadhaarModal = () => {
    setIsAadhaarModalOpen(false);
    setError(null);
  };

  // mAadhaar QR Verification
  const verifyAadhaarQr = async (qrData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.aadhaar.verifyQr(qrData);
      setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  // 1. Password Signup
  const signup = async ({ name, phone, email, password, role, area }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.signup({ name, phone, email, password, role, area });
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

  // 2. Password Login (Email or Phone)
  const login = async ({ identifier, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.login({ identifier, password });
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

  // 3. Logout
  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('zaroorat_user');
    localStorage.removeItem('zaroorat_token');
  };

  // OTP Verification Methods
  const sendOtp = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.sendOtp(payload);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const resendOtp = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.resendOtp(payload);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const verifyOtp = async (payload, otpCode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.verifyOtp(payload, otpCode);
      if (data.token) setToken(data.token);
      if (data.user) setUser(data.user);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const resetPassword = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.resetPassword(payload);
      if (data.token) setToken(data.token);
      if (data.user) setUser(data.user);
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
      const roleMap = {
        needer: { uid: "usr_aarav", displayName: "Aarav Kumar", publicName: "Aarav K.", email: "aarav.banda@example.com", phone: "+919876543210", role: "needer", kycLevel: "level_1", kycStatus: "basic_verified", area: "Civil Lines, Banda" },
        ngo: { uid: "usr_ngo_01", displayName: "Seva Sahayata Trust", publicName: "Seva Sahayata Trust", email: "seva.banda@example.org", phone: "+919415112345", role: "ngo", kycLevel: "level_3", kycStatus: "fully_verified", area: "Civil Lines, Banda" },
        donor: { uid: "usr_donor_priya", displayName: "Priya Verma", publicName: "Priya V.", email: "priya.v@example.com", phone: "+919839054321", role: "donor", kycLevel: "level_2", kycStatus: "fully_verified", area: "District Hospital Banda" },
        verifier: { uid: "usr_verifier_01", displayName: "Manoj Tripathi", publicName: "Manoj T. (Reviewer)", email: "verifier01@zarooratsetu.org", phone: "+919450099887", role: "verifier", kycLevel: "level_2", kycStatus: "fully_verified", area: "REC Banda" },
        admin: { uid: "usr_admin", displayName: "Admin ZarooratSetu", publicName: "Platform Admin", email: "admin@zarooratsetu.org", phone: "+919999900000", role: "admin", kycLevel: "level_3", kycStatus: "fully_verified", area: "REC Banda" }
      };
      const fallbackUser = roleMap[targetRole] || roleMap.needer;
      setToken(`tok_${fallbackUser.uid}`);
      setUser(fallbackUser);
      setLoading(false);
      return { success: true, user: fallbackUser };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isAadhaarVerified: Boolean(user?.aadhaarVerification?.verified),
        kycLevel: user?.kycLevel || 'none',
        kycStatus: user?.kycStatus || 'unverified',
        isAuthModalOpen,
        authMode,
        setAuthMode,
        authStep,
        setAuthStep,
        openAuthModal,
        closeAuthModal,
        isAadhaarModalOpen,
        openAadhaarModal,
        closeAadhaarModal,
        verifyAadhaarQr,
        signup,
        login,
        logout,
        sendOtp,
        resendOtp,
        verifyOtp,
        resetPassword,
        verifyEmail,
        updateProfile,
        submitTier2Id,
        switchRole,
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
