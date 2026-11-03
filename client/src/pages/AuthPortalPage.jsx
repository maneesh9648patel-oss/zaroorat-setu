import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles,
  RotateCcw, Clock, KeyRound, ArrowLeft, Edit3, Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BrandLogo from '../components/common/BrandLogo';

export default function AuthPortalPage({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'signup'
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, user, login, signup, sendOtp, resendOtp, verifyOtp, resetPassword, 
    loading, openAadhaarModal, isAadhaarVerified 
  } = useAuth();
  const { t } = useLanguage();

  // Redirect destination after successful login/signup
  const destination = location.state?.from?.pathname || '/';

  // --- Post-Auth mAadhaar Step State ---
  const [postAuthUser, setPostAuthUser] = useState(null);

  // --- Login Options ---
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp' | 'forgot_password'
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- Forgot Password State ---
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // --- Signup Form State ---
  const [signupStep, setSignupStep] = useState('form'); // 'form' | 'otp'
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState('needer');
  const [signupArea, setSignupArea] = useState('Civil Lines');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  // --- OTP Verification Screen State (Reusable for Signup, OTP Login & Forgot Password) ---
  const [otpPurpose, setOtpPurpose] = useState('signup'); // 'signup' | 'login' | 'forgot_password'
  const [activePhoneForOtp, setActivePhoneForOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(300); // 5 minutes
  const [resendCooldown, setResendCooldown] = useState(30); // 30 seconds
  const [devOtpHint, setDevOtpHint] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpAttemptsRemaining, setOtpAttemptsRemaining] = useState(null);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const otpInputsRef = useRef([]);

  // --- Auto-skip Login if already authenticated ---
  useEffect(() => {
    if (isAuthenticated && user && !postAuthUser) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, postAuthUser]);

  // --- Post-Auth mAadhaar Navigation ---
  useEffect(() => {
    if (postAuthUser && isAadhaarVerified) {
      navigate(destination, { replace: true });
    }
  }, [isAadhaarVerified, postAuthUser, destination]);

  // --- Rule: Login page par browser Back karke splash screen par wapas na jaya ja sake ---
  useEffect(() => {
    const handlePopState = () => {
      // Intercept back navigation and hold the user securely on the login/signup portal
      window.history.pushState(null, '', window.location.href);
    };
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fast demo account quick fill for testing
  const demoAccounts = [
    { label: "Aarav (Needer)", id: "aarav.banda@example.com", phone: "9876543210", pass: "password123", role: "needer" },
    { label: "Priya (Donor)", id: "priya.v@example.com", phone: "9839054321", pass: "password123", role: "donor" },
    { label: "REC Maker (Lender)", id: "rec.robotics@recbanda.ac.in", phone: "9838012345", pass: "password123", role: "lender" },
    { label: "Manoj (Verifier)", id: "verifier01@zarooratsetu.org", phone: "9450099887", pass: "password123", role: "verifier" },
    { label: "Platform Admin", id: "admin@zarooratsetu.org", phone: "9999900000", pass: "password123", role: "admin" }
  ];

  const handleDemoFill = (acc) => {
    setLoginMethod('password');
    setLoginIdentifier(acc.id);
    setLoginPassword(acc.pass);
    setLoginError('');
  };

  // Password-based Login Submit
  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = loginIdentifier.trim();
    if (!cleanId) {
      setLoginError("कृपया अपना पंजीकृत ईमेल या 10-अंकों का मोबाइल नंबर दर्ज करें (Please enter email or phone).");
      return;
    }
    if (!loginPassword) {
      setLoginError("कृपया अपना पासवर्ड दर्ज करें (Please enter password).");
      return;
    }

    try {
      const res = await login({ identifier: cleanId, password: loginPassword });
      if (!res.user?.aadhaarVerification?.verified) {
        setPostAuthUser(res.user);
      } else {
        navigate(destination, { replace: true });
      }
    } catch (err) {
      const errMsg = err.message || "";
      if (errMsg.includes("connect nahi ho paya") || errMsg.includes("Failed to fetch") || err.isNetworkError) {
        setLoginError("सर्वर से संपर्क नहीं हो पाया (Cannot reach server). कृपया सुनिश्चित करें कि बैकएंड सर्वर पोर्ट 5000 पर सक्रिय है।");
      } else {
        setLoginError(errMsg || "लॉग इन विफल रहा। कृपया विवरण जांचें। (Login failed)");
      }
    }
  };

  // Mobile OTP Login Request Submit
  const handleOtpLoginRequest = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanPhone = loginPhone.replace(/\D/g, '').slice(-10);
    const indianRegex = /^[6-9]\d{9}$/;
    if (!indianRegex.test(cleanPhone)) {
      setLoginError("कृपया वैध 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू) - Valid 10-digit Indian mobile required.");
      return;
    }

    try {
      const res = await sendOtp({
        phone: cleanPhone,
        purpose: 'login'
      });

      setOtpPurpose('login');
      setActivePhoneForOtp(cleanPhone);
      setSignupStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpExpirySeconds(res.expiresInSeconds || 300);
      setResendCooldown(res.resendAvailableInSeconds || 30);
      setDevOtpHint(res.devOtp || '');
      setOtpError('');
    } catch (err) {
      const errMsg = err.message || "";
      if (errMsg.includes("connect nahi ho paya") || errMsg.includes("Failed to fetch") || err.isNetworkError) {
        setLoginError("सर्वर से संपर्क नहीं हो पाया (Cannot reach server). कृपया सुनिश्चित करें कि बैकएंड पोर्ट 5000 पर सक्रिय है।");
      } else {
        setLoginError(errMsg || "OTP भेजने में त्रुटि हुई (Error sending OTP).");
      }
    }
  };

  // Forgot Password Request Submit
  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setLoginError('');

    const cleanPhone = loginPhone.replace(/\D/g, '').slice(-10);
    const indianRegex = /^[6-9]\d{9}$/;
    if (!indianRegex.test(cleanPhone)) {
      setLoginError("कृपया पंजीकृत 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें (Valid 10-digit mobile required).");
      return;
    }

    try {
      const res = await sendOtp({
        phone: cleanPhone,
        purpose: 'forgot_password'
      });

      setOtpPurpose('forgot_password');
      setActivePhoneForOtp(cleanPhone);
      setSignupStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpExpirySeconds(res.expiresInSeconds || 300);
      setResendCooldown(res.resendAvailableInSeconds || 30);
      setDevOtpHint(res.devOtp || '');
      setOtpError('');
    } catch (err) {
      const errMsg = err.message || "";
      if (errMsg.includes("connect nahi ho paya") || errMsg.includes("Failed to fetch") || err.isNetworkError) {
        setLoginError("सर्वर से संपर्क नहीं हो पाया (Cannot reach server).");
      } else {
        setLoginError(errMsg || "OTP भेजने में विफल (Failed to send OTP).");
      }
    }
  };

  // Signup submission -> Step 1: Send OTP
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setSignupError('');
    setSignupSuccess('');

    // 1. Validate Name
    const cleanName = signupName.trim();
    if (!cleanName || cleanName.length < 2) {
      setSignupError("कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर) - Full name is required.");
      return;
    }

    // 2. Validate Indian Mobile
    const cleanPhone = signupPhone.replace(/\D/g, '').slice(-10);
    const indianRegex = /^[6-9]\d{9}$/;
    if (!indianRegex.test(cleanPhone)) {
      setSignupError("कृपया वैध 10-अंकों का भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू) - Valid 10-digit Indian mobile required.");
      return;
    }

    // 3. Validate Email
    const cleanEmail = signupEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setSignupError("कृपया सही ईमेल पता दर्ज करें (Valid email format required: e.g. name@example.com).");
      return;
    }

    // 4. Validate Password
    if (!signupPassword || signupPassword.length < 6) {
      setSignupError("पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password must be at least 6 characters).");
      return;
    }

    // 5. Check Confirm Password
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("दोनों पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match). कृपया पुनः जांचें।");
      return;
    }

    try {
      const res = await sendOtp({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        role: signupRole,
        area: signupArea,
        purpose: 'signup'
      });

      setOtpPurpose('signup');
      setActivePhoneForOtp(cleanPhone);
      setSignupStep('otp');
      setOtpDigits(['', '', '', '', '', '']);
      setOtpExpirySeconds(res.expiresInSeconds || 300);
      setResendCooldown(res.resendAvailableInSeconds || 30);
      setDevOtpHint(res.devOtp || '');
      setOtpError('');
    } catch (err) {
      const errMsg = err.message || "";
      if (errMsg.includes("connect nahi ho paya") || errMsg.includes("Failed to fetch") || err.isNetworkError) {
        setSignupError("सर्वर से संपर्क नहीं हो पाया (Cannot reach server). कृपया सुनिश्चित करें कि बैकएंड सर्वर पोर्ट 5000 पर सक्रिय है।");
      } else {
        setSignupError(errMsg || "साइन अप विफल रहा। कृपया पुनः प्रयास करें। (Signup failed)");
      }
    }
  };

  // Auto-focus on first OTP box when entering OTP view
  useEffect(() => {
    if (signupStep === 'otp' && otpInputsRef.current[0]) {
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    }
  }, [signupStep]);

  // WebOTP API: Auto-read SMS on the device containing the physical SIM card
  useEffect(() => {
    if (signupStep !== 'otp') return;

    if (typeof window !== 'undefined' && 'OTPCredential' in window && navigator.credentials) {
      const abortController = new AbortController();
      navigator.credentials
        .get({
          otp: { transport: ['sms'] },
          signal: abortController.signal
        })
        .then((credential) => {
          if (credential && credential.code) {
            const rawDigits = credential.code.replace(/\D/g, '').slice(0, 6);
            if (rawDigits.length === 6) {
              setOtpDigits(rawDigits.split(''));
              setOtpError('');
            }
          }
        })
        .catch((err) => {
          console.log('WebOTP auto-read info:', err?.message);
        });

      return () => {
        try {
          abortController.abort();
        } catch (e) {}
      };
    }
  }, [signupStep]);

  // Tick countdown timer for 5-min OTP expiry and 30s resend cooldown
  useEffect(() => {
    if (signupStep !== 'otp') return;

    const timer = setInterval(() => {
      setOtpExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [signupStep]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // OTP Input event handlers
  const handleOtpChange = (index, val) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((c, i) => {
        if (index + i < 6) next[index + i] = c;
      });
      setOtpDigits(next);
      setOtpError('');
      const targetIdx = Math.min(index + chars.length, 5);
      otpInputsRef.current[targetIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = clean;
    setOtpDigits(next);
    setOtpError('');

    if (index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((c, i) => {
      if (i < 6) next[i] = c;
    });
    setOtpDigits(next);
    setOtpError('');
    const targetIdx = Math.min(pasted.length, 5);
    otpInputsRef.current[targetIdx]?.focus();
  };

  // Resend OTP handler with 30s cooldown
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendingOtp) return;
    setResendingOtp(true);
    setOtpError('');
    try {
      const targetPhone = activePhoneForOtp || signupPhone;
      const res = await resendOtp({ phone: targetPhone });
      setOtpDigits(['', '', '', '', '', '']);
      setOtpExpirySeconds(res.expiresInSeconds || 300);
      setResendCooldown(res.resendAvailableInSeconds || 30);
      if (res.devOtp) setDevOtpHint(res.devOtp);
      otpInputsRef.current[0]?.focus();
    } catch (err) {
      setOtpError(err.message || "OTP पुनः भेजने में त्रुटि हुई (Error resending OTP).");
    } finally {
      setResendingOtp(false);
    }
  };

  // Change Number: return to form with fields preserved
  const handleChangeNumber = () => {
    setSignupStep('form');
    setOtpError('');
    setSignupError('');
  };

  // Verify OTP & Complete Flow (Signup, Login, or Forgot Password)
  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setOtpError("कृपया 6-अंकों का पूरा OTP दर्ज करें (Please enter full 6-digit OTP).");
      return;
    }
    if (otpExpirySeconds <= 0) {
      setOtpError("यह OTP समाप्त (Expired) हो चुका है (5 मिनट की अवधि बीत गई)। कृपया नया OTP मंगाएं।");
      return;
    }

    setOtpVerifying(true);
    setOtpError('');

    try {
      const targetPhone = activePhoneForOtp || signupPhone;

      // 1. Forgot Password Flow
      if (otpPurpose === 'forgot_password') {
        if (!newPassword || newPassword.length < 6) {
          setOtpError("नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password must be at least 6 characters).");
          setOtpVerifying(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setOtpError("दोनों पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match).");
          setOtpVerifying(false);
          return;
        }

        const res = await resetPassword({
          phone: targetPhone,
          otp: code,
          newPassword,
          confirmPassword: confirmNewPassword
        });

        navigate(destination, { replace: true });
        return;
      }

      // 2. OTP Login Flow
      if (otpPurpose === 'login') {
        const res = await verifyOtp({
          phone: targetPhone,
          otp: code
        });

        if (!res.user?.aadhaarVerification?.verified) {
          setPostAuthUser(res.user);
        } else {
          navigate(destination, { replace: true });
        }
        return;
      }

      // 3. Signup Flow
      const cleanEmail = signupEmail.trim().toLowerCase();
      const res = await verifyOtp({
        phone: targetPhone,
        otp: code,
        signupData: {
          name: signupName.trim(),
          phone: targetPhone,
          email: cleanEmail,
          password: signupPassword,
          role: signupRole,
          area: signupArea
        }
      });

      setSignupSuccess("मोबाइल नंबर सत्यापित! खाता सफलतापूर्वक तैयार हो गया। (Mobile verified! Account created)");
      setPostAuthUser(res.user);
    } catch (err) {
      const errMsg = err.message || "";
      if (errMsg.includes("connect nahi ho paya") || errMsg.includes("Failed to fetch") || err.isNetworkError) {
        setOtpError("सर्वर से संपर्क नहीं हो पाया (Cannot reach server). कृपया सुनिश्चित करें कि बैकएंड पोर्ट 5000 पर सक्रिय है।");
      } else {
        setOtpError(errMsg || "OTP सत्यापन विफल रहा। कृपया पुनः प्रयास करें।");
      }
      if (err.attemptsRemaining !== undefined) {
        setOtpAttemptsRemaining(err.attemptsRemaining);
      }
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-cream">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-darkbrown/10 overflow-hidden">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-darkbrown via-darkbrown-light to-darkbrown text-cream p-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-red-600/20 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-teal/20 blur-2xl pointer-events-none"></div>

          <div className="flex justify-center mb-3">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Zaroorat<span className="text-softYellow">Setu</span></span>
          </h1>
          <p className="text-xs text-cream/75 mt-1 font-medium">
            सुरक्षित नागरिक सहायता एवं वस्तु विनिमय पोर्टल · Pilot: REC Banda
          </p>

          {/* Header Step Status Badges */}
          {postAuthUser ? (
            <div className="mt-4 px-3 py-1.5 rounded-full bg-teal/30 text-softYellow text-xs font-extrabold inline-flex items-center gap-1.5 border border-teal/40">
              <ShieldCheck className="w-4 h-4" />
              <span>चरण 2: mAadhaar पहचान सत्यापन</span>
            </div>
          ) : signupStep === 'otp' ? (
            <div className="mt-4 px-3 py-1.5 rounded-full bg-red-600/30 text-softYellow text-xs font-extrabold inline-flex items-center gap-1.5 border border-red-500/40">
              <KeyRound className="w-4 h-4" />
              <span>
                {otpPurpose === 'login' 
                  ? 'मोबाइल OTP लॉगिन (Mobile OTP Login)' 
                  : otpPurpose === 'forgot_password'
                  ? 'पासवर्ड रीसेट OTP'
                  : 'मोबाइल OTP सत्यापन (Real SMS OTP)'}
              </span>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 p-1 bg-black/25 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setSignupStep('form');
                  setLoginError('');
                }}
                className={`py-2 rounded-xl text-xs font-black transition ${
                  activeTab === 'login'
                    ? 'bg-white text-darkbrown shadow-md'
                    : 'text-cream/70 hover:text-white'
                }`}
              >
                लॉग इन (Log In)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setSignupStep('form');
                  setSignupError('');
                }}
                className={`py-2 rounded-xl text-xs font-black transition ${
                  activeTab === 'signup'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-cream/70 hover:text-white'
                }`}
              >
                नया खाता बनाएं (Sign Up)
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6">
          
          {/* Post-Auth mAadhaar Modal Transition */}
          {postAuthUser ? (
            <div className="text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-teal/10 text-teal flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8 text-teal" />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-wider text-teal">
                  लॉगिन सफल · अगला सुरक्षा चरण
                </div>
                <h2 className="text-lg font-black text-darkbrown mt-0.5">
                  mAadhaar QR सत्यापन
                </h2>
                <p className="text-xs text-darkbrown/70 mt-1 leading-relaxed">
                  नमस्ते <strong>{postAuthUser.displayName}</strong>! नागरिक सुरक्षा नियमों के अनुसार, समुदाय में वस्तुएं देने अथवा लेने के लिए mAadhaar QR सत्यापन अनिवार्य है।
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-cream/70 border border-darkbrown/10 text-left text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-darkbrown font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0" />
                  <span>कैमरा स्कैन या QR फोटो अपलोड समर्थित</span>
                </div>
                <div className="flex items-center gap-2 text-darkbrown font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal shrink-0" />
                  <span>UIDAI 2048-bit डिजिटल हस्ताक्षर द्वारा प्रमाणित</span>
                </div>
                <div className="flex items-center gap-2 text-darkbrown/60 text-[10px]">
                  <Lock className="w-3.5 h-3.5 text-darkbrown/40 shrink-0" />
                  <span>केवल नाम और अंतिम 4 अंक सत्यापित होते हैं। पूरा आधार कभी स्टोर नहीं होता।</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => openAadhaarModal()}
                  className="w-full py-3 px-4 rounded-2xl bg-teal hover:bg-teal-hover text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4 text-softYellow" />
                  <span>mAadhaar QR स्कैन / अपलोड करें</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate(destination, { replace: true })}
                  className="w-full py-2.5 px-4 rounded-2xl bg-transparent hover:bg-cream text-darkbrown/70 hover:text-darkbrown text-xs font-bold transition"
                >
                  बाद में करें (डैशबोर्ड पर आगे बढ़ें) &rarr;
                </button>
              </div>
            </div>
          ) : signupStep === 'otp' ? (
            
            /* ========================================================= */
            /* REUSABLE 6-BOX OTP VERIFICATION SCREEN                    */
            /* ========================================================= */
            <div className="space-y-4 animate-in fade-in">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-darkbrown">
                  {otpPurpose === 'login' 
                    ? 'मोबाइल OTP दर्ज करें (Enter Login OTP)'
                    : otpPurpose === 'forgot_password'
                    ? 'पासवर्ड रीसेट OTP दर्ज करें'
                    : 'मोबाइल OTP सत्यापन (Verify Mobile)'}
                </h3>
                <p className="text-xs text-darkbrown/70 mt-1">
                  6-अंकों का OTP वास्तविक SMS द्वारा <strong className="text-darkbrown font-bold">+91 {activePhoneForOtp || signupPhone}</strong> पर भेजा गया है।
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-light text-teal border border-teal/30 text-[11px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>📲 जिस फोन में यह SIM है, उसपर SMS आने पर 1-टैप में OTP स्वतः भर जाएगा</span>
                </div>
              </div>

              {/* Dev Simulation Notice */}
              {devOtpHint && (
                <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-bold">
                  🧪 [Dev Simulator]: आपका 6-अंकों का कोड: <span className="text-red-700 underline text-sm tracking-widest">{devOtpHint}</span> (or 123456)
                </div>
              )}

              {/* OTP Error Banner */}
              {otpError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Countdown Expiry Timer */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-darkbrown/70 font-semibold">
                <Clock className="w-3.5 h-3.5 text-darkbrown/50" />
                <span>समय शेष (Time Remaining):</span>
                <span className={`font-mono font-black ${otpExpirySeconds < 60 ? 'text-red-600 animate-pulse' : 'text-darkbrown'}`}>
                  {formatTimer(otpExpirySeconds)}
                </span>
              </div>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handleOtpPaste : undefined}
                    className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-2xl border-2 transition outline-none ${
                      digit 
                        ? 'border-red-600 bg-red-50/50 text-darkbrown' 
                        : 'border-darkbrown/20 bg-cream/30 text-darkbrown focus:border-red-600 focus:bg-white'
                    }`}
                  />
                ))}
              </div>

              {/* Extra Inputs for Forgot Password */}
              {otpPurpose === 'forgot_password' && (
                <div className="space-y-3 pt-2 border-t border-darkbrown/10">
                  <div>
                    <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                      नया पासवर्ड (New Password) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3.5" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="न्यूनतम 6 अक्षर"
                        className="w-full pl-10 pr-10 py-2.5 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-darkbrown/50 hover:text-darkbrown"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                      पासवर्ड की पुष्टि करें (Confirm Password) *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3.5" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="वही पासवर्ड पुनः दर्ज करें"
                        className="w-full pl-10 pr-4 py-2.5 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOtpSubmit}
                disabled={otpVerifying || otpDigits.join('').length !== 6 || otpExpirySeconds <= 0}
                className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {otpVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>सत्यापन जारी है (Verifying)...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {otpPurpose === 'forgot_password' 
                        ? 'पासवर्ड बदलें एवं लॉगिन करें' 
                        : otpPurpose === 'login'
                        ? 'लॉगिन सत्यापित करें (Verify & Login)'
                        : 'सत्यापित करें एवं खाता बनाएं (Verify & Create)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Resend and Number Correction Row */}
              <div className="pt-2 flex items-center justify-between border-t border-darkbrown/10 text-xs">
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="text-darkbrown/70 hover:text-darkbrown font-bold flex items-center gap-1 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>नंबर सुधारें (Change number)</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resendingOtp}
                  className={`font-black flex items-center gap-1.5 transition ${
                    resendCooldown > 0
                      ? 'text-darkbrown/40 cursor-not-allowed'
                      : 'text-red-600 hover:text-red-700'
                  }`}
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resendingOtp ? 'animate-spin' : ''}`} />
                  <span>
                    {resendCooldown > 0 
                      ? `पुनः भेजें (${resendCooldown}s)` 
                      : 'OTP पुनः भेजें (Resend OTP)'}
                  </span>
                </button>
              </div>
            </div>

          ) : activeTab === 'login' ? (

            /* ========================================================= */
            /* LOGIN TAB (PASSWORD OR MOBILE OTP OR FORGOT PASSWORD)     */
            /* ========================================================= */
            <div>
              {/* Login Method Toggle: Password vs Mobile OTP */}
              <div className="grid grid-cols-2 p-1 bg-darkbrown/5 rounded-2xl border border-darkbrown/10 mb-4">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setLoginError(''); }}
                  className={`py-1.5 rounded-xl text-xs font-bold transition ${
                    loginMethod === 'password'
                      ? 'bg-white text-darkbrown shadow-sm'
                      : 'text-darkbrown/60 hover:text-darkbrown'
                  }`}
                >
                  पासवर्ड लॉगिन (Password)
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setLoginError(''); }}
                  className={`py-1.5 rounded-xl text-xs font-bold transition ${
                    loginMethod === 'otp'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-darkbrown/60 hover:text-darkbrown'
                  }`}
                >
                  मोबाइल OTP लॉगिन
                </button>
              </div>

              {loginError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 mb-4 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginMethod === 'otp' ? (
                /* Mobile OTP Login Form */
                <form onSubmit={handleOtpLoginRequest} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                      10-अंकों का मोबाइल नंबर (Mobile Number) *
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-2xl border border-r-0 border-darkbrown/20 bg-darkbrown/5 text-xs font-bold text-darkbrown/70">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full px-3 py-2.5 bg-cream/40 border border-darkbrown/20 rounded-r-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                        maxLength={10}
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[10px] text-darkbrown/50 mt-1">
                      हम आपके इस नंबर पर वास्तविक SMS द्वारा 6-अंकों का सुरक्षा कोड भेजेंगे।
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || loginPhone.length !== 10}
                    className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>SMS भेजा जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <span>लॉगिन OTP प्राप्त करें (Get OTP)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

              ) : loginMethod === 'forgot_password' ? (

                /* Forgot Password Form */
                <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                  <div className="text-center pb-2">
                    <h3 className="text-sm font-bold text-darkbrown">पासवर्ड रीसेट करें (Reset Password)</h3>
                    <p className="text-xs text-darkbrown/60 mt-0.5">अपना पंजीकृत मोबाइल नंबर दर्ज करें</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                      पंजीकृत मोबाइल नंबर (Registered Mobile) *
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3.5 rounded-l-2xl border border-r-0 border-darkbrown/20 bg-darkbrown/5 text-xs font-bold text-darkbrown/70">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        className="w-full px-3 py-2.5 bg-cream/40 border border-darkbrown/20 rounded-r-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                        maxLength={10}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('password')}
                      className="w-1/3 py-2.5 rounded-2xl border border-darkbrown/20 text-xs font-bold hover:bg-cream"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      disabled={loading || loginPhone.length !== 10}
                      className="w-2/3 py-2.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <span>OTP प्राप्त करें</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>

              ) : (

                /* Standard Password Login Form */
                <form onSubmit={handlePasswordLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                      ईमेल या मोबाइल नंबर (Email or Phone)
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="name@example.com या 9876543210"
                        className="w-full pl-10 pr-4 py-2.5 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider">
                        पासवर्ड (Password)
                      </label>
                      <button
                        type="button"
                        onClick={() => { setLoginMethod('forgot_password'); setLoginError(''); }}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                      >
                        पासवर्ड भूल गए?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3.5" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-3 text-darkbrown/50 hover:text-darkbrown"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>लॉग इन हो रहा है (Logging in)...</span>
                      </>
                    ) : (
                      <>
                        <span>लॉग इन करें (Log In)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Sign up Link */}
                  <div className="pt-2 text-center">
                    <span className="text-xs text-darkbrown/70">नया खाता बनाना चाहते हैं? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signup');
                        setSignupStep('form');
                        setSignupError('');
                      }}
                      className="text-xs font-black text-red-600 hover:text-red-700 underline"
                    >
                      Sign up (नया खाता बनाएं)
                    </button>
                  </div>
                </form>
              )}

              {/* Demo Accounts Quick-Login Section */}
              <div className="pt-4 mt-4 border-t border-darkbrown/10">
                <div className="text-[11px] font-bold text-darkbrown/60 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-red-600" />
                  <span>त्वरित डेमो लॉगिन (1-Click Test Accounts):</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleDemoFill(acc)}
                      className="p-2 rounded-xl bg-cream/70 hover:bg-cream border border-darkbrown/10 text-left transition group"
                    >
                      <div className="text-[11px] font-black text-darkbrown group-hover:text-red-600 transition truncate">
                        {acc.label}
                      </div>
                      <div className="text-[9px] text-darkbrown/50 truncate">
                        {acc.phone}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

          ) : (

            /* ========================================================= */
            /* SIGN UP FORM (FULL VALIDATION + REAL MOBILE SMS OTP)       */
            /* ========================================================= */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{signupError}</span>
                </div>
              )}

              {signupSuccess && (
                <div className="p-3 rounded-2xl bg-teal-light border border-teal/20 text-teal text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  पूरा नाम (Full Name) *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="उदा. रमेश कुमार (Ramesh Kumar)"
                    className="w-full pl-10 pr-4 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                    required
                  />
                </div>
              </div>

              {/* Phone Number with +91 */}
              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  मोबाइल नंबर (Mobile Phone) *
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-darkbrown/20 bg-darkbrown/5 text-xs font-bold text-darkbrown/70">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-cream/40 border border-darkbrown/20 rounded-r-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                    maxLength={10}
                    required
                  />
                </div>
                <p className="text-[10px] text-darkbrown/50 mt-0.5">
                  सत्यापन हेतु वास्तविक SMS भेजा जाएगा (Real SMS OTP will be sent).
                </p>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  ईमेल पता (Email Address) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                    required
                  />
                </div>
              </div>

              {/* Role & Pilot Area Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                    भूमिका (Role)
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                  >
                    <option value="needer">नागरिक / जरूरतमंद (Needer)</option>
                    <option value="lender">वस्तु प्रदाता (Lender)</option>
                    <option value="donor">सहयोगी / दानी (Donor)</option>
                    <option value="ngo">संस्था / NGO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                    क्षेत्र (Pilot Area)
                  </label>
                  <select
                    value={signupArea}
                    onChange={(e) => setSignupArea(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                  >
                    <option value="Civil Lines">Civil Lines (Banda)</option>
                    <option value="REC Banda">REC Banda Campus</option>
                    <option value="District Hospital Banda">District Hospital</option>
                    <option value="Baberu">Baberu</option>
                    <option value="Atarra">Atarra</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  पासवर्ड (Password, min 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3.5 top-2.5 text-darkbrown/50 hover:text-darkbrown"
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  पासवर्ड पुष्टि (Confirm Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="वही पासवर्ड दोबारा दर्ज करें"
                    className="w-full pl-10 pr-4 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-red-600/40 focus:border-red-600 transition"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>OTP भेजा जा रहा है (Sending OTP)...</span>
                  </>
                ) : (
                  <>
                    <span>मोबाइल OTP प्राप्त करें (Send Mobile OTP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
