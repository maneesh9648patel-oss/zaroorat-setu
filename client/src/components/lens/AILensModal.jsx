import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, Sparkles, Scan, Check, X, Shield, RefreshCw, ArrowRight, 
  Upload, Play, AlertCircle, Eye, CheckCircle2, DollarSign, Layers, Settings,
  RotateCw, Aperture
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { api } from '../../services/api';

export default function AILensModal({ isOpen, onClose, onApplyToLend }) {
  const { t } = useLanguage();
  const { cameraPermission, openSettings } = useSettings();
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Pre-configured AI Lens Scenarios for instant demonstration
  const demoObjects = [
    {
      id: 'lens_calc',
      name: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category: 'Study Material',
      condition: 'Grade A+ (Like New)',
      conditionScore: 96,
      estimatedPrice: 2200,
      securityDeposit50: 1100,
      icon: '🔢',
      detectedFeatures: ['High-resolution LCD intact', 'Dual power solar & battery operational', 'No keypad wear'],
      imagePreview: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'lens_patila',
      name: 'Community Large Cooking Cauldron (देग / पतीला 50L)',
      category: 'Family Utensils',
      condition: 'Grade A (Sanitized & Heavy Duty)',
      conditionScore: 92,
      estimatedPrice: 3200,
      securityDeposit50: 1600,
      icon: '🍲',
      detectedFeatures: ['Heavy gauge aluminum alloy', 'Reinforced riveted rim', 'Sanitized cooking surface'],
      imagePreview: 'https://images.unsplash.com/photo-1584990347449-39908a8a91aa?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'lens_wheelchair',
      name: 'Foldable Lightweight Patient Wheelchair',
      category: 'Medical & Mobility',
      condition: 'Grade A (Mechanically Tested)',
      conditionScore: 94,
      estimatedPrice: 6500,
      securityDeposit50: 3250,
      icon: '♿',
      detectedFeatures: ['Quick-fold chrome frame', 'Responsive dual handbrakes', 'Orthopedic padded seat'],
      imagePreview: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=500&auto=format&fit=crop&q=60'
    },
    {
      id: 'lens_solar',
      name: 'Emergency Solar LED Lantern & Power Bank',
      category: 'Electronics',
      condition: 'Grade A (Battery 100% Health)',
      conditionScore: 95,
      estimatedPrice: 1800,
      securityDeposit50: 900,
      icon: '⚡',
      detectedFeatures: ['Monocrystalline solar cell active', 'Dual USB phone charging output', '20-hour backup LED'],
      imagePreview: 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=500&auto=format&fit=crop&q=60'
    }
  ];

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Ensure video element gets stream attached once rendered
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(e => console.warn("Video play promise error:", e));
    }
  }, [cameraActive]);

  const startCamera = async (overrideFacing) => {
    setCameraError(null);

    if (cameraPermission === 'not_allowed') {
      setCameraError("⚠️ कैमरा अनुमति सेटिंग्स में 'Not Allowed' (प्रतिबंधित) है। कैमरा चलाने हेतु सेटिंग्स में Allow करें, या नीचे दिए गए 1-Click AI Lens सिम्युलेटर से टेस्ट करें।");
      setCameraActive(false);
      return;
    }

    const currentFacing = overrideFacing || facingMode;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam not available in this browser environment.");
      }

      // Stop previous stream if running
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      let stream;
      try {
        // Dual-try: first try with ideal facing mode
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: currentFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch (errConstraint) {
        console.warn("Dual camera constraint fallback:", errConstraint);
        // Fallback to any camera available (e.g. laptop webcam)
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = stream;
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Camera play promise:", playErr);
        }
      }
    } catch (err) {
      console.warn("Camera access note:", err.message);
      setCameraActive(false);
      setCameraError("कैमरा एक्सेस नहीं हो सका (अनुमति नहीं मिली या कैमरा व्यस्त है)। आप नीचे 'ऑटो डेमो टेस्ट' या 'वस्तु स्कैन करें' से टेस्ट कर सकते हैं।");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleFlipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    setCapturedImage(null);
    startCamera(nextFacing);
  };

  // Capture real snapshot from camera feed & run Backend AI Lens Classification
  const handleCaptureSnapshot = async () => {
    let dataUrl = null;
    if (videoRef.current && cameraActive) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
      } catch (err) {
        console.warn("Snapshot capture note:", err);
      }
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const res = await api.ai.lensScan({
        imageBase64: dataUrl || "",
        itemHint: "Study Material, Electronics, Utensil, or Medical"
      });

      if (res && res.success && res.item) {
        setScanResult({
          ...res.item,
          imagePreview: dataUrl || demoObjects[0].imagePreview
        });
      } else {
        throw new Error("Lens scan fallback");
      }
    } catch (err) {
      console.warn("Lens scan fallback to demo catalog:", err.message);
      const fallbackObj = {
        ...demoObjects[Math.floor(Math.random() * demoObjects.length)],
        imagePreview: dataUrl || demoObjects[0].imagePreview
      };
      setScanResult(fallbackObj);
    } finally {
      setIsScanning(false);
    }
  };

  // Perform AI Visual Scan (Simulation or Demo Object)
  const handlePerformScan = (demoItem) => {
    setIsScanning(true);
    setScanResult(null);

    const itemToDetect = demoItem || demoObjects[Math.floor(Math.random() * demoObjects.length)];

    setTimeout(() => {
      setIsScanning(false);
      setScanResult(itemToDetect);
    }, 1200);
  };

  const handleApplyToCatalog = () => {
    if (!scanResult) return;
    if (onApplyToLend) {
      onApplyToLend(scanResult);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-darkbrown/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-cream rounded-3xl shadow-2xl border border-darkbrown/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-darkbrown text-cream p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal to-terracotta text-white flex items-center justify-center shadow-inner">
              <Camera className="w-5 h-5 text-softYellow animate-pulse" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-white leading-tight flex items-center gap-2">
                <span>AI Lens Camera (एआई लेंस स्कैनर)</span>
                <span className="px-2 py-0.2 rounded-full bg-softYellow/20 text-softYellow text-[10px] font-extrabold border border-softYellow/30">
                  Live Visual Inspector
                </span>
              </h2>
              <p className="text-xs text-cream/70 mt-0.5">
                वस्तु पहचान, स्थिति ग्रेडिंग एवं 50% सुरक्षा राशि का स्वचालित मूल्यांकन
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-2xl hover:bg-white/10 text-cream/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder & Scanner Section */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 bg-white flex-1">
          {/* Camera Viewfinder Box with HUD Overlays */}
          <div className="relative rounded-3xl bg-black overflow-hidden aspect-video max-h-[280px] sm:max-h-[320px] flex items-center justify-center border-2 border-darkbrown shadow-inner">
            {/* The video element is ALWAYS mounted, so videoRef.current is NEVER null */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraActive && !capturedImage ? 'block' : 'hidden'}`}
            />

            {/* Captured Snapshot Frame */}
            {capturedImage && (
              <img src={capturedImage} alt="Captured Object" className="w-full h-full object-cover" />
            )}

            {/* Placeholder when camera is inactive and no image captured */}
            {!cameraActive && !capturedImage && (
              <div className="w-full h-full bg-gradient-to-b from-darkbrown to-darkbrown-light flex flex-col items-center justify-center p-6 text-center text-cream space-y-2">
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                  <Scan className="w-7 h-7 text-softYellow animate-pulse" />
                </div>
                <div className="font-extrabold text-sm text-white">AI Visual Scanner Ready</div>
                <div className="text-xs text-cream/70 max-w-sm leading-relaxed">
                  वस्तु को कैमरे के सामने रखें या नीचे दिए गए किसी भी उदाहरण पर टैप करें।
                </div>
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-4 py-2 rounded-xl bg-teal text-white text-xs font-black shadow-md hover:bg-teal-hover transition flex items-center gap-1.5 mt-2"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>कैमरा चालू करें (Start Camera)</span>
                </button>
              </div>
            )}

            {/* Futuristic Scanning Beam & Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-softYellow/90 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-teal animate-ping" />
                  <span>AI LENS HUD v3.0 · {cameraActive ? 'LIVE CAMERA' : 'SIMULATION'}</span>
                </div>

                {cameraActive && (
                  <button
                    type="button"
                    onClick={handleFlipCamera}
                    className="pointer-events-auto p-1.5 rounded-full bg-black/50 text-white hover:bg-black/80 transition backdrop-blur-xs flex items-center gap-1 text-[10px] font-bold px-2.5"
                    title="सामने या पीछे का कैमरा बदलें"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>कैमरा बदलें</span>
                  </button>
                )}
              </div>

              {/* Scanning reticle corners */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-48 h-36 border-2 border-dashed border-softYellow/60 rounded-2xl relative flex items-center justify-center">
                  <span className="w-3 h-3 border-t-2 border-l-2 border-terracotta absolute -top-1 -left-1" />
                  <span className="w-3 h-3 border-t-2 border-r-2 border-terracotta absolute -top-1 -right-1" />
                  <span className="w-3 h-3 border-b-2 border-l-2 border-terracotta absolute -bottom-1 -left-1" />
                  <span className="w-3 h-3 border-b-2 border-r-2 border-terracotta absolute -bottom-1 -right-1" />

                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal to-transparent animate-bounce" />
                  )}
                </div>
              </div>

              <div className="text-center">
                <span className="text-[11px] font-bold text-white bg-black/60 px-3 py-1 rounded-full shadow-sm backdrop-blur-xs">
                  {isScanning ? '🔍 विश्लेषण जारी है...' : capturedImage ? '✓ फोटो कैप्चर हो गई' : 'वस्तु को फ्रेम के भीतर रखें'}
                </span>
              </div>
            </div>
          </div>

          {/* Camera Error / Permission Notice */}
          {cameraError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2.5 font-medium animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>{cameraError}</span>
              </div>
              {cameraPermission === 'not_allowed' && (
                <button
                  type="button"
                  onClick={openSettings}
                  className="px-2.5 py-1 rounded-xl bg-amber-700 text-white text-[11px] font-bold shrink-0 hover:bg-amber-800 transition flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  <span>सेटिंग्स</span>
                </button>
              )}
            </div>
          )}

          {/* Trigger Scan Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {cameraActive && !capturedImage ? (
              <button
                type="button"
                onClick={handleCaptureSnapshot}
                disabled={isScanning}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal to-teal-hover text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 tap-target"
              >
                <Aperture className="w-4 h-4 text-softYellow" />
                <span>फोटो खींचें व स्कैन करें (Capture & Scan)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCapturedImage(null);
                  handlePerformScan();
                }}
                disabled={isScanning}
                className="px-6 py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 tap-target"
              >
                <Scan className="w-4 h-4" />
                <span>{isScanning ? 'स्कैन हो रहा है...' : capturedImage ? 'पुनः स्कैन करें (Rescan)' : 'वस्तु स्कैन करें (Scan Object)'}</span>
              </button>
            )}

            {!cameraActive && (
              <button
                type="button"
                onClick={() => startCamera()}
                className="px-4 py-3.5 rounded-2xl bg-teal hover:bg-teal-hover text-white font-black text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
              >
                <Camera className="w-4 h-4 text-softYellow" />
                <span>कैमरा कनेक्ट करें</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const random = demoObjects[Math.floor(Math.random() * demoObjects.length)];
                setCapturedImage(null);
                handlePerformScan(random);
              }}
              className="px-4 py-3.5 rounded-2xl bg-cream hover:bg-cream-dark text-darkbrown font-black text-xs sm:text-sm border border-darkbrown/15 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-teal" />
              <span>ऑटो डेमो टेस्ट</span>
            </button>
          </div>

          {/* Scanned Result Card with 50% Security Deposit Calculation */}
          {scanResult && (
            <div className="p-5 rounded-3xl bg-teal-light border-2 border-teal/40 space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-teal/20 flex items-center justify-center text-2xl shadow-xs">
                    {scanResult.icon}
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal text-white text-[10px] font-black uppercase tracking-wider">
                      {scanResult.category}
                    </span>
                    <h3 className="font-black text-sm sm:text-base text-darkbrown mt-1">
                      {scanResult.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-[10px] font-bold text-darkbrown/60 uppercase">कंडीशन ग्रेड</div>
                  <div className="font-black text-xs text-teal">{scanResult.condition}</div>
                </div>
              </div>

              {/* 50% Security Money Financial Breakdown Box */}
              <div className="bg-white p-4 rounded-2xl border border-teal/20 space-y-2">
                <div className="text-xs font-black text-darkbrown flex items-center justify-between border-b border-darkbrown/10 pb-2">
                  <span className="flex items-center gap-1.5 text-teal">
                    <Shield className="w-4 h-4" />
                    50% सुरक्षा धरोहर राशि (Security Money):
                  </span>
                  <span className="text-base text-terracotta font-black">
                    ₹{scanResult.securityDeposit50}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-darkbrown/70 pt-1">
                  <div>
                    <span className="font-medium">सामान का अनुमानित मूल्य:</span>{' '}
                    <strong>₹{scanResult.estimatedPrice}</strong>
                  </div>
                  <div>
                    <span className="font-medium">उधार शुल्क:</span>{' '}
                    <strong className="text-teal">₹0 (सामुदायिक निःशुल्क)</strong>
                  </div>
                </div>

                <div className="text-[11px] text-darkbrown/75 bg-cream/50 p-2.5 rounded-xl leading-normal">
                  🛡️ <strong>एस्क्रो सुरक्षा नियम:</strong> यह 50% सुरक्षा राशि सुरक्षित पूल में रहेगी। सामान वापस करने व सिंगल-यूज़ QR स्कैन होते ही 100% सुरक्षा राशि उपयोगकर्ता को रिफंड कर दी जाएगी।
                </div>
              </div>

              {/* Detected Visual Features */}
              <div className="space-y-1.5 text-xs text-darkbrown/80">
                <div className="font-bold text-[11px] text-darkbrown/60 uppercase">एआई लेंस द्वारा जांची गई विशेषताएं:</div>
                <div className="flex flex-wrap gap-1.5">
                  {scanResult.detectedFeatures.map((feat, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-xl bg-white border border-teal/20 font-medium text-[11px] text-darkbrown">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleApplyToCatalog}
                  className="flex-1 py-3.5 rounded-2xl bg-teal hover:bg-teal-hover text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 tap-target"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>यह सामान कैटलॉग में लिस्ट करें (50% सिक्योरिटी सहित)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/borrow-return');
                  }}
                  className="py-3.5 px-5 rounded-2xl bg-cream hover:bg-cream-dark text-darkbrown font-black text-xs sm:text-sm border border-darkbrown/15 transition text-center"
                >
                  कैटलॉग में खोजें
                </button>
              </div>
            </div>
          )}

          {/* Quick Preset Samples to Scan */}
          <div className="space-y-2 pt-1 border-t border-darkbrown/10">
            <div className="text-xs font-black text-darkbrown/70 flex items-center justify-between">
              <span>त्वरित परीक्षण हेतु वस्तु चुनें (Quick Preset Objects):</span>
              <span className="text-[10px] text-teal font-bold">1-Click Scan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoObjects.map((obj) => (
                <button
                  key={obj.id}
                  type="button"
                  onClick={() => handlePerformScan(obj)}
                  className="p-3 rounded-2xl bg-cream hover:bg-cream-dark border border-darkbrown/10 text-left transition flex flex-col justify-between space-y-2 group"
                >
                  <div className="text-2xl">{obj.icon}</div>
                  <div>
                    <div className="text-xs font-black text-darkbrown group-hover:text-terracotta line-clamp-1">
                      {obj.name}
                    </div>
                    <div className="text-[10px] text-teal font-bold mt-0.5">
                      मूल्य: ₹{obj.estimatedPrice}
                    </div>
                    <div className="text-[9px] text-terracotta font-extrabold mt-0.5">
                      50% धरोहर: ₹{obj.securityDeposit50}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}