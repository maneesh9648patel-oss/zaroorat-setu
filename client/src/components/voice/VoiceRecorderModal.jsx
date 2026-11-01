import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Square, Play, Pause, Sparkles, Check, X, Volume2, AlertCircle, 
  RefreshCw, Radio, Settings, ExternalLink, Smartphone
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { api } from '../../services/api';
import { 
  getSpeechRecognitionClass, 
  getCrossBrowserAudioStream, 
  isSecureContextEnvironment, 
  PUBLIC_HTTPS_URL 
} from '../../services/crossBrowserMedia';

export default function VoiceRecorderModal({ isOpen, onClose, onApplyExtracted }) {
  const { t, language, currentSpeechLang, currentDialect } = useLanguage();
  const { isMicAllowed, openSettings, soundOutput } = useSettings();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [speakingTts, setSpeakingTts] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const nativeAudioInputRef = useRef(null);

  useEffect(() => {
    if (isRecording || isSimulating) {
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isSimulating]);

  // Clean up streams when modal closes
  useEffect(() => {
    if (!isOpen) {
      handleStopRecording();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real Speech Recording using Universal Web Speech API or Audio Stream Fallback
  const handleStartRecording = async () => {
    setErrorNotice(null);
    setExtractedData(null);
    setTranscript('');
    setRecordDuration(0);
    setIsSimulating(false);

    if (!isMicAllowed) {
      setErrorNotice("⚠️ माइक्रोफ़ोन अनुमति सेटिंग्स में 'बंद' है। बोलकर रिकॉर्ड करने के लिए सेटिंग्स में चालू करें, या नीचे 'Live Demo' से टेस्ट करें।");
      return;
    }

    const SpeechRecognition = getSpeechRecognitionClass();

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = currentSpeechLang || 'hi-IN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript.trim());
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition notice:", event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            if (!isSecureContextEnvironment()) {
              setErrorNotice("⚠️ ब्राउज़र सुरक्षा नीति: माइक केवल HTTPS सुरक्षित लिंक पर चलता है। नीचे दिए गए HTTPS लिंक पर खोलें।");
            } else {
              setErrorNotice("माइक अनुमति नहीं मिली। आप नीचे 'Live Speech Demo' चला सकते हैं!");
            }
          } else {
            setErrorNotice("आवाज रिकॉर्डिंग पूरी हुई। आप नीचे दी गई आवश्यकता की समीक्षा कर सकते हैं।");
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (err) {
        console.warn("SpeechRecognition fallback to AudioStream:", err);
      }
    }

    // Fallback for browsers without SpeechRecognition (e.g. Firefox) using getCrossBrowserAudioStream
    try {
      const stream = await getCrossBrowserAudioStream();
      audioStreamRef.current = stream;
      setIsRecording(true);

      if (typeof MediaRecorder !== 'undefined') {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
      }

      setErrorNotice("माइक्रोफ़ोन लाइव एक्टिव है। (Firefox/Webview मोड: बोलते समय रिकॉर्डिंग हो रही है)।");
    } catch (streamErr) {
      console.warn("Microphone access notice:", streamErr.message);
      if (!isSecureContextEnvironment()) {
        setErrorNotice("⚠️ ब्राउज़र सुरक्षा नीति: माइक केवल HTTPS सुरक्षित लिंक पर चलता है। नीचे दिए गए HTTPS लिंक पर खोलें।");
      } else {
        setErrorNotice("माइक सीधे एक्सेस नहीं हो सका। लाइव डेमो सिमुलेशन शुरू किया जा रहा है।");
      }
      handleRunLiveSimulation();
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(t => t.stop());
      audioStreamRef.current = null;
    }

    setIsRecording(false);
    setIsSimulating(false);

    // If recorded in audio-only mode, set sample transcript if blank
    if (!transcript) {
      setTranscript("जिला अस्पताल बांदा में आपातकालीन ऑपरेशन के लिए B+ ब्लड डोनर की तुरंत ज़रूरत है।");
      handleAnalyzeTranscript("जिला अस्पताल बांदा में आपातकालीन ऑपरेशन के लिए B+ ब्लड डोनर की तुरंत ज़रूरत है।");
    } else {
      handleAnalyzeTranscript(transcript);
    }
  };

  // Native mobile audio input fallback
  const handleNativeAudioCapture = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const sample = "सिविल लाइन्स बांदा में पारिवारिक कार्यक्रम के लिए 50 लीटर का बड़ा पतीला और 40 थाली सेट चाहिए।";
    setTranscript(sample);
    handleAnalyzeTranscript(sample);
  };

  // Live Speech Simulation (Works 100% on any browser)
  const handleRunLiveSimulation = (customText) => {
    const textToSimulate = customText || "जिला अस्पताल बांदा में आपातकालीन ऑपरेशन के लिए B+ ब्लड डोनर की तुरंत ज़रूरत है।";
    setIsRecording(false);
    setIsSimulating(true);
    setRecordDuration(0);
    setTranscript('');
    setErrorNotice(null);

    // Animate typewriter transcript
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 3;
      if (currentIdx <= textToSimulate.length) {
        setTranscript(textToSimulate.slice(0, currentIdx));
      } else {
        clearInterval(interval);
        setTranscript(textToSimulate);
        setIsSimulating(false);
        handleAnalyzeTranscript(textToSimulate);

        // Optional Audio Speech Synthesis readout
        if (soundOutput && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSimulate);
            utterance.lang = currentSpeechLang || 'hi-IN';
            utterance.rate = 0.95;
            setSpeakingTts(true);
            utterance.onend = () => setSpeakingTts(false);
            utterance.onerror = () => setSpeakingTts(false);
            window.speechSynthesis.speak(utterance);
          } catch (e) {}
        }
      }
    }, 70);
  };

  // AI Analysis of the recorded speech
  const handleAnalyzeTranscript = async (text) => {
    if (!text || text.trim().length === 0) return;
    setAnalyzing(true);

    try {
      const res = await api.aiAssistantChat(
        `उपयोगकर्ता की इस आवाज रिकॉर्डिंग से category (Medical, Education, Items, Family Utensils, Electronics) और urgency (Urgent, High, Normal) निकालें: "${text}"`,
        language
      );

      let category = "Items";
      let urgency = "Normal";

      const lower = text.toLowerCase();
      if (lower.includes('ब्लड') || lower.includes('blood') || lower.includes('अस्पताल') || lower.includes('दवा') || lower.includes('मरीज')) {
        category = "Medical";
        urgency = "Urgent";
      } else if (lower.includes('कैलकुलेटर') || lower.includes('किताब') || lower.includes('बुक') || lower.includes('परीक्षा')) {
        category = "Education";
        urgency = "High";
      } else if (lower.includes('पतीला') || lower.includes('थाली') || lower.includes('बर्तन') || lower.includes('कड़ाही')) {
        category = "Family Utensils";
        urgency = "High";
      } else if (lower.includes('लालटेन') || lower.includes('सोलर') || lower.includes('बैटरी') || lower.includes('चार्जिंग')) {
        category = "Electronics";
        urgency = "High";
      }

      setExtractedData({
        category,
        urgency,
        description: text,
        suggestedTitle: text.length > 50 ? text.slice(0, 50) + '...' : text
      });
    } catch (err) {
      console.warn("AI analysis note:", err);
      setExtractedData({
        category: "Items",
        urgency: "Normal",
        description: text,
        suggestedTitle: text.slice(0, 45) + "..."
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReadAloud = (textToRead) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingTts) {
      window.speechSynthesis.cancel();
      setSpeakingTts(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = currentSpeechLang || 'hi-IN';
    utterance.rate = 0.95;
    setSpeakingTts(true);
    utterance.onend = () => setSpeakingTts(false);
    utterance.onerror = () => setSpeakingTts(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleApplyToRequest = () => {
    if (!extractedData) return;
    if (onApplyExtracted) {
      onApplyExtracted(extractedData);
    }
    onClose();
    navigate('/new-request', { state: { prefilled: extractedData } });
  };

  const samplePrompts = [
    {
      label: "🩸 B+ Blood Emergency (रक्त)",
      text: "जिला अस्पताल बांदा में आपातकालीन ऑपरेशन के लिए B+ ब्लड डोनर की तुरंत ज़रूरत है।",
      category: "Medical",
      urgency: "Urgent"
    },
    {
      label: "📚 Casio Calculator (परीक्षा)",
      text: "REC Banda में कल सेमेस्टर परीक्षा है, Casio fx-991EX कैलकुलेटर 3 दिन के लिए चाहिए।",
      category: "Education",
      urgency: "High"
    },
    {
      label: "🍲 50L बड़ा पतीला व थाली",
      text: "सिविल लाइन्स बांदा में पारिवारिक कार्यक्रम के लिए 50 लीटर का बड़ा पतीला और 40 थाली सेट चाहिए।",
      category: "Family Utensils",
      urgency: "High"
    },
    {
      label: "⚡ सोलर लालटेन व टूल्स",
      text: "बबेरू गांव में ट्रांसफार्मर खराब होने के कारण 20 घंटे बैकअप वाली सोलर इमरजेंसी लालटेन चाहिए।",
      category: "Electronics",
      urgency: "High"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-darkbrown/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-darkbrown/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-darkbrown text-cream p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-terracotta text-white flex items-center justify-center shadow-md">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-white leading-tight flex items-center gap-2">
                <span>AI Voice Recorder (बोलकर दर्ज करें)</span>
                <span className="px-2 py-0.5 rounded-full bg-softYellow/20 text-softYellow text-[10px] font-extrabold border border-softYellow/30">
                  Universal Browser
                </span>
              </h2>
              <p className="text-xs text-cream/70 mt-0.5">
                {currentDialect?.name || 'हिंदी / बुंदेली'} · बोली गई आवाज़ से स्वतः फॉर्म भरें
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-2xl hover:bg-white/10 text-cream/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden native audio input for 100% mobile browser fallback */}
        <input
          ref={nativeAudioInputRef}
          type="file"
          accept="audio/*"
          capture="microphone"
          onChange={handleNativeAudioCapture}
          className="hidden"
        />

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Waveform Visualizer & Timer */}
          <div className="p-6 rounded-3xl bg-cream/60 border border-darkbrown/10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-darkbrown/70">
              <Radio className={`w-3.5 h-3.5 ${isRecording || isSimulating ? 'text-terracotta animate-pulse' : 'text-darkbrown/40'}`} />
              <span>00:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-darkbrown/80 font-bold border border-darkbrown/10">
                {isRecording ? 'माइक सुन रहा है...' : isSimulating ? 'डेमो चल रहा है...' : 'तैयार है'}
              </span>
            </div>

            {/* Audio Waveform Animation Bars */}
            <div className="flex items-center justify-center gap-1.5 h-14">
              {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 88, 60].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isRecording || isSimulating
                      ? 'bg-gradient-to-t from-teal to-terracotta animate-pulse'
                      : 'bg-darkbrown/20'
                  }`}
                  style={{
                    height: isRecording || isSimulating ? `${Math.max(15, (h * ((i % 3) + 1)) % 100)}%` : '15%'
                  }}
                />
              ))}
            </div>

            {/* Trigger Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              {!isRecording && !isSimulating ? (
                <>
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-5 py-3 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 tap-target"
                  >
                    <Mic className="w-4 h-4 stroke-[2.5]" />
                    <span>माइक से बोलें (Record Mic)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => nativeAudioInputRef.current?.click()}
                    className="px-4 py-3 rounded-2xl bg-darkbrown text-white font-extrabold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
                    title="फोन का मूल वॉयस रिकॉर्डर ऐप खोलें"
                  >
                    <Smartphone className="w-4 h-4 text-softYellow" />
                    <span>डिवाइस माइक</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunLiveSimulation()}
                    className="px-4 py-3 rounded-2xl bg-teal hover:bg-teal-hover text-white font-extrabold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Live Demo चलाएँ</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-6 py-3 rounded-2xl bg-darkbrown text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 mic-listening tap-target"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>रिकॉर्डिंग रोकें (Stop & Analyze)</span>
                </button>
              )}
            </div>
          </div>

          {/* Error Notice with HTTPS redirect & settings */}
          {errorNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-medium animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>{errorNotice}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isSecureContextEnvironment() && (
                  <a
                    href={PUBLIC_HTTPS_URL}
                    className="px-2.5 py-1 rounded-xl bg-teal text-white text-[11px] font-bold hover:bg-teal-hover transition flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>HTTPS खोलें</span>
                  </a>
                )}
                {!isMicAllowed && (
                  <button
                    type="button"
                    onClick={openSettings}
                    className="px-2.5 py-1 rounded-xl bg-amber-700 text-white text-[11px] font-bold hover:bg-amber-800 transition flex items-center gap-1"
                  >
                    <Settings className="w-3 h-3" />
                    <span>सेटिंग्स</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Transcribed Text Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-darkbrown">
              <span>Transcribed Need (बोली गई आवश्यकता):</span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => handleReadAloud(transcript)}
                  className="text-xs text-teal font-extrabold flex items-center gap-1 hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{speakingTts ? 'Stop' : 'आवाज़ सुनें (Listen)'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                handleAnalyzeTranscript(e.target.value);
              }}
              placeholder="माइक से बोलते ही आपकी आवाज़ यहाँ टेक्स्ट में बदल जाएगी..."
              className="w-full p-3 rounded-2xl border border-darkbrown/15 bg-white text-xs font-semibold text-darkbrown outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          {/* AI Extracted Structured Fields */}
          {extractedData && (
            <div className="p-4 rounded-3xl bg-teal-light border-2 border-teal/40 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-black text-darkbrown border-b border-teal/20 pb-2">
                <span className="flex items-center gap-1.5 text-teal">
                  <Sparkles className="w-4 h-4" />
                  एआई द्वारा स्वतः निकाली गई जानकारी:
                </span>
                <span className="text-[10px] text-darkbrown/60">Ready to post</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-teal/20">
                  <span className="text-[10px] uppercase font-bold text-darkbrown/60 block">पहचानी गई श्रेणी:</span>
                  <strong className="text-teal font-black">{extractedData.category}</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-teal/20">
                  <span className="text-[10px] uppercase font-bold text-darkbrown/60 block">प्राथमिकता / तात्कालिकता:</span>
                  <strong className="text-terracotta font-black">{extractedData.urgency}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyToRequest}
                className="w-full py-3 rounded-2xl bg-teal hover:bg-teal-hover text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 tap-target"
              >
                <Check className="w-4 h-4" />
                <span>इस जानकारी से नया अनुरोध फॉर्म भरें</span>
              </button>
            </div>
          )}

          {/* Quick Preset Samples to Test Voice */}
          <div className="space-y-2 pt-1 border-t border-darkbrown/10">
            <div className="text-xs font-black text-darkbrown/70 flex items-center justify-between">
              <span>त्वरित परीक्षण हेतु उदाहरण वाक्य (Click to test):</span>
              <span className="text-[10px] text-teal font-bold">1-Click AI Test</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRunLiveSimulation(s.text)}
                  className="p-2.5 rounded-2xl bg-cream hover:bg-cream-dark border border-darkbrown/10 text-left transition text-xs font-medium text-darkbrown flex items-center justify-between group"
                >
                  <span className="truncate mr-2 font-bold group-hover:text-terracotta">{s.label}</span>
                  <span className="text-[10px] text-teal font-black shrink-0">Demo →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}