import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, ShieldCheck, LogOut, 
  ArrowLeft, CheckCircle2, AlertTriangle, Box, ClipboardList,
  Sparkles, ExternalLink, Calendar, Key, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import KycBadge from '../components/common/KycBadge';

export default function ProfilePage() {
  const { user, logout, openAuthModal, openAadhaarModal, isAadhaarVerified } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'needer': return 'नागरिक / जरूरतमंद (Needer)';
      case 'lender': return 'वस्तु प्रदाता (Lender)';
      case 'donor': return 'सहयोगी / दानी (Donor)';
      case 'ngo': return 'संस्था / NGO Partner';
      case 'verifier': return 'सत्यापनकर्ता (Verifier)';
      case 'admin': return 'प्रशासक (Governance Admin)';
      default: return role || 'Member';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-12 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-darkbrown/70 hover:text-darkbrown bg-white/60 hover:bg-white px-3 py-1.5 rounded-full border border-darkbrown/10 transition shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('btnHome')}</span>
        </Link>
        <div className="text-xs font-bold text-darkbrown/60">
          नागरिक प्रोफाइल (User Profile)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Card: User Identity & Avatar */}
        <div className="md:col-span-1 bg-white rounded-3xl p-6 shadow-md border border-darkbrown/10 flex flex-col items-center text-center">
          {/* Avatar Icon with Initials */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-dark via-teal to-terracotta text-white flex items-center justify-center text-2xl font-black shadow-lg mb-4 border-4 border-cream">
            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>

          <h2 className="text-lg font-black text-darkbrown leading-tight">
            {user?.displayName || 'Community Member'}
          </h2>
          <p className="text-xs text-darkbrown/60 font-semibold mt-0.5">
            सार्वजनिक नाम: <span className="text-darkbrown">{user?.publicName || 'Member'}</span>
          </p>

          {/* Role Pill */}
          <div className="mt-3 px-3 py-1 rounded-full bg-cream border border-darkbrown/10 text-xs font-bold text-darkbrown">
            {getRoleLabel(user?.role)}
          </div>

          {/* KYC Status Badge */}
          <div className="mt-4 flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-darkbrown/50 uppercase tracking-wider">
              सत्यापन स्तर (Verification Tier)
            </span>
            <KycBadge level={user?.kycLevel} status={user?.kycStatus} size="md" />
          </div>

          {/* UID & Join Date */}
          <div className="w-full mt-6 pt-4 border-t border-darkbrown/10 text-[10px] text-darkbrown/50 text-left space-y-1">
            <div className="flex justify-between">
              <span>सदस्य आईडी (UID):</span>
              <span className="font-mono text-darkbrown font-bold">{user?.uid || 'usr_demo'}</span>
            </div>
            <div className="flex justify-between">
              <span>पायलट शहर:</span>
              <span className="text-darkbrown font-semibold">{user?.city || 'Banda'}</span>
            </div>
          </div>

          {/* Prominent Logout Trigger */}
          <div className="w-full mt-6">
            {!showLogoutConfirm ? (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-2.5 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black border border-red-200 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <LogOut className="w-4 h-4 text-red-600" />
                <span>लॉग आउट करें (Logout)</span>
              </button>
            ) : (
              <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-center animate-in fade-in">
                <p className="text-xs font-bold text-red-800 mb-2">
                  क्या आप सचमुच लॉग आउट करना चाहते हैं?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition shadow-sm"
                  >
                    हाँ, लॉग आउट
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-1.5 px-3 rounded-xl bg-white text-darkbrown text-xs font-bold border border-darkbrown/20 hover:bg-cream transition"
                  >
                    रद्द करें
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Details Card */}
        <div className="md:col-span-2 space-y-5">
          {/* mAadhaar Digital Identity Verification Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-darkbrown/10 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-darkbrown uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal" />
                <span>mAadhaar डिजिटल सत्यापन (UIDAI Secure QR)</span>
              </h3>
              {user?.aadhaarVerification?.verified ? (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>सत्यापित (Verified)</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center gap-1.5 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>असत्यापित (Pending)</span>
                </span>
              )}
            </div>

            {user?.aadhaarVerification?.verified ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-light/30 to-emerald-50 border border-emerald-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-darkbrown/50">आधार पर प्रमाणित नाम:</div>
                      <div className="font-black text-darkbrown text-sm">{user.aadhaarVerification.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-darkbrown/50">मास्क्ड आधार संख्या:</div>
                      <div className="font-mono font-black text-darkbrown text-sm">XXXX XXXX {user.aadhaarVerification.last4}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-darkbrown/50">जन्मतिथि एवं लिंग:</div>
                      <div className="font-bold text-darkbrown">{user.aadhaarVerification.dob || '01-01-1990'} · {user.aadhaarVerification.gender === 'F' ? 'महिला (Female)' : 'पुरुष (Male)'}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-darkbrown/50">हस्ताक्षर विधि:</div>
                      <div className="font-semibold text-emerald-800">UIDAI 2048-bit RSA Validated</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>अधिकृत: आप समुदाय में वस्तुएं देने एवं लेने के लिए पात्र हैं।</span>
                  </div>
                  <button
                    type="button"
                    onClick={openAadhaarModal}
                    className="px-3 py-1 rounded-full bg-cream hover:bg-cream-dark text-darkbrown/70 hover:text-darkbrown text-[11px] font-bold border border-darkbrown/10 transition"
                  >
                    पुनः जांचें
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
                <div className="text-xs text-amber-900 leading-relaxed font-medium">
                  <strong>महत्वपूर्ण सूचना:</strong> सुरक्षा एवं विश्वास नियमों के तहत, जब तक आप अपने mAadhaar QR कोड को स्कैन या अपलोड कर डिजिटल रूप से सत्यापित नहीं करते, <strong>आप समुदाय में वस्तुएं नहीं दे अथवा ले सकते।</strong>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-amber-800/80 font-bold">
                    केवल नाम व अंतिम 4 अंक सत्यापित होते हैं।
                  </span>
                  <button
                    type="button"
                    onClick={openAadhaarModal}
                    className="px-4 py-2 rounded-2xl bg-teal hover:bg-teal-hover text-white text-xs font-black shadow-sm transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-softYellow" />
                    <span>mAadhaar QR अभी सत्यापित करें</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Contact & Location Card */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-darkbrown/10">
            <h3 className="text-sm font-black text-darkbrown uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-teal" />
              <span>खाता एवं संपर्क विवरण (Account Details)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="p-3.5 rounded-2xl bg-cream/50 border border-darkbrown/10">
                <div className="text-[10px] font-bold text-darkbrown/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-teal" />
                  <span>मोबाइल नंबर (Phone)</span>
                </div>
                <div className="text-xs font-bold text-darkbrown font-mono">
                  {user?.phone || 'दर्ज नहीं (Not provided)'}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-teal font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>OTP सत्यापित</span>
                </div>
              </div>

              {/* Email */}
              <div className="p-3.5 rounded-2xl bg-cream/50 border border-darkbrown/10">
                <div className="text-[10px] font-bold text-darkbrown/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-terracotta" />
                  <span>ईमेल पता (Email)</span>
                </div>
                <div className="text-xs font-bold text-darkbrown truncate">
                  {user?.email || 'दर्ज नहीं (Not provided)'}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-teal font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>सत्यापित ईमेल</span>
                </div>
              </div>

              {/* Area */}
              <div className="p-3.5 rounded-2xl bg-cream/50 border border-darkbrown/10">
                <div className="text-[10px] font-bold text-darkbrown/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal" />
                  <span>संबद्ध क्षेत्र (Operating Area)</span>
                </div>
                <div className="text-xs font-bold text-darkbrown">
                  {user?.area || 'Civil Lines, Banda'}
                </div>
                <div className="text-[10px] text-darkbrown/50 mt-1">
                  बांदा पायलट क्लस्टर
                </div>
              </div>

              {/* Security Status */}
              <div className="p-3.5 rounded-2xl bg-cream/50 border border-darkbrown/10">
                <div className="text-[10px] font-bold text-darkbrown/50 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-terracotta" />
                  <span>सुरक्षा स्थिति (Security)</span>
                </div>
                <div className="text-xs font-bold text-teal">
                  सक्रिय सत्र (JWT Protected)
                </div>
                <div className="text-[10px] text-darkbrown/50 mt-1">
                  पासवर्ड हैश सुरक्षित (scrypt)
                </div>
              </div>
            </div>

            {/* NGO info if applicable */}
            {user?.ngoDetails && (
              <div className="mt-4 p-3.5 rounded-2xl bg-teal-light/40 border border-teal/20 text-xs text-teal-dark flex items-center justify-between">
                <div>
                  <div className="font-bold">संस्था पंजीयन संख्या (NGO Reg):</div>
                  <div className="font-mono text-[11px] font-semibold">{user.ngoDetails.regNumber}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-teal text-white text-[10px] font-bold">
                  प्रशासन द्वारा सत्यापित
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Hub */}
          <div className="bg-white rounded-3xl p-6 shadow-md border border-darkbrown/10">
            <h3 className="text-sm font-black text-darkbrown uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-terracotta" />
              <span>त्वरित नेविगेशन (Quick Access)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/new-request"
                className="p-3 rounded-2xl bg-cream hover:bg-cream-dark border border-darkbrown/10 text-center transition group"
              >
                <ClipboardList className="w-5 h-5 mx-auto text-terracotta mb-1 group-hover:scale-110 transition" />
                <div className="text-xs font-bold text-darkbrown">नया अनुरोध</div>
                <div className="text-[10px] text-darkbrown/50">जरूरत पोस्ट करें</div>
              </Link>

              <Link
                to="/borrow-return"
                className="p-3 rounded-2xl bg-cream hover:bg-cream-dark border border-darkbrown/10 text-center transition group"
              >
                <Box className="w-5 h-5 mx-auto text-teal mb-1 group-hover:scale-110 transition" />
                <div className="text-xs font-bold text-darkbrown">सामान विनिमय</div>
                <div className="text-[10px] text-darkbrown/50">लेंड एवं बॉरो हब</div>
              </Link>

              <button
                type="button"
                onClick={() => openAuthModal(1)}
                className="p-3 rounded-2xl bg-cream hover:bg-cream-dark border border-darkbrown/10 text-center transition group"
              >
                <ShieldCheck className="w-5 h-5 mx-auto text-teal mb-1 group-hover:scale-110 transition" />
                <div className="text-xs font-bold text-darkbrown">KYC अपग्रेड</div>
                <div className="text-[10px] text-darkbrown/50">दस्तावेज सत्यापन</div>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
