import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Volume2, Sparkles, AlertCircle, PhoneCall, Radio, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function NewRequestPage({ onOpenVoiceRecorder }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const prefilled = location.state?.prefilled;

  const [category, setCategory] = useState(prefilled?.category || 'Medical');
  const [description, setDescription] = useState(prefilled?.description || 'Wheelchair needed for two weeks after a fracture.');
  const [urgency, setUrgency] = useState(prefilled?.urgency || 'High');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (prefilled) {
      if (prefilled.category) setCategory(prefilled.category);
      if (prefilled.description) setDescription(prefilled.description);
      if (prefilled.urgency) setUrgency(prefilled.urgency);
    }
  }, [prefilled]);

  // Web Speech API: Speech-to-Text
  const handleToggleVoice = () => {
    if (onOpenVoiceRecorder) {
      onOpenVoiceRecorder();
      return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechError("Speech recognition not supported in this browser. Please type your request.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'en' ? 'en-IN' : 'hi-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setDescription(transcript);
        setIsListening(false);

        const lower = transcript.toLowerCase();
        if (lower.includes('blood') || lower.includes('khoon') || lower.includes('dawa') || lower.includes('hospital')) {
          setCategory('Medical');
          setUrgency('Urgent');
        } else if (lower.includes('calculator') || lower.includes('book') || lower.includes('kitab') || lower.includes('exam')) {
          setCategory('Education');
          setUrgency('High');
        } else if (lower.includes('patila') || lower.includes('thali') || lower.includes('bartan')) {
          setCategory('Family Utensils');
          setUrgency('High');
        } else if (lower.includes('solar') || lower.includes('light') || lower.includes('tool')) {
          setCategory('Electronics');
          setUrgency('High');
        }
      };

      recognition.onerror = () => {
        setSpeechError("Mic input error. You can type or use the AI Voice Recorder.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setSpeechError("Could not start microphone.");
      setIsListening(false);
    }
  };

  // Web Speech API: Text-to-Speech
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
      return;
    }

    const textToSpeak = `आपकी ज़रूरत: ${category}. विवरण: ${description}. यह ${urgency} प्राथमिकता के साथ दर्ज की जा रही है।`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'hi-IN';
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    setIsSpeakingTTS(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanDesc = description.trim();
    if (!cleanDesc) {
      setSpeechError("कृपया अपनी ज़रूरत का विवरण दर्ज करें। (Please enter request description)");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSpeechError(null);

    try {
      // Derive a short clean title from description or category
      const words = cleanDesc.split(/\s+/);
      const title = words.length > 7 ? words.slice(0, 7).join(' ') + '...' : cleanDesc;

      const payload = {
        category,
        title,
        description: cleanDesc,
        urgency,
        area: user?.area || "REC Banda",
        coordinates: user?.coordinates || { lat: 25.5348, lng: 80.3478 }
      };

      const res = await api.requests.create(payload);
      if (res && res.success && res.request?.id) {
        navigate(`/requests/${res.request.id}/status`, { state: { justCreated: true } });
      } else {
        throw new Error(res?.error || "अनुरोध दर्ज करने में विफल (Failed to submit)");
      }
    } catch (err) {
      console.warn("Request creation error:", err);
      // If unauthorized or network error, fallback gracefully with demo ID so user is never blocked
      if (err.message && err.message.includes('Authentication required')) {
        setSubmitError("सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।");
      } else {
        setSubmitError(err.message || "अनुरोध दर्ज करने में त्रुटि हुई।");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header (Full Width) */}
      <div className="bg-darkbrown text-cream p-6 sm:p-8 rounded-3xl shadow-lg border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 rounded-full bg-softYellow/20 text-softYellow text-xs font-bold border border-softYellow/30">
              Verified Request Intake · REC Banda
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('newRequestTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 max-w-xl">
            Describe what essential help or item you need. Voice recognition in Hindi/Bundeli available.
          </p>
        </div>

        {onOpenVoiceRecorder && (
          <button
            type="button"
            onClick={onOpenVoiceRecorder}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white text-xs sm:text-sm font-extrabold shadow-md transition self-start sm:self-center"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>AI Voice Recorder</span>
          </button>
        )}
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): The Request Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-darkbrown/10 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* What do you need? (Category pills) */}
            <div className="space-y-2">
              <label className="block font-black text-sm text-darkbrown">
                {t('whatDoYouNeed')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'Education', label: t('catEducation') },
                  { id: 'Medical', label: t('catMedical') },
                  { id: 'Items', label: t('catItems') },
                  { id: 'Family Utensils', label: t('catFamilyUtensils') },
                  { id: 'Electronics', label: t('catElectronics') },
                  { id: 'Emergency', label: t('catEmergency') }
                ].map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs transition tap-target text-left flex items-center justify-between ${
                      category === cat.id
                        ? 'bg-teal text-white shadow-md'
                        : 'bg-cream/50 text-darkbrown/80 border border-darkbrown/10 hover:border-darkbrown/30'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {category === cat.id && <span className="w-2 h-2 rounded-full bg-white shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Describe the need + AI Voice Mic */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-black text-sm text-darkbrown">
                  {t('describeNeed')}
                </label>
                <button
                  type="button"
                  onClick={handleReadAloud}
                  className="flex items-center gap-1 text-xs font-bold text-teal hover:underline"
                  title="Read aloud in Hindi"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isSpeakingTTS ? 'Stop audio' : 'Suno (सुने)'}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('describePlaceholder')}
                  required
                  className="w-full p-4 rounded-2xl border border-darkbrown/15 bg-cream/20 text-darkbrown font-medium text-xs sm:text-sm focus:ring-2 focus:ring-terracotta outline-none shadow-inner"
                />

                {/* Mic Trigger */}
                <button
                  type="button"
                  onClick={onOpenVoiceRecorder || handleToggleVoice}
                  className={`absolute right-3 bottom-3 p-3 rounded-2xl transition shadow-md flex items-center justify-center ${
                    isListening
                      ? 'bg-terracotta text-white mic-listening'
                      : 'bg-white text-terracotta hover:bg-terracotta hover:text-white border border-terracotta/20'
                  }`}
                  title="AI Voice Recorder"
                  aria-label="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              {speechError && (
                <div className="p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                  {speechError}
                </div>
              )}

              <p className="text-xs text-darkbrown/65">
                {t('voiceReviewHint')}
              </p>
            </div>

            {/* How urgent is it? */}
            <div className="space-y-2">
              <label className="block font-black text-sm text-darkbrown">
                {t('howUrgent')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Normal', label: t('priorityNormal') },
                  { id: 'High', label: t('priorityHigh') },
                  { id: 'Urgent', label: t('priorityUrgent') }
                ].map((urg) => (
                  <button
                    type="button"
                    key={urg.id}
                    onClick={() => setUrgency(urg.id)}
                    className={`py-3 rounded-2xl font-bold text-xs transition ${
                      urgency === urg.id
                        ? 'bg-terracotta text-white shadow-md font-extrabold'
                        : 'bg-cream/50 text-darkbrown/80 border border-darkbrown/10 hover:border-darkbrown/30'
                    }`}
                  >
                    {urg.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-darkbrown/70 leading-relaxed font-medium pt-1">
                {t('aiDisclaimer')}
              </p>
            </div>

            {/* Submit error alert */}
            {submitError && (
              <div className="p-3.5 rounded-2xl bg-red-50 text-red-800 text-xs font-bold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-black text-sm shadow-lg transition tap-target flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>सत्यापन के लिए भेजा जा रहा है... (Submitting...)</span>
                </>
              ) : (
                <>
                  <span>{t('btnSubmitVerification')}</span>
                  <span>&rarr;</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column (5 cols): AI Preview, Voice Prompts & Rules */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Priority Scoring Info Card */}
          <div className="p-6 rounded-3xl bg-softYellow/30 border border-softYellow/90 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-terracotta uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI Priority Assistance</span>
            </div>
            <h3 className="font-extrabold text-sm text-darkbrown">
              Rule-Based AI Scoring Engine
            </h3>
            <p className="text-xs text-darkbrown/80 leading-relaxed">
              When submitted, the Gemini AI priority model evaluates urgency, severity, available local resources, and waiting time to suggest a ranking score.
            </p>
            <div className="p-3 bg-white/80 rounded-2xl border border-softYellow text-[11px] text-darkbrown/90 font-medium">
              ⚖️ <strong>Human Decision Rule:</strong> AI only suggests. A human verifier makes the final verification decision.
            </div>
          </div>

          {/* Voice Prompt Suggestions in Hindi/Bundeli */}
          <div className="p-6 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-darkbrown flex items-center gap-2">
              <Mic className="w-4 h-4 text-terracotta" />
              <span>बोलकर दर्ज करने के उदाहरण (Voice Examples)</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div 
                onClick={() => {
                  setDescription("पैर फ्रैक्चर होने के कारण 2 हफ्ते के लिए व्हीलचेयर की ज़रूरत है।");
                  setCategory("Medical");
                  setUrgency("High");
                }}
                className="p-3 rounded-2xl bg-cream/60 hover:bg-cream cursor-pointer border border-darkbrown/5 transition font-medium text-darkbrown"
              >
                "पैर फ्रैक्चर होने के कारण 2 हफ्ते के लिए व्हीलचेयर की ज़रूरत है।"
              </div>
              <div 
                onClick={() => {
                  setDescription("कल से सेमेस्टर परीक्षा है, 3 दिन के लिए Casio fx-991EX कैलकुलेटर चाहिए।");
                  setCategory("Education");
                  setUrgency("High");
                }}
                className="p-3 rounded-2xl bg-cream/60 hover:bg-cream cursor-pointer border border-darkbrown/5 transition font-medium text-darkbrown"
              >
                "कल से सेमेस्टर परीक्षा है, 3 दिन के लिए Casio fx-991EX कैलकुलेटर चाहिए।"
              </div>
              <div 
                onClick={() => {
                  setDescription("घर में कार्यक्रम है, 50 लीटर का बड़ा पतीला और 30 थाली सेट 2 दिन के लिए चाहिए।");
                  setCategory("Family Utensils");
                  setUrgency("Normal");
                }}
                className="p-3 rounded-2xl bg-cream/60 hover:bg-cream cursor-pointer border border-darkbrown/5 transition font-medium text-darkbrown"
              >
                "घर में कार्यक्रम है, 50 लीटर का बड़ा पतीला और 30 थाली सेट 2 दिन के लिए चाहिए।"
              </div>
            </div>
          </div>

          {/* Offline Access Callout Banner */}
          <div className="p-6 rounded-3xl bg-darkbrown text-cream space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-softYellow flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-terracotta" />
                {t('offlineTitle')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold text-cream/70">
                {t('offlineStatusBadge')}
              </span>
            </div>
            <p className="text-xs text-cream/80 leading-relaxed">
              {t('offlineDesc')}
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
              <span className="font-mono font-bold text-softYellow">
                1800-ZAROORAT
              </span>
              <button
                type="button"
                onClick={() => navigate('/volunteer-assist')}
                className="font-extrabold text-white underline hover:text-softYellow"
              >
                Assisted Desk &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
