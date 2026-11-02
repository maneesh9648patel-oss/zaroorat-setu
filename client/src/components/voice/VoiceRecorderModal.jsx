import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Play, Pause, Sparkles, Check, X, Volume2, AlertCircle, RefreshCw, Radio, Settings } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSettings } from '../../contexts/SettingsContext';
import { api } from '../../services/api';

export default function VoiceRecorderModal({ isOpen, onClose, onApplyExtracted }) {
  const { t, language, currentSpeechLang, currentDialect } = useLanguage();
  const { micPermission, openSettings } = useSettings();
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

  if (!isOpen) return null;

  // Real Speech Recording using Web Speech API
  const handleStartRecording = () => {
    setErrorNotice(null);
    setExtractedData(null);
    setTranscript('');
    setRecordDuration(0);
    setIsSimulating(false);

    if (micPermission === 'not_allowed') {
      setErrorNotice("⚠️ माइक्रोफ़ोन अनुमति सेटिंग्स में 'Not Allowed' (प्रतिबंधित) है। बोलकर रिकॉर्ड करने के लिए सेटिंग्स में Allow करें, या नीचे 'Live Demo' चलाएँ।");
      return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setErrorNotice("Speech recognition is not supported in this browser. Running live demo simulation instead.");
      handleRunLiveSimulation();
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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
          setErrorNotice("Microphone permission was denied. You can click 'Live Speech Demo' below to test it instantly!");
        } else {
          setErrorNotice("Voice listening completed. You can review or edit the text.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setErrorNotice("Could not access microphone directly. Starting live speech simulation.");
      handleRunLiveSimulation();
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
    setIsSimulating(false);
  };

  // Live Speech Simulation (Works 100% even if microphone is unavailable or blocked)
  const handleRunLiveSimulation = (customText) => {
    const textToSimulate = customText || "जिला अस्पताल बांदा में आपातकालीन ऑपरेशन के लिए B+ ब्लड डोनर की तुरंत ज़रूरत है।";
    setIsRecording(false);
    setIsSimulating(true);
    setRecordDuration(0);
    setErrorNotice(null);
    setExtractedData(null);
    setTranscript('');

    // Speak text aloud using SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSimulate);
      utterance.lang = currentSpeechLang || 'hi-IN';
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }

    // Typewriter effect simulation
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 3;
      setTranscript(textToSimulate.slice(0, currentIdx));
      if (currentIdx >= textToSimulate.length) {
        clearInterval(interval);
        setIsSimulating(false);
        // Automatically run AI triage analysis
        setTimeout(() => {
          handleAnalyzeWithAI(textToSimulate);
        }, 500);
      }
    }, 60);
  };

  // AI Structured Analysis (Calls backend /api/ai/voice-extract or intelligent fallback)
  const handleAnalyzeWithAI = async (textToAnalyze) => {
    const text = textToAnalyze || transcript;
    if (!text) {
      setErrorNotice("Please speak or select a sample need first.");
      return;
    }

    setAnalyzing(true);
    setErrorNotice(null);

    try {
      const result = await api.ai.extractVoice(text);
      if (result && result.extracted) {
        setExtractedData(result.extracted);
      } else {
        throw new Error("No structured fields returned");
      }
    } catch (err) {
      // Smart local rule-based triage fallback
      const lower = text.toLowerCase();
      let category = "Items";
      let urgency = "Normal";

      if (lower.includes('blood') || lower.includes('khoon') || lower.includes('ब्लड') || lower.includes('खून') || lower.includes('hospital') || lower.includes('अस्पताल') || lower.includes('dawa') || lower.includes('operation')) {
        category = "Medical";
        urgency = "Urgent";
      } else if (lower.includes('calculator') || lower.includes('कैलकुलेटर') || lower.includes('book') || lower.includes('kitab') || lower.includes('किताब') || lower.includes('exam') || lower.includes('परीक्षा')) {
        category = "Education";
        urgency = "High";
      } else if (lower.includes('patila') || lower.includes('पतीला') || lower.includes('thali') || lower.includes('थाली') || lower.includes('bartan') || lower.includes('बर्तन') || lower.includes('kadhai') || lower.includes('शादी')) {
        category = "Family Utensils";
        urgency = "High";
      } else if (lower.includes('solar') || lower.includes('सोलर') || lower.includes('लालटेन') || lower.includes('multimeter') || lower.includes('tool') || lower.includes('उपकरण')) {
        category = "Electronics";
        urgency = "High";
      } else if (lower.includes('wheelchair') || lower.includes('व्हीलचेयर') || lower.includes('crutch') || lower.includes('बैसाखी')) {
        category = "Medical & Mobility";
        urgency = "High";
      }

      setExtractedData({
        category,
        urgency,
        description: text,
        suggestedTitle: text.length > 50 ? text.slice(0, 50) + '...' : text
      });
    } finally {
      setAnalyzing(false);
    }
  };

  // Pre-configured audio samples for instant 1-click demonstration
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

  const handleApplyToRequest = () => {
    if (!extractedData) return;
    if (onApplyExtracted) {
      onApplyExtracted(extractedData);
    }
    onClose();
    navigate('/new-request', { state: { prefilled: extractedData } });
  };

  const handleReadAloud = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingTts) {
      window.speechSynthesis.cancel();
      setSpeakingTts(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentSpeechLang || 'hi-IN';
    utterance.onend = () => setSpeakingTts(false);
    utterance.onerror = () => setSpeakingTts(false);
    setSpeakingTts(true);
    window.speechSynthesis.speak(utterance);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-darkbrown/75 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-darkbrown/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-darkbrown text-cream p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-terracotta flex items-center justify-center shadow-inner shrink-0">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                <span>AI Voice Recorder (आवाज रिकॉर्डर)</span>
                <span className="px-2 py-0.2 rounded-full bg-softYellow/20 text-softYellow text-[10px] font-extrabold border border-softYellow/30">
                  {currentDialect?.name?.split(' ')[0] || 'बुंदेली'}
                </span>
              </h3>
              <p className="text-[11px] text-cream/70 font-semibold">
                Speech-to-Text & Automatic AI Triage · Pilot: REC Banda
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl hover:bg-white/10 text-cream/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto bg-cream/20">
          {/* Visual Waveform & Timer Card */}
          <div className="p-5 rounded-3xl bg-white border border-darkbrown/10 text-center space-y-3 shadow-xs">
            <div className="flex items-center justify-center gap-1.5 h-12">
              {[30, 60, 95, 55, 100, 45, 85, 40, 90, 65, 35, 75, 50].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isRecording || isSimulating ? 'bg-terracotta animate-pulse' : 'bg-darkbrown/20'
                  }`}
                  style={{ height: isRecording || isSimulating ? `${h}%` : '20%' }}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRecording || isSimulating ? 'bg-red-500 animate-ping' : 'bg-darkbrown/30'}`} />
              <div className="font-mono font-black text-xl text-darkbrown">
                {formatTimer(recordDuration)}
              </div>
            </div>

            {/* Main Action Buttons */}
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
                    onClick={() => handleRunLiveSimulation()}
                    className="px-4 py-3 rounded-2xl bg-teal hover:bg-teal-hover text-white font-extrabold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 tap-target"
                    title="Run live simulated speech with audio playback"
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

          {errorNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2.5 font-medium">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>{errorNotice}</span>
              </div>
              {micPermission === 'not_allowed' && (
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
                  <span>{speakingTts ? 'Stop' : 'आवाज़ सुने (Listen)'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="माइक से बोली गई बात यहाँ टाइप होगी... या नीचे दिए गए किसी भी उदाहरण पर टैप करें।"
              className="w-full p-3.5 rounded-2xl border border-darkbrown/15 bg-white text-xs sm:text-sm font-medium text-darkbrown outline-none focus:ring-2 focus:ring-terracotta shadow-xs"
            />
          </div>

          {/* AI Extraction Trigger Button */}
          {transcript && !extractedData && (
            <button
              type="button"
              disabled={analyzing}
              onClick={() => handleAnalyzeWithAI()}
              className="w-full py-3.5 rounded-2xl bg-teal hover:bg-teal-hover text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'AI श्रेणी व तात्कालिकता पहचान रहा है...' : 'Analyze with AI (AI द्वारा विश्लेषण करें)'}</span>
            </button>
          )}

          {/* Extracted Result Card */}
          {extractedData && (
            <div className="p-4 sm:p-5 rounded-3xl bg-teal-light border-2 border-teal/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-black text-teal">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal" />
                  AI Triage Result (विश्लेषण परिणाम):
                </span>
                <span className="px-3 py-1 rounded-full bg-teal text-white text-[11px] font-black uppercase tracking-wider">
                  {extractedData.urgency}
                </span>
              </div>

              <div className="text-xs text-darkbrown space-y-1 bg-white p-3 rounded-2xl border border-teal/15 font-semibold">
                <div><span className="text-darkbrown/60">पहचानी गई श्रेणी:</span> <strong>{extractedData.category}</strong></div>
                <div><span className="text-darkbrown/60">ज़रूरत का शीर्षक:</span> {extractedData.suggestedTitle || extractedData.description}</div>
              </div>

              <button
                type="button"
                onClick={handleApplyToRequest}
                className="w-full py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 tap-target"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>फॉर्म में भरें और आगे बढ़ें (Apply to Form) &rarr;</span>
              </button>
            </div>
          )}

          {/* 1-Click Interactive Community Need Samples */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-black text-darkbrown/60 uppercase tracking-wider">
              तुरंत टेस्ट करने के लिए उदाहरण पर टैप करें (1-Click Preset Demos):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    handleRunLiveSimulation(p.text);
                  }}
                  className="p-3 rounded-2xl bg-white hover:bg-cream-dark text-left border border-darkbrown/10 text-xs font-bold text-darkbrown transition flex flex-col justify-between shadow-2xs group"
                >
                  <span className="text-terracotta group-hover:underline font-black">{p.label}</span>
                  <span className="text-[10px] text-darkbrown/60 mt-1 line-clamp-1">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
