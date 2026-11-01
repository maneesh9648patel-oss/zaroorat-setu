import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Play, Pause, Sparkles, Check, X, Volume2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';

export default function VoiceRecorderModal({ isOpen, onClose, onApplyExtracted }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [speakingTts, setSpeakingTts] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!isOpen) return null;

  // Start speech recording
  const handleStartRecording = () => {
    setErrorNotice(null);
    setExtractedData(null);
    setTranscript('');
    setRecordDuration(0);

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setErrorNotice("Speech recognition is not supported in this browser. You can select a sample speech below.");
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Select recognition dialect
      if (language === 'hi' || language === 'bnd' || language === 'awa') {
        recognition.lang = 'hi-IN'; // Recognizes Hindi and Bundeli vocabulary well
      } else {
        recognition.lang = 'en-IN';
      }
      
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setErrorNotice("Microphone permission was denied. Please allow microphone access or choose a sample prompt.");
        } else {
          setErrorNotice("Voice input interrupted. You can type or use the sample speech.");
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setErrorNotice("Could not start microphone. Try clicking a sample audio scenario.");
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  // AI Structured Analysis (Gemini API or local fallback)
  const handleAnalyzeWithAI = async (textToAnalyze) => {
    const text = textToAnalyze || transcript;
    if (!text) {
      setErrorNotice("Please speak or select a sample need first.");
      return;
    }

    setAnalyzing(true);
    setErrorNotice(null);

    try {
      // Call backend AI extraction endpoint
      const result = await api.ai.extractVoice(text);
      setExtractedData(result.extracted);
      setAnalyzing(false);
    } catch (err) {
      // Local smart fallback
      const lower = text.toLowerCase();
      let category = "Items";
      let urgency = "Normal";

      if (lower.includes('blood') || lower.includes('khoon') || lower.includes('hospital') || lower.includes('dawa') || lower.includes('operation')) {
        category = "Medical";
        urgency = "Urgent";
      } else if (lower.includes('calculator') || lower.includes('book') || lower.includes('kitab') || lower.includes('exam') || lower.includes('padhai')) {
        category = "Education";
        urgency = "High";
      } else if (lower.includes('patila') || lower.includes('thali') || lower.includes('bartan') || lower.includes('bhoj') || lower.includes('kadhai')) {
        category = "Family Utensils";
        urgency = "High";
      } else if (lower.includes('solar') || lower.includes('light') || lower.includes('lantern') || lower.includes('multimeter') || lower.includes('soldering') || lower.includes('projector')) {
        category = "Electronics";
        urgency = "High";
      } else if (lower.includes('wheelchair') || lower.includes('crutch') || lower.includes('fracture')) {
        category = "Medical & Mobility";
        urgency = "High";
      }

      setExtractedData({
        category,
        urgency,
        description: text,
        suggestedTitle: text.length > 45 ? text.slice(0, 45) + '...' : text
      });
      setAnalyzing(false);
    }
  };

  // Pre-configured audio samples for instant demonstration
  const samplePrompts = [
    {
      label: "B+ Blood Emergency",
      text: "District Hospital Banda me emergency operation ke liye B+ blood donor ki turant zarurat hai.",
      category: "Medical",
      urgency: "Urgent"
    },
    {
      label: "REC Banda Calculator",
      text: "REC Banda me kal semester exam hai, Casio scientific calculator 3 din ke liye chahiye.",
      category: "Education",
      urgency: "High"
    },
    {
      label: "Event Utensils (Patila & Thalis)",
      text: "Civil Lines me pariwarik karyakram ke liye bada patila aur 40 thali set chahiye.",
      category: "Family Utensils",
      urgency: "High"
    },
    {
      label: "Solar Lantern & Inverter",
      text: "Baberu gaon me transformer kharab hai, emergency solar lantern aur power bank chahiye.",
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
    utterance.lang = 'hi-IN';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbrown/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-darkbrown/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-darkbrown text-cream p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-terracotta flex items-center justify-center shadow-inner">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">{t('voiceRecorderTitle')}</h3>
              <p className="text-[10px] text-cream/70">Powered by Gemini AI Triage</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-cream/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Visual Waveform & Timer */}
          <div className="p-5 rounded-2xl bg-cream border border-darkbrown/10 text-center space-y-3">
            <div className="flex items-center justify-center gap-1.5 h-10">
              {[40, 70, 90, 60, 100, 50, 80, 45, 95, 65, 35].map((h, idx) => (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isRecording ? 'bg-terracotta animate-pulse' : 'bg-darkbrown/25'
                  }`}
                  style={{ height: isRecording ? `${h}%` : '20%' }}
                />
              ))}
            </div>

            <div className="font-mono font-bold text-lg text-darkbrown">
              {formatTimer(recordDuration)}
            </div>

            {/* Mic Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="px-5 py-3 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Mic className="w-4 h-4 stroke-[2.5]" />
                  <span>Start Recording (बोलना शुरू करें)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="px-5 py-3 rounded-2xl bg-darkbrown text-white font-extrabold text-xs shadow-md transition flex items-center gap-2 mic-listening"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop & Review</span>
                </button>
              )}
            </div>
          </div>

          {errorNotice && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Transcript Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-darkbrown">
              <span>Transcribed Speech (बोला गया विवरण):</span>
              {transcript && (
                <button
                  type="button"
                  onClick={() => handleReadAloud(transcript)}
                  className="text-[11px] text-teal flex items-center gap-1 hover:underline"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{speakingTts ? 'Stop' : 'Listen'}</span>
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your voice will be transcribed here. Or click one of the quick samples below..."
              className="w-full p-3 rounded-xl border border-darkbrown/15 bg-cream/30 text-xs font-medium text-darkbrown outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          {/* Analyze with AI Button */}
          {transcript && !extractedData && (
            <button
              type="button"
              disabled={analyzing}
              onClick={() => handleAnalyzeWithAI()}
              className="w-full py-3 rounded-xl bg-teal hover:bg-teal-hover text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'AI Analyzing...' : 'Analyze with AI (श्रेणी व प्राथमिकता निकालें)'}</span>
            </button>
          )}

          {/* Extracted AI Results Card */}
          {extractedData && (
            <div className="p-4 rounded-2xl bg-teal-light border border-teal/30 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-extrabold text-teal">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Triage Result:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal text-white text-[10px]">
                  {extractedData.urgency}
                </span>
              </div>

              <div className="text-xs text-darkbrown space-y-1">
                <div><strong>Category:</strong> {extractedData.category}</div>
                <div><strong>Extracted Need:</strong> {extractedData.suggestedTitle || extractedData.description}</div>
              </div>

              <button
                type="button"
                onClick={handleApplyToRequest}
                className="w-full py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Fill into Need Request Form &rarr;</span>
              </button>
            </div>
          )}

          {/* Quick Voice Demo Presets */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[11px] font-bold text-darkbrown/60 uppercase tracking-wider">
              Or Try A Preset Community Need:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTranscript(p.text);
                    handleAnalyzeWithAI(p.text);
                  }}
                  className="p-2 rounded-xl bg-cream hover:bg-cream-dark text-left border border-darkbrown/10 text-[10px] font-bold text-darkbrown transition flex flex-col justify-between"
                >
                  <span className="text-terracotta">{p.label}</span>
                  <span className="text-[9px] text-darkbrown/60">{p.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
