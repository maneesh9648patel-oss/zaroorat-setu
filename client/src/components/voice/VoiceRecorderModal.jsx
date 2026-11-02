import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Square, Play, Pause, Sparkles, Check, X, Volume2, AlertCircle, RefreshCw, Radio, Settings, ShieldCheck 
} from 'lucide-react';
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

  // Live Audio Frequency & Volume Analyzer State
  const [liveFrequencies, setLiveFrequencies] = useState([20, 25, 20, 30, 25, 20, 25, 30, 20, 25, 20, 25]);
  const [liveVolume, setLiveVolume] = useState(0);
  const [isMicHardwareActive, setIsMicHardwareActive] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animFrameRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Duration timer
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
      cleanupAudio();
    }
  }, [isOpen]);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
      mediaRecorderRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setIsMicHardwareActive(false);
    setIsSimulating(false);
    setLiveVolume(0);
    setLiveFrequencies([20, 25, 20, 30, 25, 20, 25, 30, 20, 25, 20, 25]);
  };

  if (!isOpen) return null;

  // Real Microphone Hardware Activation + Live Web Audio Visualizer + Speech Recognition
  const handleStartRecording = async () => {
    setErrorNotice(null);
    setExtractedData(null);
    setTranscript('');
    setRecordDuration(0);
    setIsSimulating(false);

    if (micPermission === 'not_allowed') {
      setErrorNotice("⚠️ माइक्रोफ़ोन अनुमति सेटिंग्स में 'Not Allowed' (प्रतिबंधित) है। बोलकर रिकॉर्ड करने के लिए सेटिंग्स में Allow करें, या नीचे 'Live Demo' चलाएँ।");
      return;
    }

    let micStreamAcquired = false;

    // 1. Request REAL Microphone Hardware Stream with Web Audio API Analyser
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        mediaStreamRef.current = stream;
        micStreamAcquired = true;
        setIsMicHardwareActive(true);

        // Setup real AudioContext & Frequency Analyser
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateLiveBars = () => {
          analyser.getByteFrequencyData(dataArray);
          const bars = [];
          const step = Math.max(1, Math.floor(dataArray.length / 12));
          let sum = 0;

          for (let i = 0; i < 12; i++) {
            const raw = dataArray[i * step] || 0;
            sum += raw;
            // scale 15% to 100%
            const height = Math.max(15, Math.min(100, Math.round((raw / 255) * 100)));
            bars.push(height);
          }

          const avgVol = Math.round((sum / (12 * 255)) * 100);
          setLiveVolume(avgVol);
          setLiveFrequencies(bars);

          animFrameRef.current = requestAnimationFrame(updateLiveBars);
        };

        updateLiveBars();

        // Setup MediaRecorder to record audio chunks
        try {
          audioChunksRef.current = [];
          const recorder = new MediaRecorder(stream);
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.start(250);
          mediaRecorderRef.current = recorder;
        } catch (recErr) {
          console.warn("MediaRecorder note:", recErr);
        }
      }
    } catch (err) {
      console.warn("getUserMedia note:", err.message);
      setErrorNotice("ब्राउज़र ने माइक की अनुमति नहीं दी या माइक्रोफ़ोन कनेक्ट नहीं है। आप नीचे 'Live Demo चलाएँ' से भी सीधे टेस्ट कर सकते हैं।");
    }

    // 2. Start Speech Recognition (Hindi / Bundeli / English)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = currentSpeechLang || 'hi-IN';
        recognition.continuous = true; // Continuous listening
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          if (currentTranscript.trim()) {
            setTranscript(currentTranscript.trim());
          }
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition notice:", event.error);
          if (event.error === 'not-allowed') {
            setErrorNotice("माइक अनुमति अस्वीकृत हुई। कृपया ब्राउज़र URL बार में 🔒 पर क्लिक कर Microphone Allow करें।");
          }
        };

        recognition.onend = () => {
          // If user hasn't clicked stop yet, keep listening
          if (isRecording && mediaStreamRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn("SpeechRecognition init note:", err);
      }
    }

    setIsRecording(true);
  };

  const handleStopRecording = () => {
    // Stop Speech Recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    // Stop Web Audio Visualizer
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }

    // Stop Microphone Hardware Tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    setIsMicHardwareActive(false);
    setIsSimulating(false);
    setLiveVolume(0);
    setLiveFrequencies([20, 25, 20, 30, 25, 20, 25, 30, 20, 25, 20, 25]);

    // Analyze captured speech
    const textToAnalyze = transcript.trim();
    if (textToAnalyze) {
      handleAnalyzeWithAI(textToAnalyze);
    } else {
      setErrorNotice("कोई आवाज स्पष्ट रूप से प्राप्त नहीं हुई। कृपया दोबारा बोलें या नीचे दिए गए किसी भी उदाहरण पर टैप करें।");
    }
  };

  // Live Speech Simulation (Works 100% even if microphone is unavailable or blocked)
  const handleRunLiveSimulation = (customText) => {
    const textToSimulate = customText || "जिला अस्पताल बांदा में आपातकालीन ऑपरेशन के लिए B+ ब्लड डोनर की तुरंत ज़रूरत है।";
    cleanupAudio();
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

    // Simulated waveform animation
    const waveInterval = setInterval(() => {
      setLiveFrequencies(Array.from({ length: 12 }, () => Math.floor(Math.random() * 70) + 20));
      setLiveVolume(Math.floor(Math.random() * 60) + 25);
    }, 120);

    // Typewriter effect simulation
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx += 3;
      setTranscript(textToSimulate.slice(0, currentIdx));
      if (currentIdx >= textToSimulate.length) {
        clearInterval(interval);
        clearInterval(waveInterval);
        setIsSimulating(false);
        setLiveVolume(0);
        setLiveFrequencies([20, 25, 20, 30, 25, 20, 25, 30, 20, 25, 20, 25]);
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
      setErrorNotice("कृपया पहले बोलें या कोई उदाहरण चुनें।");
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
    cleanupAudio();
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
                <span>AI Voice Recorder (लाइव माइक रिकॉर्डर)</span>
                <span className="px-2 py-0.2 rounded-full bg-softYellow/20 text-softYellow text-[10px] font-extrabold border border-softYellow/30">
                  {currentDialect?.name?.split(' ')[0] || 'बुंदेली'}
                </span>
              </h3>
              <p className="text-[11px] text-cream/70 font-semibold">
                Live Web Audio & Speech-to-Text · Pilot: REC Banda
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              cleanupAudio();
              onClose();
            }} 
            className="p-1.5 rounded-xl hover:bg-white/10 text-cream/70 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto bg-cream/20">
          {/* Live Audio Waveform & Volume Visualizer Card */}
          <div className="p-5 rounded-3xl bg-white border border-darkbrown/10 text-center space-y-3 shadow-xs">
            {/* 12 DYNAMIC EQUALIZER WAVEFORM BARS REACTING TO REAL AUDIO */}
            <div className="flex items-end justify-center gap-2 h-16 px-4">
              {liveFrequencies.map((heightPct, idx) => (
                <div
                  key={idx}
                  className={`w-2 rounded-full transition-all duration-75 ${
                    isRecording
                      ? 'bg-gradient-to-t from-teal to-terracotta shadow-xs'
                      : isSimulating
                      ? 'bg-terracotta'
                      : 'bg-darkbrown/20'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              ))}
            </div>

            {/* Mic Live Status Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isRecording || isSimulating ? 'bg-red-500 animate-ping' : 'bg-darkbrown/30'}`} />
              <div className="font-mono font-black text-xl text-darkbrown">
                {formatTimer(recordDuration)}
              </div>
              {isMicHardwareActive && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full bg-teal-light text-teal text-[10px] font-black border border-teal/20 animate-pulse">
                  🟢 MIC ACTIVE · {liveVolume}%
                </span>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              {!isRecording && !isSimulating ? (
                <>
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="px-6 py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 tap-target"
                  >
                    <Mic className="w-4 h-4 stroke-[2.5]" />
                    <span>माइक से बोलें (Start Live Mic)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRunLiveSimulation()}
                    className="px-4 py-3.5 rounded-2xl bg-teal hover:bg-teal-hover text-white font-extrabold text-xs sm:text-sm shadow-sm transition flex items-center gap-1.5 tap-target"
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
                  className="px-6 py-3.5 rounded-2xl bg-darkbrown text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 mic-listening tap-target"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>रिकॉर्डिंग रोकें व विश्लेषण करें (Stop & Analyze)</span>
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
              placeholder="बोलना शुरू करें... आपके शब्द यहाँ लाइव टाइप होंगे (उदा. 'मुझे परीक्षा के लिए Casio कैलकुलेटर चाहिए')"
              className="w-full p-3.5 rounded-2xl border border-darkbrown/15 bg-white text-xs font-semibold text-darkbrown outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          {/* Manual Analyze Button if text exists */}
          {transcript && !extractedData && !isRecording && (
            <button
              type="button"
              disabled={analyzing}
              onClick={() => handleAnalyzeWithAI(transcript)}
              className="w-full py-2.5 rounded-xl bg-darkbrown text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-softYellow" />
              <span>{analyzing ? 'AI विश्लेषण हो रहा है...' : 'AI से आवश्यकता छांटें (Analyze Need)'}</span>
            </button>
          )}

          {/* Extracted Triage Result Card */}
          {extractedData && (
            <div className="p-4 rounded-3xl bg-teal-light border border-teal/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-teal uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>AI द्वारा विश्लेषित विवरण (Extracted)</span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                  extractedData.urgency === 'Urgent'
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-teal text-white'
                }`}>
                  {extractedData.urgency}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-bold text-darkbrown/70">शीर्षक:</span>{' '}
                  <strong className="text-darkbrown">{extractedData.suggestedTitle}</strong>
                </div>
                <div>
                  <span className="font-bold text-darkbrown/70">श्रेणी (Category):</span>{' '}
                  <strong className="text-teal font-extrabold">{extractedData.category}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyToRequest}
                className="w-full py-3 rounded-2xl bg-teal hover:bg-teal-hover text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-1.5 tap-target"
              >
                <span>यह फॉर्म में भरें और आगे बढ़ें (Apply & Post Need)</span>
              </button>
            </div>
          )}

          {/* 1-Click Preset Samples for Instant Testing */}
          <div className="space-y-2 pt-1 border-t border-darkbrown/10">
            <div className="text-xs font-black text-darkbrown/70 flex items-center justify-between">
              <span>त्वरित परीक्षण हेतु बोलें (Quick 1-Click Voice Presets):</span>
              <span className="text-[10px] text-teal font-bold">आवाज़ टेस्ट</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleRunLiveSimulation(s.text)}
                  className="p-2.5 rounded-2xl bg-white hover:bg-cream border border-darkbrown/10 text-left transition text-xs font-semibold text-darkbrown group"
                >
                  <div className="font-extrabold text-[11px] text-teal group-hover:text-terracotta">
                    {s.label}
                  </div>
                  <div className="text-[10px] text-darkbrown/60 truncate mt-0.5">
                    {s.text}
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