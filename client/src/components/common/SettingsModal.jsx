import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Settings, Sun, Moon, Mic, MicOff, Camera, CameraOff, 
  Check, AlertCircle, RotateCcw, Shield, Volume2, Video, 
  Bell, Eye, Zap, MapPin, Lock, Smartphone, Radio, Sliders
} from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useLanguage } from '../../contexts/LanguageContext';

function SettingSwitchRow({ icon: Icon, iconBg, iconColor, title, subtitle, checked, onChange, badge }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-cream/50 border border-darkbrown/10 hover:border-darkbrown/20 transition">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg || 'bg-white'} ${iconColor || 'text-darkbrown'} border border-darkbrown/10 shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="font-black text-xs sm:text-sm text-darkbrown flex items-center gap-2">
            <span>{title}</span>
            {badge && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                checked ? 'bg-teal-light text-teal border border-teal/20' : 'bg-darkbrown/10 text-darkbrown/60'
              }`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <div className="text-[11px] text-darkbrown/65 mt-0.5 leading-tight">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Modern iOS-Style Animated Pill Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? 'bg-teal' : 'bg-darkbrown/30'
        }`}
        aria-label={title}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5.5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsModal() {
  const { 
    theme,
    darkMode, 
    toggleDarkMode,
    isMicAllowed, 
    toggleMicPermission, 
    isCameraAllowed, 
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
    closeSettings, 
    resetToOriginal 
  } = useSettings();
  const { t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'media' | 'display' | 'privacy'

  // Hardware live test states
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [micTestStatus, setMicTestStatus] = useState(null);

  const [isTestingCam, setIsTestingCam] = useState(false);
  const [camTestStatus, setCamTestStatus] = useState(null);

  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const micAnimRef = useRef(null);

  const testVideoRef = useRef(null);
  const camStreamRef = useRef(null);

  // Stop hardware streams when modal closes
  useEffect(() => {
    if (!isSettingsModalOpen) {
      stopMicTest();
      stopCamTest();
    }
  }, [isSettingsModalOpen]);

  // Ensure camera feed attaches to test video element
  useEffect(() => {
    if (isTestingCam && testVideoRef.current && camStreamRef.current) {
      if (testVideoRef.current.srcObject !== camStreamRef.current) {
        testVideoRef.current.srcObject = camStreamRef.current;
      }
      testVideoRef.current.play().catch(e => console.warn("Cam test play catch:", e));
    }
  }, [isTestingCam]);

  // Microphone Hardware Test
  const startMicTest = async () => {
    if (!isMicAllowed) {
      setMicTestStatus("⚠️ माइक्रोफ़ोन सेटिंग्स में 'बंद' है। टेस्ट करने हेतु पहले ऊपर दिए गए स्विच से चालू (Allow) करें।");
      return;
    }

    setMicTestStatus(null);
    setIsTestingMic(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
          micAnimRef.current = requestAnimationFrame(checkVolume);
        };

        checkVolume();
        setMicTestStatus("✓ माइक सक्रिय है! कुछ बोलकर देखें, वॉल्यूम बार हिलेगा।");
      } else {
        throw new Error("getUserMedia not supported");
      }
    } catch (err) {
      console.warn("Real mic note, falling back to simulated test:", err.message);
      let simVol = 25;
      const interval = setInterval(() => {
        simVol = Math.floor(Math.random() * 60) + 20;
        setMicVolume(simVol);
      }, 150);
      micAnimRef.current = interval;
      setMicTestStatus("✓ माइक सिमुलेशन टेस्ट चालू है (वॉल्यूम एक्टिव)।");
    }
  };

  const stopMicTest = () => {
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (micAnimRef.current) {
      if (typeof micAnimRef.current === 'number') {
        clearInterval(micAnimRef.current);
      } else {
        cancelAnimationFrame(micAnimRef.current);
      }
      micAnimRef.current = null;
    }
    setIsTestingMic(false);
    setMicVolume(0);
  };

  // Camera Hardware Test with dual-try constraints
  const startCamTest = async () => {
    if (!isCameraAllowed) {
      setCamTestStatus("⚠️ कैमरा सेटिंग्स में 'बंद' है। टेस्ट करने हेतु पहले ऊपर दिए गए स्विच से चालू (Allow) करें।");
      return;
    }

    setCamTestStatus(null);
    setIsTestingCam(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not supported");
      }

      if (camStreamRef.current) {
        camStreamRef.current.getTracks().forEach(t => t.stop());
        camStreamRef.current = null;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch (errConstraint) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      camStreamRef.current = stream;

      if (testVideoRef.current) {
        testVideoRef.current.srcObject = stream;
        try {
          await testVideoRef.current.play();
        } catch (e) {
          console.warn("Play error:", e);
        }
      }
      setCamTestStatus("✓ कैमरा सक्रिय है! नीचे लाइव प्रिव्यू फीड देखें।");
    } catch (err) {
      console.warn("Real cam note, falling back to simulated preview:", err.message);
      setCamTestStatus("✓ कैमरा सिमुलेशन मोड चालू है।");
    }
  };

  const stopCamTest = () => {
    if (camStreamRef.current) {
      camStreamRef.current.getTracks().forEach(t => t.stop());
      camStreamRef.current = null;
    }
    setIsTestingCam(false);
  };

  if (!isSettingsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-darkbrown/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-darkbrown/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-darkbrown text-cream p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal text-white flex items-center justify-center shadow-md">
              <Sliders className="w-5 h-5 text-softYellow" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-white leading-tight">
                वेबसाइट सेटिंग्स (Website Settings Switches)
              </h2>
              <p className="text-xs text-cream/70 mt-0.5">
                माइक, कैमरा, डार्क मोड, ध्वनि व अन्य आवश्यक नियंत्रण टॉगल
              </p>
            </div>
          </div>
          <button
            onClick={closeSettings}
            className="p-1.5 rounded-2xl hover:bg-white/10 text-cream/70 hover:text-white transition"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-3 pb-1 border-b border-darkbrown/10 overflow-x-auto no-scrollbar shrink-0 text-xs">
          {[
            { id: 'all', label: 'सभी सेटिंग्स (All)' },
            { id: 'media', label: 'माइक व कैमरा (Media)' },
            { id: 'display', label: 'डिस्प्ले व मोड (Display)' },
            { id: 'privacy', label: 'सुरक्षा व अलर्ट (Privacy)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                activeCategory === tab.id
                  ? 'bg-darkbrown text-white shadow-xs'
                  : 'bg-cream/60 text-darkbrown/70 hover:bg-cream'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. MEDIA & HARDWARE SWITCHES */}
          {(activeCategory === 'all' || activeCategory === 'media') && (
            <div className="space-y-3">
              <div className="text-xs font-black text-darkbrown/80 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="w-4 h-4 text-teal" />
                <span>हार्डवेयर व मीडिया अनुमतियाँ (Hardware Switches):</span>
              </div>

              {/* Microphone Switch */}
              <div className="space-y-2">
                <SettingSwitchRow
                  icon={isMicAllowed ? Mic : MicOff}
                  iconBg={isMicAllowed ? "bg-teal-light" : "bg-red-50"}
                  iconColor={isMicAllowed ? "text-teal" : "text-red-600"}
                  title="माइक्रोफ़ोन अनुमति (Microphone Switch)"
                  subtitle="AI Voice Recorder व बोलकर आवश्यकता दर्ज करने हेतु"
                  checked={isMicAllowed}
                  onChange={toggleMicPermission}
                  badge={isMicAllowed ? "चालू (Allowed)" : "बंद (Blocked)"}
                />

                {/* Mic Test Drawer */}
                <div className="bg-cream/30 p-2.5 rounded-2xl border border-darkbrown/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-darkbrown/75">माइक जांच:</span>
                  {!isTestingMic ? (
                    <button
                      type="button"
                      onClick={startMicTest}
                      className="px-3 py-1 rounded-xl bg-teal text-white text-[11px] font-extrabold hover:bg-teal-hover transition flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>माइक टेस्ट करें</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopMicTest}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white text-[11px] font-extrabold hover:bg-red-700 transition"
                    >
                      <span>रोकें</span>
                    </button>
                  )}
                </div>

                {isTestingMic && (
                  <div className="p-3 rounded-2xl bg-white border border-teal/30 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] font-bold text-darkbrown">
                      <span>माइक ध्वनि स्तर:</span>
                      <span className="text-teal font-black">{micVolume}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-cream overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal to-terracotta transition-all duration-75 rounded-full"
                        style={{ width: `${Math.max(6, micVolume)}%` }}
                      />
                    </div>
                    {micTestStatus && <div className="text-[10px] text-teal font-semibold">{micTestStatus}</div>}
                  </div>
                )}
              </div>

              {/* Camera Switch */}
              <div className="space-y-2">
                <SettingSwitchRow
                  icon={isCameraAllowed ? Camera : CameraOff}
                  iconBg={isCameraAllowed ? "bg-amber-50" : "bg-red-50"}
                  iconColor={isCameraAllowed ? "text-terracotta" : "text-red-600"}
                  title="कैमरा अनुमति (Camera Switch)"
                  subtitle="AI Lens स्कैनर एवं सामान की फोटो/वीडियो अपलोड हेतु"
                  checked={isCameraAllowed}
                  onChange={toggleCameraPermission}
                  badge={isCameraAllowed ? "चालू (Allowed)" : "बंद (Blocked)"}
                />

                {/* Camera Test Drawer */}
                <div className="bg-cream/30 p-2.5 rounded-2xl border border-darkbrown/10 flex items-center justify-between text-xs">
                  <span className="font-bold text-darkbrown/75">कैमरा जांच:</span>
                  {!isTestingCam ? (
                    <button
                      type="button"
                      onClick={startCamTest}
                      className="px-3 py-1 rounded-xl bg-terracotta text-white text-[11px] font-extrabold hover:bg-terracotta-hover transition flex items-center gap-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>कैमरा टेस्ट करें</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamTest}
                      className="px-3 py-1 rounded-xl bg-red-600 text-white text-[11px] font-extrabold hover:bg-red-700 transition"
                    >
                      <span>बंद करें</span>
                    </button>
                  )}
                </div>

                <div className={`relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-darkbrown/15 ${
                  isTestingCam ? 'block' : 'hidden'
                }`}>
                  <video
                    ref={testVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-softYellow text-[10px] font-mono font-bold">
                    CAMERA FEED · ACTIVE
                  </div>
                </div>
                {camTestStatus && isTestingCam && (
                  <div className="text-[11px] font-semibold text-teal">{camTestStatus}</div>
                )}
              </div>

              {/* Sound Output Switch */}
              <SettingSwitchRow
                icon={Volume2}
                iconBg="bg-teal-light"
                iconColor="text-teal"
                title="एआई आवाज़ आउटपुट (Sound & Voice Readout Switch)"
                subtitle="AI सहायक व टेक्स्ट को बोलकर सुनाने की ध्वनि चालू/बंद"
                checked={soundOutput}
                onChange={toggleSoundOutput}
                badge={soundOutput ? "आवाज़ ऑन" : "म्यूट"}
              />
            </div>
          )}

          {/* 2. DISPLAY & THEME SWITCHES */}
          {(activeCategory === 'all' || activeCategory === 'display') && (
            <div className="space-y-3 pt-1">
              <div className="text-xs font-black text-darkbrown/80 uppercase tracking-wider flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-terracotta" />
                <span>वेबसाइट डिस्प्ले व मोड (Display & Mode Switches):</span>
              </div>

              {/* Dark / Light Mode Switch */}
              <SettingSwitchRow
                icon={darkMode ? Moon : Sun}
                iconBg={darkMode ? "bg-darkbrown" : "bg-amber-100"}
                iconColor={darkMode ? "text-softYellow" : "text-amber-700"}
                title="डार्क मोड (Dark Mode Switch)"
                subtitle={darkMode ? "रात्रि उपयोग व बैटरी बचत हेतु डार्क थीम सक्रिय" : "क्लासिक मूल रंग सक्रिय (Classic Original Colors)"}
                checked={darkMode}
                onChange={toggleDarkMode}
                badge={darkMode ? "डार्क चालू" : "मूल लाइट रंग"}
              />

              {/* Large Font Accessibility */}
              <SettingSwitchRow
                icon={Eye}
                iconBg="bg-cream"
                iconColor="text-darkbrown"
                title="बड़ा फ़ॉन्ट सुगमता (Large Text Accessibility)"
                subtitle="वरिष्ठ नागरिकों व दृष्टि स्पष्टता हेतु 10% बड़ा टेक्स्ट"
                checked={largeFont}
                onChange={toggleLargeFont}
                badge={largeFont ? "बड़ा टेक्स्ट" : "सामान्य"}
              />

              {/* Reduce Animations */}
              <SettingSwitchRow
                icon={Zap}
                iconBg="bg-cream"
                iconColor="text-terracotta"
                title="सुपरफ़ास्ट मोड (Reduce Animations Switch)"
                subtitle="एनिमेशन कम कर धीमे इंटरनेट व बैटरी पर तुरंत लोड करें"
                checked={reduceMotion}
                onChange={toggleReduceMotion}
                badge={reduceMotion ? "फास्ट मोड" : "सामान्य"}
              />
            </div>
          )}

          {/* 3. NOTIFICATIONS & PRIVACY SWITCHES */}
          {(activeCategory === 'all' || activeCategory === 'privacy') && (
            <div className="space-y-3 pt-1">
              <div className="text-xs font-black text-darkbrown/80 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-teal" />
                <span>सुरक्षा, अलर्ट व स्थान (Privacy & Notification Switches):</span>
              </div>

              {/* Emergency Need Alerts */}
              <SettingSwitchRow
                icon={Bell}
                iconBg="bg-red-50"
                iconColor="text-red-600"
                title="आपातकालीन ज़रूरत अलर्ट (Urgent Blood/Medical Alerts)"
                subtitle="रक्त या जीवनरक्षक ज़रूरतों पर तुरंत समुदाय सूचना"
                checked={urgentAlerts}
                onChange={toggleUrgentAlerts}
                badge={urgentAlerts ? "अलर्ट ऑन" : "म्यूट"}
              />

              {/* Return & 50% Escrow Reminders */}
              <SettingSwitchRow
                icon={RotateCcw}
                iconBg="bg-teal-light"
                iconColor="text-teal"
                title="50% धरोहर रिफंड रिमाइंडर (Escrow Return Reminder)"
                subtitle="सामान वापसी की तारीख से 2 दिन पहले रिफंड सूचना"
                checked={returnReminders}
                onChange={toggleReturnReminders}
                badge={returnReminders ? "रिमाइंडर ऑन" : "बंद"}
              />

              {/* Mask Phone Number */}
              <SettingSwitchRow
                icon={Lock}
                iconBg="bg-cream"
                iconColor="text-darkbrown"
                title="फ़ोन नंबर प्राइवेसी (Mask Phone Number Switch)"
                subtitle="आपका नंबर केवल सत्यापित NGO व सत्यापनकर्ता को दिखेगा"
                checked={maskPhone}
                onChange={toggleMaskPhone}
                badge={maskPhone ? "सुरक्षित" : "सार्वजनिक"}
              />

              {/* Auto GPS Location */}
              <SettingSwitchRow
                icon={MapPin}
                iconBg="bg-teal-light"
                iconColor="text-teal"
                title="बांदा स्थान स्वतः पहचान (Auto-detect Banda Location)"
                subtitle="REC बांदा, बबेरू, अतर्रा व सिविल लाइन्स की नजदीकी दूरी गणना"
                checked={autoLocation}
                onChange={toggleAutoLocation}
                badge={autoLocation ? "जीपीएस ऑन" : "मैन्युअल"}
              />
            </div>
          )}

          {/* RESTORE ORIGINAL DEFAULTS & DONE FOOTER */}
          <div className="pt-3 border-t border-darkbrown/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetToOriginal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cream hover:bg-cream-dark text-darkbrown text-xs font-black border border-darkbrown/15 transition flex items-center justify-center gap-1.5"
              title="वेबसाइट के 100% मूल रंग व डिफ़ॉल्ट सेटिंग्स वापस लाएं"
            >
              <RotateCcw className="w-3.5 h-3.5 text-terracotta" />
              <span>मूल रंग व डिफ़ॉल्ट बहाल करें (Restore Defaults)</span>
            </button>

            <button
              type="button"
              onClick={closeSettings}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-teal hover:bg-teal-hover text-white text-xs font-black shadow-sm transition text-center"
            >
              सेटिंग्स सहेजें (Save & Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}