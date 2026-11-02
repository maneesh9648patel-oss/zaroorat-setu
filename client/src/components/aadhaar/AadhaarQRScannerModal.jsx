import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, Upload, ShieldCheck, AlertTriangle, CheckCircle2, 
  Sparkles, RefreshCw, Lock, FileText, Smartphone, ArrowRight
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';

export default function AadhaarQRScannerModal() {
  const { isAadhaarModalOpen, closeAadhaarModal, verifyAadhaarQr, user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'upload' | 'demo'
  const [scanning, setScanning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(null);
  const [sampleQrs, setSampleQrs] = useState(null);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch sample QRs for 1-click test evaluation
  useEffect(() => {
    if (isAadhaarModalOpen) {
      api.aadhaar.getSampleQrs()
        .then(res => {
          if (res.success) setSampleQrs(res);
        })
        .catch(err => console.warn('Could not load sample QRs:', err.message));
    }
  }, [isAadhaarModalOpen]);

  // Handle Camera Scanner Lifecycle
  useEffect(() => {
    if (!isAadhaarModalOpen || activeTab !== 'camera') {
      stopCameraScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setCameraError(null);
      setScanning(true);

      try {
        // Create scanner instance on the reader element
        const html5QrCode = new Html5Qrcode("aadhaar-qr-reader");
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            if (isMounted) {
              handleQrDetected(decodedText);
            }
          },
          () => {
            // Frame scan pass - ignore normal frame misses
          }
        );
      } catch (err) {
        if (isMounted) {
          console.warn("Camera start warning:", err);
          setCameraError("कैमरा शुरू करने में असमर्थ। कृपया कैमरा अनुमति दें या 'फोटो अपलोड' विकल्प चुनें। (Camera access unavailable. Please use file upload).");
          setScanning(false);
        }
      }
    };

    // Small delay to ensure DOM element exists
    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCameraScanner();
    };
  }, [isAadhaarModalOpen, activeTab]);

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            try { scannerRef.current.clear(); } catch (e) {}
          }).catch(e => console.warn(e));
        } else {
          try { scannerRef.current.clear(); } catch (e) {}
        }
      } catch (e) {
        // ignore
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // QR Processing & Cryptographic Verification
  const handleQrDetected = async (qrString) => {
    stopCameraScanner();
    setVerifying(true);
    setVerificationError(null);
    setVerificationSuccess(null);

    try {
      const result = await verifyAadhaarQr(qrString);
      setVerificationSuccess(result);
      setVerifying(false);

      // Auto-close modal after successful celebration
      setTimeout(() => {
        closeAadhaarModal();
        setVerificationSuccess(null);
      }, 2500);
    } catch (err) {
      setVerifying(false);
      setVerificationError(err.message || "QR कोड डिजिटल हस्ताक्षर सत्यापन विफल रहा। (Signature verification failed).");
    }
  };

  // Handle Image File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifying(true);
    setVerificationError(null);
    setVerificationSuccess(null);

    try {
      const html5QrCode = new Html5Qrcode("aadhaar-file-hidden-reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      await handleQrDetected(decodedText);
    } catch (err) {
      setVerifying(false);
      setVerificationError("चित्र से QR कोड पढ़ने में असमर्थ। कृपया स्पष्ट mAadhaar QR कोड की फोटो चुनें। (Could not detect QR code in this image).");
    }
  };

  // Handle Instant Demo Test Clicks
  const handleDemoTest = (qrString) => {
    handleQrDetected(qrString);
  };

  if (!isAadhaarModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbrown/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-darkbrown via-teal-dark to-darkbrown text-cream p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5 text-softYellow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-white leading-tight">mAadhaar QR सत्यापन</h2>
                <span className="px-2 py-0.5 rounded-full bg-softYellow/20 text-softYellow text-[10px] font-extrabold uppercase tracking-wider border border-softYellow/30">
                  UIDAI Spec
                </span>
              </div>
              <p className="text-xs text-cream/70 mt-0.5">
                2048-bit डिजिटल हस्ताक्षर द्वारा त्वरित व सुरक्षित सत्यापन
              </p>
            </div>
          </div>
          <button
            onClick={closeAadhaarModal}
            className="p-1.5 rounded-full hover:bg-white/10 text-cream/70 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-cream-dark px-4 py-2 border-b border-darkbrown/10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              setVerificationError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'camera'
                ? 'bg-white text-darkbrown shadow-sm border border-darkbrown/10'
                : 'text-darkbrown/60 hover:text-darkbrown'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-teal" />
            <span>कैमरा स्कैन</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setVerificationError(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-darkbrown shadow-sm border border-darkbrown/10'
                : 'text-darkbrown/60 hover:text-darkbrown'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-terracotta" />
            <span>फोटो अपलोड</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('demo');
              setVerificationError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-softYellow text-darkbrown shadow-sm font-black'
                : 'text-darkbrown/60 hover:text-darkbrown'
            }`}
            title="Fast 1-click test cards for hackathon judges"
          >
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span>डेमो टेस्ट</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Verification in Progress State */}
          {verifying && (
            <div className="p-6 rounded-2xl bg-teal-light/40 border border-teal/20 text-center space-y-3 animate-in fade-in">
              <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>
                <div className="font-extrabold text-xs text-darkbrown">
                  UIDAI डिजिटल हस्ताक्षर सत्यापित किया जा रहा है...
                </div>
                <div className="text-[11px] text-darkbrown/60 mt-1">
                  2048-bit RSA Digital Signature check in progress (Checking payload authenticity)
                </div>
              </div>
            </div>
          )}

          {/* Verification Success State */}
          {verificationSuccess && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-black text-emerald-900 leading-tight">
                    mAadhaar डिजिटल सत्यापन सफल!
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-0.5">
                    UIDAI Secure QR verified successfully.
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-emerald-800 font-bold">आधार कार्ड पर नाम:</span>
                  <span className="font-black text-darkbrown">{verificationSuccess.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-800 font-bold">आधार संख्या (Masked):</span>
                  <span className="font-mono font-black text-darkbrown">XXXX XXXX {verificationSuccess.last4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-800 font-bold">सत्यापन स्थिति:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    अधिकृत (Authorized for Give/Take)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Verification Error State */}
          {verificationError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-950 space-y-2 animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-red-900">
                    सत्यापन त्रुटि (Verification Error)
                  </div>
                  <div className="text-xs text-red-800 font-medium mt-1 leading-relaxed">
                    {verificationError}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setVerificationError(null);
                    if (activeTab === 'camera') {
                      setActiveTab('camera');
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                >
                  पुनः प्रयास करें
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: CAMERA SCANNER */}
          {activeTab === 'camera' && !verifying && !verificationSuccess && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold mb-2">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="px-3 py-1.5 rounded-xl bg-terracotta text-white font-black text-xs shadow-sm hover:bg-terracotta-hover transition"
                  >
                    फोटो अपलोड करें &rarr;
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-bold text-darkbrown/70 mb-2 flex items-center justify-between">
                    <span>अपने mAadhaar / e-Aadhaar QR कोड को फ्रेम में रखें:</span>
                    {scanning && (
                      <span className="flex items-center gap-1 text-[11px] text-teal font-extrabold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-teal"></span>
                        लाइव
                      </span>
                    )}
                  </div>

                  {/* Html5Qrcode Scanner Target Viewport */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-teal/50 bg-black/5 min-h-[260px] flex items-center justify-center">
                    <div id="aadhaar-qr-reader" className="w-full"></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMAGE UPLOAD */}
          {activeTab === 'upload' && !verifying && !verificationSuccess && (
            <div className="space-y-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 rounded-2xl border-2 border-dashed border-terracotta/40 hover:border-terracotta bg-cream/30 hover:bg-cream/60 transition text-center cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-darkbrown">
                  mAadhaar QR फोटो चुनें या यहाँ खींचें
                </div>
                <div className="text-[11px] text-darkbrown/60 mt-1">
                  JPG, PNG, या WEBP प्रारूप समर्थित
                </div>
                <button
                  type="button"
                  className="mt-3 px-4 py-1.5 rounded-full bg-terracotta text-white text-xs font-black shadow-sm group-hover:bg-terracotta-hover transition"
                >
                  फाइल अपलोड करें
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div id="aadhaar-file-hidden-reader" className="hidden"></div>
            </div>
          )}

          {/* TAB 3: DEMO TEST CARDS */}
          {activeTab === 'demo' && !verifying && !verificationSuccess && (
            <div className="space-y-3">
              <div className="text-xs font-bold text-darkbrown/70">
                परीक्षण एवं मूल्यांकन हेतु 1-क्लिक टेस्ट कार्ड:
              </div>

              {sampleQrs ? (
                <div className="grid grid-cols-1 gap-2.5">
                  {/* Valid QR Test */}
                  <button
                    type="button"
                    onClick={() => handleDemoTest(sampleQrs.validQr)}
                    className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-emerald-950">
                          1. मान्य mAadhaar Secure QR (Valid Test)
                        </div>
                        <div className="text-[10px] text-emerald-800">
                          वैध RSA डिजिटल हस्ताक्षर · सफल सत्यापन जांचें
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition" />
                  </button>

                  {/* Tampered QR Test */}
                  <button
                    type="button"
                    onClick={() => handleDemoTest(sampleQrs.tamperedQr)}
                    className="p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-300 text-left transition flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-red-950">
                          2. छेड़छाड़ किया गया QR (Tampered / Forged Test)
                        </div>
                        <div className="text-[10px] text-red-800">
                          हस्ताक्षर बेमेल (Signature Mismatch) त्रुटि प्रदर्शित करेगा
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-red-700 group-hover:translate-x-1 transition" />
                  </button>

                  {/* Binary V2 QR Test */}
                  {sampleQrs.binaryValidQr && (
                    <button
                      type="button"
                      onClick={() => handleDemoTest(sampleQrs.binaryValidQr)}
                      className="p-3 rounded-2xl bg-teal-light/50 hover:bg-teal-light border border-teal/30 text-left transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal text-white flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-darkbrown">
                            3. बाइनरी GZIP V2 Secure QR
                          </div>
                          <div className="text-[10px] text-darkbrown/60">
                            UIDAI V2 कंप्रेस्ड प्रारूप का प्रत्यक्ष परीक्षण
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-teal group-hover:translate-x-1 transition" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-darkbrown/60">
                  टेस्ट कार्ड लोड हो रहे हैं...
                </div>
              )}
            </div>
          )}

          {/* Strict Privacy Notice Box */}
          <div className="p-3 rounded-2xl bg-cream border border-darkbrown/10 text-[10px] text-darkbrown/70 leading-relaxed flex items-start gap-2">
            <Lock className="w-4 h-4 text-teal shrink-0 mt-0.5" />
            <div>
              <strong className="text-darkbrown">UIDAI गोपनीयता गारंटी:</strong> आपका 12-अंकों का पूरा आधार नंबर या कच्चा QR डेटा कभी भी हमारे सर्वर पर स्टोर नहीं किया जाता। केवल आपका नाम, जन्मतिथि, लिंग और अंतिम 4 अंक ही सुरक्षित रखे जाते हैं।
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-cream-dark p-3.5 border-t border-darkbrown/10 flex items-center justify-between text-xs">
          <span className="text-[10px] text-darkbrown/60 font-semibold">
            {user?.displayName} · {user?.area || 'Civil Lines'}
          </span>
          <button
            type="button"
            onClick={closeAadhaarModal}
            className="px-4 py-1.5 rounded-full bg-white text-darkbrown font-bold border border-darkbrown/20 hover:bg-cream transition"
          >
            बंद करें (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
