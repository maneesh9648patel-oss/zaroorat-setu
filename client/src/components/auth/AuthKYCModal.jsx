import React, { useState } from 'react';
import { X, CheckCircle, Shield, AlertTriangle, ArrowRight, Lock, Upload, Smartphone, Mail, User, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import KycBadge from '../common/KycBadge';

const PILOT_AREAS = [
  "Civil Lines",
  "REC Banda",
  "District Hospital Banda",
  "Baberu",
  "Atarra",
  "Tindwari",
  "Naraini"
];

export default function AuthKYCModal() {
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    authStep,
    setAuthStep,
    sendOtp,
    verifyOtp,
    verifyEmail,
    updateProfile,
    submitTier2Id,
    loading,
    error
  } = useAuth();
  const { t } = useLanguage();

  // Form states
  const [phone, setPhone] = useState(user?.phone?.replace('+91', '') || '9876543210');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState(user?.email || 'aarav.banda@example.com');
  const [displayName, setDisplayName] = useState(user?.displayName || 'Aarav Kumar');
  const [area, setArea] = useState(user?.area || 'Civil Lines');
  const [role, setRole] = useState(user?.role || 'needer');
  const [ngoRegNumber, setNgoRegNumber] = useState('');
  const [idDocType, setIdDocType] = useState('Government Photo ID');
  const [idDocSubmitted, setIdDocSubmitted] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  if (!isAuthModalOpen) return null;

  // Handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      await sendOtp(phone);
      setOtpSent(true);
      setStatusNotice(t('demoOtpBadge'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      await verifyOtp(phone, otp);
      setAuthStep(2); // Move to Email verification
      setStatusNotice(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    try {
      await verifyEmail(email);
      setAuthStep(3); // Move to Profile
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        displayName,
        area,
        role,
        ngoRegNumber: role === 'ngo' ? ngoRegNumber : undefined
      });
      setAuthStep(4); // Move to Additional Identity
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitIdPlaceholder = async (e) => {
    e.preventDefault();
    try {
      await submitTier2Id({
        documentType: idDocType,
        notes: "Uploaded for manual reviewer inspection."
      });
      setIdDocSubmitted(true);
      setTimeout(() => {
        closeAuthModal();
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbrown/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-cream rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-darkbrown text-cream p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-terracotta flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-base leading-tight">{t('authTitle')}</h2>
              <p className="text-xs text-cream/70">{t('authSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-cream/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="bg-darkbrown-light px-5 py-2.5 flex items-center justify-between text-xs text-cream/80 border-b border-white/10">
          <button
            onClick={() => setAuthStep(1)}
            className={`font-bold flex items-center gap-1 ${authStep === 1 ? 'text-softYellow underline' : 'opacity-70'}`}
          >
            <span>1. Phone</span>
            {user?.kycLevel && <CheckCircle className="w-3 h-3 text-teal" />}
          </button>
          <span>&rarr;</span>
          <button
            onClick={() => setAuthStep(2)}
            className={`font-bold flex items-center gap-1 ${authStep === 2 ? 'text-softYellow underline' : 'opacity-70'}`}
          >
            <span>2. Email</span>
          </button>
          <span>&rarr;</span>
          <button
            onClick={() => setAuthStep(3)}
            className={`font-bold flex items-center gap-1 ${authStep === 3 ? 'text-softYellow underline' : 'opacity-70'}`}
          >
            <span>3. Profile</span>
          </button>
          <span>&rarr;</span>
          <button
            onClick={() => setAuthStep(4)}
            className={`font-bold flex items-center gap-1 ${authStep === 4 ? 'text-softYellow underline' : 'opacity-70'}`}
          >
            <span>4. ID Check</span>
          </button>
        </div>

        {/* Current KYC Status Banner */}
        <div className="bg-cream-dark px-5 py-2 flex items-center justify-between text-xs border-b border-darkbrown/5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-darkbrown/70">Current status:</span>
            <KycBadge level={user?.kycLevel} status={user?.kycStatus} size="sm" />
          </div>
          <span className="text-[11px] text-darkbrown/60 font-medium">Pilot: REC Banda</span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {statusNotice && (
            <div className="p-3 rounded-2xl bg-teal-light border border-teal/20 text-teal text-xs font-semibold flex items-center justify-between">
              <span>{statusNotice}</span>
              <span className="px-2 py-0.5 rounded-full bg-teal text-white text-[10px]">Mock Active</span>
            </div>
          )}

          {/* STEP 1: Phone OTP */}
          {authStep === 1 && (
            <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  {t('phoneLabel')}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-sm font-bold text-darkbrown/60">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    disabled={otpSent}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-darkbrown/20 bg-white text-darkbrown font-semibold focus:ring-2 focus:ring-terracotta outline-none disabled:bg-gray-100"
                  />
                </div>
              </div>

              {otpSent && (
                <div className="space-y-2 animate-in fade-in">
                  <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider">
                    {t('otpLabel')}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-2xl border border-darkbrown/20 bg-white text-darkbrown font-bold text-center tracking-widest text-lg focus:ring-2 focus:ring-terracotta outline-none"
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-teal font-semibold">Demo OTP: 123456</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-terracotta hover:underline font-semibold"
                    >
                      Change number
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 tap-target"
              >
                <span>{otpSent ? t('btnVerifyOtp') : t('btnSendOtp')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 rounded-2xl bg-white border border-darkbrown/10 text-xs text-darkbrown/70 flex items-start gap-2">
                <Lock className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Rule:</strong> We never display your phone number to public visitors. Only verified community members in approved matches can communicate.
                </span>
              </div>
            </form>
          )}

          {/* STEP 2: Email Verification */}
          {authStep === 2 && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-darkbrown/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-darkbrown/20 bg-white text-darkbrown font-semibold focus:ring-2 focus:ring-teal outline-none"
                  />
                </div>
                <p className="text-[11px] text-darkbrown/60 mt-1">
                  Used for volunteer updates and receipt of item return reminders.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthStep(3)}
                  className="w-1/3 py-3.5 rounded-2xl border border-darkbrown/20 font-bold text-xs hover:bg-white transition"
                >
                  Skip
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3.5 rounded-2xl bg-teal hover:bg-teal-hover text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Verify Email (Demo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Basic Profile */}
          {authStep === 3 && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  {t('fullNameLabel')}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Aarav Kumar"
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-darkbrown/20 bg-white text-darkbrown font-semibold focus:ring-2 focus:ring-terracotta outline-none"
                />
                <p className="text-[11px] text-darkbrown/60 mt-1">
                  Public views show only first name + initial (e.g., <strong>Aarav K.</strong>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  {t('areaLabel')}
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-darkbrown/20 bg-white text-darkbrown font-semibold focus:ring-2 focus:ring-terracotta outline-none"
                >
                  {PILOT_AREAS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  {t('roleLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'needer', label: t('roleNeeder') },
                    { id: 'donor', label: t('roleDonor') },
                    { id: 'lender', label: t('roleLender') },
                    { id: 'ngo', label: t('roleNgo') }
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={`p-3 rounded-2xl border text-left text-xs transition ${
                        role === r.id
                          ? 'border-terracotta bg-terracotta-light text-terracotta font-extrabold shadow-sm'
                          : 'border-darkbrown/15 bg-white text-darkbrown/80 hover:border-darkbrown/40'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {role === 'ngo' && (
                <div className="p-3 rounded-2xl bg-white border border-teal/30 space-y-2">
                  <label className="block text-xs font-bold text-teal uppercase tracking-wider">
                    NGO Registration / Darpan ID
                  </label>
                  <input
                    type="text"
                    value={ngoRegNumber}
                    onChange={(e) => setNgoRegNumber(e.target.value)}
                    placeholder="e.g. UP/2021/BND/0042"
                    className="w-full px-3 py-2 rounded-xl border border-teal/30 bg-teal-light/30 text-xs font-semibold outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 tap-target"
              >
                <span>{t('btnCompleteProfile')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 4: Optional Extra Identity Step (Honesty Rule) */}
          {authStep === 4 && (
            <form onSubmit={handleSubmitIdPlaceholder} className="space-y-4">
              <div className="p-4 rounded-2xl bg-white border border-darkbrown/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-terracotta uppercase tracking-wider">
                    {t('idPlaceholderBadge')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-softYellow/60 text-[10px] font-bold text-darkbrown">
                    Optional Tier 2
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-darkbrown">
                  {t('idPlaceholderTitle')}
                </h3>
                <p className="text-xs text-darkbrown/70 leading-relaxed">
                  {t('idPlaceholderDesc')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkbrown uppercase tracking-wider mb-1">
                  Document Type
                </label>
                <select
                  value={idDocType}
                  onChange={(e) => setIdDocType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-darkbrown/20 bg-white text-darkbrown font-semibold outline-none text-xs"
                >
                  <option>Voter ID Card (Election Commission)</option>
                  <option>Driving License (Transport Dept)</option>
                  <option>College / REC Banda Student ID</option>
                  <option>Society / NGO Registration Certificate</option>
                </select>
              </div>

              {/* Upload field placeholder */}
              <div className="border-2 border-dashed border-darkbrown/25 rounded-2xl p-5 text-center bg-white/50 hover:bg-white transition cursor-pointer">
                <Upload className="w-7 h-7 text-terracotta mx-auto mb-2 opacity-80" />
                <div className="font-bold text-xs text-darkbrown">{t('uploadPlaceholder')}</div>
                <div className="text-[11px] text-darkbrown/50 mt-1">PNG, JPG or PDF up to 5MB (Simulation)</div>
              </div>

              {idDocSubmitted ? (
                <div className="p-3 rounded-2xl bg-teal-light text-teal font-bold text-xs text-center animate-in fade-in">
                  ✓ Verified for Demo! Level 2 active.
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="w-1/2 py-3 rounded-2xl border border-darkbrown/20 font-bold text-xs hover:bg-white transition"
                  >
                    Finish for now
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 rounded-2xl bg-teal hover:bg-teal-hover text-white font-bold text-xs transition"
                  >
                    Submit ID (Demo)
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
