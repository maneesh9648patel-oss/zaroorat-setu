import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Check, Clock, Volume2, ShieldCheck, MapPin, Building2, User, 
  Sparkles, RefreshCw, AlertCircle, ChevronRight, XCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import PriorityBadge from '../components/common/PriorityBadge';

export default function TrackStatusPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Fallback defaults for demo request req_1042 or network failures
  const fallbackRequest = {
    id: id || "req_1042",
    title: "Wheelchair for 2 weeks",
    description: "Rehabilitation support after leg fracture. Patient is elderly.",
    category: "Items",
    urgency: "High",
    userArea: "Civil Lines, Banda",
    distanceKm: 3,
    status: "verified",
    verifierStatus: "verified",
    verifierNotes: "Duplicate check passed. Priority confirmed as High.",
    verifierName: "Manoj Tripathi (Verifier #01)",
    matchedProvider: {
      name: "Seva Sahayata Trust",
      tier: "Level 3 Verified NGO",
      distance: "3 km away",
      reg: "Reg #UP-BND-2021-0428",
      hub: "Civil Lines Community Center"
    },
    createdAt: new Date().toISOString()
  };

  useEffect(() => {
    let isMounted = true;
    if (!id) {
      setRequestData(fallbackRequest);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    api.requests.getById(id)
      .then(res => {
        if (isMounted) {
          if (res && res.success && res.request) {
            setRequestData(res.request);
          } else {
            setRequestData(fallbackRequest);
          }
        }
      })
      .catch(err => {
        console.warn("Fetch request by ID notice (using fallback):", err.message);
        if (isMounted) setRequestData(fallbackRequest);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  const req = requestData || fallbackRequest;

  // Determine stage progression
  const isVerified = req.verifierStatus === 'verified' || req.status === 'verified' || req.status === 'matched' || req.status === 'completed';
  const isPendingVerification = req.verifierStatus === 'pending' || req.status === 'submitted';
  const isRejected = req.verifierStatus === 'rejected' || req.status === 'rejected';
  const isMatched = req.status === 'matched' || req.status === 'completed';
  const isCompleted = req.status === 'completed';

  const steps = [
    {
      title: t('reqSubmittedTitle'),
      desc: `Received through the app at ${req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:12 AM'}.`,
      status: "completed",
      time: req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Submitted"
    },
    {
      title: t('reqVerifiedTitle'),
      desc: isRejected
        ? "Request review: Rejected or duplicate alert triggered."
        : isVerified 
        ? (req.verifierNotes || "Duplicate check passed. Priority confirmed by human reviewer.")
        : "Waiting for human verifier confirmation in Banda desk.",
      status: isRejected ? "rejected" : isVerified ? "completed" : isPendingVerification ? "current" : "pending",
      time: isVerified ? "Confirmed" : isPendingVerification ? "Under Review" : "Pending"
    },
    {
      title: t('reqMatchedTitle'),
      desc: isMatched
        ? `Matched with verified local provider: ${req.matchedProvider?.name || 'Seva Sahayata Trust'}.`
        : isVerified
        ? "AI Smart Matching running. Donors & NGOs within 5 km being alerted."
        : "Matches will be activated once verified.",
      status: isMatched ? "completed" : isVerified ? "current" : "pending",
      time: isMatched ? "Matched" : isVerified ? "Matching..." : "Pending"
    },
    {
      title: t('reqCompletedTitle'),
      desc: isCompleted 
        ? "Safe handover confirmed via single-use QR code."
        : "Both sides confirm once the assistance/item is safely delivered.",
      status: isCompleted ? "completed" : isMatched ? "current" : "pending",
      time: isCompleted ? "Completed" : "Pending"
    }
  ];

  const handleReadStatus = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
      return;
    }

    const statusHindi = isCompleted 
      ? "अनुरोध पूरा हो चुका है।"
      : isMatched 
      ? `मददगार मिल चुका है: ${req.matchedProvider?.name || 'सहयोगी संस्था'}।`
      : isVerified 
      ? "मानवीय सत्यापनकर्ता द्वारा प्रमाणित हो चुका है। स्मार्ट मैचिंग सक्रिय है।"
      : "सत्यापन प्रक्रियाधीन है।";

    const text = `अनुरोध संख्या ${req.id}। शीर्षक: ${req.title}। प्राथमिकता: ${req.urgency}। स्थिति: ${statusHindi}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);

    setIsSpeakingTTS(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="pb-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner (Full Width) */}
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
              Live Tracker · Request #{req.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {req.title}
          </h1>
          <p className="text-xs sm:text-sm text-cream/80">
            {req.category} · {req.userArea || "REC Banda"} {req.distanceKm ? `(${req.distanceKm} km)` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PriorityBadge urgency={req.urgency || "Normal"} size="md" />
          <button
            onClick={handleReadStatus}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/10"
            title="Speak status aloud in Hindi"
          >
            <Volume2 className="w-4 h-4 text-softYellow" />
            <span>{isSpeakingTTS ? 'Stop Audio' : 'Suno (सुने)'}</span>
          </button>
        </div>
      </div>

      {/* AI Smart Match Quick Dispatch Callout */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-darkbrown via-teal/90 to-teal text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-softYellow/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-black text-sm text-white flex items-center gap-2">
              <span>⚡ AI स्मार्ट मैचिंग इंजन (Smart Matching)</span>
              <span className="px-2 py-0.5 rounded-full bg-softYellow text-darkbrown text-[10px] font-black uppercase">
                6 Factors
              </span>
            </div>
            <p className="text-xs text-cream/80 mt-0.5">
              इमरजेंसी स्तर, दूरी (0-20km), संसाधन उपलब्धता और आधार KYC ट्रस्ट स्कोर के आधार पर मैच देखें।
            </p>
          </div>
        </div>
        <Link
          to={`/smart-matching?requestId=${req.id}`}
          className="px-4 py-2.5 rounded-2xl bg-white text-darkbrown hover:bg-softYellow font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-center"
        >
          <span>मददगार खोजें (Find Matches)</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 cols): Stepper & Verification Audit */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-darkbrown/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-darkbrown/10 pb-4">
            <h2 className="font-black text-lg text-darkbrown">Progress Milestones</h2>
            <span className={`text-xs font-bold flex items-center gap-1 ${
              isVerified ? 'text-teal' : isRejected ? 'text-red-600' : 'text-terracotta'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              {isVerified ? 'Human Verified' : isRejected ? 'Rejected' : 'Under Review'}
            </span>
          </div>

          {/* 4-Stage Stepper Tracker */}
          <div className="space-y-6 pt-2">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                {/* Connecting vertical line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute left-4 top-9 bottom-[-18px] w-0.5 ${
                      step.status === 'completed' ? 'bg-teal' : 'bg-darkbrown/15'
                    }`}
                  />
                )}

                {/* Step Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs ${
                    step.status === 'completed'
                      ? 'bg-teal text-white shadow-sm'
                      : step.status === 'rejected'
                      ? 'bg-red-600 text-white shadow-sm'
                      : step.status === 'current'
                      ? 'bg-terracotta text-white shadow-sm animate-pulse'
                      : 'bg-darkbrown/10 text-darkbrown/40'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : step.status === 'rejected' ? (
                    <XCircle className="w-4 h-4" />
                  ) : step.status === 'current' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-white" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-darkbrown/30" />
                  )}
                </div>

                {/* Step Content */}
                <div className="pt-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-black text-sm sm:text-base ${
                      step.status === 'current' ? 'text-terracotta' : 'text-darkbrown'
                    }`}>
                      {step.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-darkbrown/50">
                      {step.time}
                    </span>
                  </div>
                  <p className="text-xs text-darkbrown/70 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Audit Note */}
          <div className="p-4 rounded-2xl bg-cream/70 border border-darkbrown/10 text-xs space-y-1">
            <div className="font-extrabold text-darkbrown flex items-center gap-1.5">
              <span>Verified by {req.verifierName || "Verifier Manoj Tripathi (#01)"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal"></span>
            </div>
            <p className="text-[11px] text-darkbrown/75 leading-normal">
              {req.verifierNotes || "Duplicate check passed. Priority confirmed based on community health and emergency triage parameters."}
            </p>
          </div>
        </div>

        {/* Right (5 cols): Matched Provider & Handover Action */}
        <div className="lg:col-span-5 space-y-6">
          {/* Matched Provider Card */}
          <div className="p-6 rounded-3xl bg-darkbrown text-cream space-y-4 shadow-md">
            <div className="text-xs font-black text-softYellow tracking-wider uppercase flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal" />
              <span>{t('matchedProviderTitle')}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal text-white flex items-center justify-center font-black text-xl shadow-inner">
                {req.matchedProvider?.name ? req.matchedProvider.name.charAt(0) : 'S'}
              </div>
              <div>
                <div className="font-black text-base text-white">
                  {req.matchedProvider?.name || "Seva Sahayata Trust"}
                </div>
                <div className="text-xs text-cream/70 mt-0.5">
                  {req.matchedProvider?.tier || "Level 3 Verified NGO"} · {req.matchedProvider?.distance || "3 km away"}
                </div>
                <div className="text-[11px] text-softYellow mt-1">
                  {req.matchedProvider?.reg || "Reg #UP-BND-2021-0428"}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white/10 rounded-2xl text-xs space-y-1 border border-white/10">
              <div className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta" />
                <span>Pickup Hub: {req.matchedProvider?.hub || "Civil Lines Community Center"}</span>
              </div>
              <div className="text-[11px] text-cream/80">
                Contact details will be shared once provider confirms pickup window.
              </div>
            </div>
          </div>

          {/* Single-Use QR Handover Protocol Notice */}
          <div className="p-6 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-3">
            <div className="font-black text-sm text-darkbrown flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal" />
              <span>Safe Handover with Single-Use QR</span>
            </div>
            <p className="text-xs text-darkbrown/75 leading-relaxed">
              When meeting the volunteer, generate or scan the single-use token in the app to record safe receipt. Screenshot proof alone is rejected by design.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/borrow-return')}
                className="flex-1 py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-black text-xs sm:text-sm shadow-md transition text-center tap-target"
              >
                {t('btnArrangePickup')} &rarr;
              </button>
              <button
                onClick={() => navigate('/')}
                className="py-3.5 px-5 rounded-2xl bg-cream hover:bg-cream-dark text-darkbrown font-extrabold text-xs sm:text-sm border border-darkbrown/10 transition text-center"
              >
                {t('btnHome')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
