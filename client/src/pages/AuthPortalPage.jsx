import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowRight, CheckCircle2, AlertCircle, Sparkles, Building2,
  HeartHandshake, Heart, Shield, HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import BrandLogo from '../components/common/BrandLogo';

export default function AuthPortalPage({ initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'signup'
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, loading } = useAuth();
  const { t } = useLanguage();

  // Redirect destination after successful login/signup
  const destination = location.state?.from?.pathname || '/';

  // --- Login Form State ---
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // --- Signup Form State ---
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

  // Fast demo account quick fill for testing
  const demoAccounts = [
    { label: "Aarav (Needer)", id: "aarav.banda@example.com", phone: "9876543210", pass: "password123", role: "needer" },
    { label: "Priya (Donor)", id: "priya.v@example.com", phone: "9839054321", pass: "password123", role: "donor" },
    { label: "REC Maker (Lender)", id: "rec.robotics@recbanda.ac.in", phone: "9838012345", pass: "password123", role: "lender" },
    { label: "Manoj (Verifier)", id: "verifier01@zarooratsetu.org", phone: "9450099887", pass: "password123", role: "verifier" },
    { label: "Platform Admin", id: "admin@zarooratsetu.org", phone: "9999900000", pass: "password123", role: "admin" }
  ];

  const handleDemoFill = (acc) => {
    setLoginIdentifier(acc.id);
    setLoginPassword(acc.pass);
    setLoginError('');
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
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
      await login({ identifier: cleanId, password: loginPassword });
      navigate(destination, { replace: true });
    } catch (err) {
      setLoginError(err.message || "लॉग इन विफल रहा। कृपया विवरण जांचें। (Login failed)");
    }
  };

  // Signup handler
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    setSignupSuccess('');

    // 1. Validate Name
    const cleanName = signupName.trim();
    if (!cleanName || cleanName.length < 2) {
      setSignupError("कृपया अपना पूरा नाम दर्ज करें (कम से कम 2 अक्षर) - Name is required.");
      return;
    }

    // 2. Validate Phone
    const cleanPhone = signupPhone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setSignupError("कृपया वैध 10-अंकों का मोबाइल नंबर दर्ज करें (Valid 10-digit mobile number required).");
      return;
    }

    // 3. Validate Email
    const cleanEmail = signupEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setSignupError("कृपया सही ईमेल पता दर्ज करें (Valid email address required).");
      return;
    }

    // 4. Validate Password
    if (!signupPassword || signupPassword.length < 6) {
      setSignupError("पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password must be at least 6 characters).");
      return;
    }

    // 5. Check Confirm Password
    if (signupPassword !== signupConfirmPassword) {
      setSignupError("दोनों पासवर्ड मेल नहीं खा रहे हैं (Passwords do not match).");
      return;
    }

    try {
      const res = await signup({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password: signupPassword,
        role: signupRole,
        area: signupArea
      });

      setSignupSuccess("खाता सफलतापूर्वक तैयार हो गया! आपको लॉगिन किया जा रहा है... (Account created successfully!)");
      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 1000);
    } catch (err) {
      setSignupError(err.message || "साइन अप विफल रहा। कृपया पुनः प्रयास करें। (Signup failed)");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-cream/60">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-darkbrown/10 overflow-hidden">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-darkbrown via-darkbrown-light to-darkbrown text-cream p-6 text-center relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-terracotta/20 blur-2xl pointer-events-none"></div>
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

          {/* Tab Switcher: Log In vs Sign Up */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-black/25 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
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
                setSignupError('');
              }}
              className={`py-2 rounded-xl text-xs font-black transition ${
                activeTab === 'signup'
                  ? 'bg-terracotta text-white shadow-md'
                  : 'text-cream/70 hover:text-white'
              }`}
            >
              नया खाता बनाएं (Sign Up)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {/* ========================================================= */}
          {/* LOGIN TAB                                                  */}
          {/* ========================================================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Identifier: Email or Phone */}
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
                    className="w-full pl-10 pr-4 py-2.5 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition"
                    autoComplete="username"
                  />
                </div>
                <p className="text-[10px] text-darkbrown/50 mt-1">
                  आप अपना ईमेल या 10-अंकों का मोबाइल नंबर दर्ज कर सकते हैं।
                </p>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider">
                    पासवर्ड (Password)
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3.5" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal transition"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3 text-darkbrown/50 hover:text-darkbrown"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-teal hover:bg-teal-hover text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
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

              {/* Demo Accounts Quick-Login Section */}
              <div className="pt-3 border-t border-darkbrown/10">
                <div className="text-[11px] font-bold text-darkbrown/60 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-terracotta" />
                  <span>त्वरित डेमो लॉगिन (1-Click Test Accounts):</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoAccounts.slice(0, 4).map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleDemoFill(acc)}
                      className="px-2.5 py-1.5 rounded-xl bg-cream hover:bg-cream-dark text-left border border-darkbrown/10 text-[10px] text-darkbrown/80 font-medium transition hover:border-teal/40"
                    >
                      <div className="font-bold text-darkbrown">{acc.label}</div>
                      <div className="text-darkbrown/50 truncate text-[9px]">{acc.id}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* SIGNUP TAB                                                 */}
          {/* ========================================================= */}
          {activeTab === 'signup' && (
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
                    className="w-full pl-10 pr-4 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
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
                    className="w-full px-3 py-2 bg-cream/40 border border-darkbrown/20 rounded-r-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
                    maxLength={10}
                    required
                  />
                </div>
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
                    className="w-full pl-10 pr-4 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
                    required
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                    भूमिका (Role)
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value)}
                    className="w-full px-3 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
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
                    className="w-full px-3 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
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
                  पासवर्ड (Password - Min 6 chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="कम से कम 6 अक्षर"
                    className="w-full pl-10 pr-10 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
                    minLength={6}
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
                  पासवर्ड पुनः दर्ज करें (Confirm Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-darkbrown/40 absolute left-3.5 top-3" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="पासवर्ड दोबारा दर्ज करें"
                    className="w-full pl-10 pr-4 py-2 bg-cream/40 border border-darkbrown/20 rounded-2xl text-xs font-medium text-darkbrown focus:outline-none focus:ring-2 focus:ring-terracotta/40 focus:border-terracotta transition"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {/* Security Commitment Notice */}
              <div className="p-2.5 rounded-2xl bg-teal-light/50 border border-teal/20 text-[10px] text-teal-dark flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                <span>
                  <strong>सुरक्षा वादा:</strong> आपका पासवर्ड सुरक्षित हैश (salt+scrypt) के साथ सुरक्षित रखा जाता है और कभी भी सादा टेक्स्ट में स्टोर नहीं होता।
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>खाता तैयार हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <span>खाता बनाएं एवं जारी रखें (Sign Up)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy & HackFest Footer Note */}
          <div className="mt-5 text-center text-[10px] text-darkbrown/50 border-t border-darkbrown/10 pt-3">
            <span>HackFest 3.0 Civic Tech · REC Banda Pilot</span>
            <div className="mt-0.5 text-darkbrown/40">
              सुरक्षित सत्र टोकन (JWT & Session Auth) द्वारा संचालित
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
