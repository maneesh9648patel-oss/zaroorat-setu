import React from 'react';
import { 
  X, Sparkles, ShieldCheck, MapPin, Clock, PackageCheck, 
  Heart, AlertTriangle, CheckCircle2, ChevronRight, Info
} from 'lucide-react';

export default function WhyThisMatchModal({ match, onClose, onSendRequest, isSending, sendSuccess }) {
  if (!match) return null;

  const factors = match.factorScores || {};

  const factorList = [
    {
      key: 'emergencyPriority',
      label: 'Emergency Level (आपातकालीन प्राथमिकता)',
      max: 25,
      score: factors.emergencyPriority?.score ?? 20,
      detail: factors.emergencyPriority?.detail || 'Evaluated request severity and emergency time criticality',
      icon: AlertTriangle,
      color: 'bg-terracotta',
      textColor: 'text-terracotta'
    },
    {
      key: 'distance',
      label: 'Distance & Proximity (दूरी एवं निकटता)',
      max: 20,
      score: factors.distance?.score ?? 16,
      detail: factors.distance?.detail || `${match.distanceKm} km from requester location`,
      icon: MapPin,
      color: 'bg-teal',
      textColor: 'text-teal'
    },
    {
      key: 'resourceAvailability',
      label: 'Resource Availability (संसाधन उपलब्धता)',
      max: 20,
      score: factors.resourceAvailability?.score ?? 16,
      detail: factors.resourceAvailability?.detail || `${match.resourceName} verified in inventory`,
      icon: PackageCheck,
      color: 'bg-amber-500',
      textColor: 'text-amber-600'
    },
    {
      key: 'timeCompatibility',
      label: 'Required Time Compatibility (समय अनुकूलता)',
      max: 15,
      score: factors.timeCompatibility?.score ?? 12,
      detail: factors.timeCompatibility?.detail || `Can respond within ${match.estimatedResponseMinutes} mins`,
      icon: Clock,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      key: 'verificationTrust',
      label: 'User Verification & Trust (सत्यापन एवं विश्वसनीयता)',
      max: 10,
      score: factors.verificationTrust?.score ?? 8.5,
      detail: factors.verificationTrust?.detail || `Trust score ${match.trustScore}/100 with verified credentials`,
      icon: ShieldCheck,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600'
    },
    {
      key: 'donorWillingness',
      label: "Donor Willingness (दाता की तत्परता)",
      max: 10,
      score: factors.donorWillingness?.score ?? 10,
      detail: factors.donorWillingness?.detail || match.willingnessLabel || 'Available and willing to help',
      icon: Heart,
      color: 'bg-rose-500',
      textColor: 'text-rose-600'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbrown/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden my-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-darkbrown to-darkbrown/90 text-cream p-6 border-b border-white/10 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-softYellow mb-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Smart Matching Analysis · 6-Factor Algorithm</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Why This Match? (यह मिलान क्यों?)
              </h2>
              <p className="text-xs sm:text-sm text-cream/80">
                Detailed AI score breakdown for <span className="text-softYellow font-bold">{match.name}</span>
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 border border-white/20 self-start sm:self-auto">
              <span className="text-2xl sm:text-3xl font-black text-softYellow">
                {match.matchScore}%
              </span>
              <div className="text-[10px] uppercase font-extrabold text-cream/70 leading-tight">
                AI MATCH<br />SCORE
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* Medical Disclaimer if critical medical */}
          {match.medicalDisclaimer && (
            <div className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-semibold flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{match.medicalDisclaimer}</span>
            </div>
          )}

          {/* AI Contextual Summary Note */}
          {match.aiSummary && (
            <div className="p-4 rounded-2xl bg-cream/70 border border-darkbrown/10 space-y-1.5">
              <div className="text-xs font-black uppercase tracking-wider text-teal flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Matching Rationale (तर्कसंगत व्याख्या)</span>
              </div>
              <p className="text-xs sm:text-sm text-darkbrown/90 leading-relaxed font-medium">
                {match.aiSummary}
              </p>
            </div>
          )}

          {/* 6-Factor Progress Breakdown */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-darkbrown/60">
              Scoring Factors Breakdown (100 Points Model)
            </h3>

            <div className="space-y-3">
              {factorList.map(factor => {
                const Icon = factor.icon;
                const percentage = Math.round((factor.score / factor.max) * 100);

                return (
                  <div key={factor.key} className="p-3 rounded-2xl bg-cream/40 border border-darkbrown/5 hover:border-darkbrown/15 transition space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-darkbrown">
                        <Icon className={`w-4 h-4 ${factor.textColor}`} />
                        <span>{factor.label}</span>
                      </div>
                      <div className="font-black text-darkbrown">
                        <span className={factor.textColor}>{factor.score}</span>
                        <span className="text-darkbrown/40"> / {factor.max} pts</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-darkbrown/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${factor.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>

                    {/* Detail explanation */}
                    <p className="text-[11px] text-darkbrown/70 font-medium">
                      {factor.detail}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Bullet Reasons */}
          {Array.isArray(match.reasons) && match.reasons.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-darkbrown/60">
                Key Matching Reasons (प्रमुख मिलान कारक)
              </h3>
              <ul className="space-y-2">
                {match.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-darkbrown/85 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Donor Profile Highlights */}
          <div className="p-4 rounded-2xl bg-teal/5 border border-teal/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-[10px] uppercase font-bold text-darkbrown/50">दूरी (Distance)</div>
              <div className="text-sm font-black text-teal">{match.distanceKm} KM</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-darkbrown/50">प्रतिक्रिया समय (Response)</div>
              <div className="text-sm font-black text-darkbrown">{match.estimatedResponseMinutes} Mins</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-darkbrown/50">ट्रस्ट स्कोर (Trust)</div>
              <div className="text-sm font-black text-emerald-600">{match.trustScore}/100</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-darkbrown/50">सत्यापन (Verification)</div>
              <div className="text-xs font-black text-darkbrown mt-0.5">
                {match.isAadhaarVerified ? 'mAadhaar QR' : 'KYC Tier'}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-cream/60 border-t border-darkbrown/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-darkbrown/20 hover:bg-darkbrown/5 text-xs font-bold text-darkbrown transition"
          >
            बंद करें (Close)
          </button>

          {onSendRequest && (
            <button
              onClick={() => onSendRequest(match)}
              disabled={isSending || sendSuccess}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-black transition flex items-center justify-center gap-2 shadow-md ${
                sendSuccess
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-terracotta hover:bg-terracotta-hover text-white'
              }`}
            >
              {isSending ? (
                <span>भेज रहे हैं...</span>
              ) : sendSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>अनुरोध भेजा गया! (Request Sent)</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>सहायता अनुरोध भेजें (Send Assistance Request)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
