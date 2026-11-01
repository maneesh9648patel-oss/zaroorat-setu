import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Volume2, ShieldCheck, MapPin, Building2, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import PriorityBadge from '../components/common/PriorityBadge';

export default function TrackStatusPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useLanguage();
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);

  const steps = [
    {
      title: t('reqSubmittedTitle'),
      desc: "Received through the app at 10:12 am.",
      status: "completed"
    },
    {
      title: t('reqVerifiedTitle'),
      desc: "Duplicate check passed. Priority confirmed as High.",
      status: "completed"
    },
    {
      title: t('reqMatchedTitle'),
      desc: "Waiting for the provider to confirm availability.",
      status: "current"
    },
    {
      title: t('reqCompletedTitle'),
      desc: "Both sides confirm once the help is delivered.",
      status: "pending"
    }
  ];

  const handleReadStatus = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeakingTTS) {
      window.speechSynthesis.cancel();
      setIsSpeakingTTS(false);
      return;
    }

    const text = "आपके अनुरोध #ZS-1042 की स्थिति: मानवीय सत्यापनकर्ता द्वारा प्रमाणित हो चुका है। सेवा सहायता ट्रस्ट से मिलान किया गया है। पिकअप तय करें।";
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
              Live Tracker · Request #ZS-1042
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('requestStatusTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-cream/80">
            Wheelchair for 2 weeks · Civil Lines, Banda (3 km)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <PriorityBadge urgency="High" size="md" />
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

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left (7 cols): Stepper & Verification Audit */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-darkbrown/10 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-darkbrown/10 pb-4">
            <h2 className="font-black text-lg text-darkbrown">Progress Milestones</h2>
            <span className="text-xs font-bold text-teal flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Human Verified
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
                      : step.status === 'current'
                      ? 'bg-terracotta text-white shadow-sm animate-pulse'
                      : 'bg-darkbrown/10 text-darkbrown/40'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <Check className="w-4 h-4 stroke-[3]" />
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
                      {idx === 0 ? "10:12 AM" : idx === 1 ? "10:14 AM" : idx === 2 ? "In progress" : "Pending"}
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
              <span>Verified by Verifier Manoj Tripathi (#01)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-teal"></span>
            </div>
            <p className="text-[11px] text-darkbrown/75 leading-normal">
              Duplicate detection passed (similarity &lt; 0.25). Priority confirmed as <strong>High</strong> based on elderly patient rehabilitation urgency.
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
                S
              </div>
              <div>
                <div className="font-black text-base text-white">Seva Sahayata Trust</div>
                <div className="text-xs text-cream/70 mt-0.5">Level 3 Verified NGO · 3 km away</div>
                <div className="text-[11px] text-softYellow mt-1">Reg #UP-BND-2021-0428</div>
              </div>
            </div>

            <div className="p-3.5 bg-white/10 rounded-2xl text-xs space-y-1 border border-white/10">
              <div className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-terracotta" />
                <span>Pickup Hub: Civil Lines Community Center</span>
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
