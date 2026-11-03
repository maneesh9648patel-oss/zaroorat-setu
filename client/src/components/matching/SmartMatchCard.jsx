import React, { useState } from 'react';
import { 
  ShieldCheck, MapPin, Clock, PackageCheck, Heart, 
  Sparkles, CheckCircle2, ChevronRight, AlertTriangle, ArrowRight,
  Send, User, PhoneCall, Check, Building2
} from 'lucide-react';
import KycBadge from '../common/KycBadge';

export default function SmartMatchCard({ match, onOpenWhyMatch, onSendRequest, isSending, isSent }) {
  if (!match) return null;

  return (
    <div className={`relative bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between ${
      match.emergencyLevel === 'Critical'
        ? 'border-terracotta/40 ring-1 ring-terracotta/20 bg-gradient-to-b from-terracotta/[0.02] to-white'
        : 'border-darkbrown/10 hover:border-teal/40'
    }`}>
      
      {/* Top Bar: Emergency Level & AI Match Score Pill */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {match.emergencyLevel === 'Critical' ? (
            <span className="px-2.5 py-1 rounded-full bg-terracotta text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              <span>Critical Emergency</span>
            </span>
          ) : match.emergencyLevel === 'High' ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider">
              High Priority
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-teal/15 text-teal text-[11px] font-black uppercase tracking-wider">
              {match.emergencyLevel || 'Normal'} Need
            </span>
          )}
        </div>

        {/* AI MATCH: XX% Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal to-darkbrown text-white shadow-sm border border-teal/30">
          <Sparkles className="w-3.5 h-3.5 text-softYellow shrink-0" />
          <span className="text-xs font-black tracking-tight">
            AI MATCH: <span className="text-softYellow font-black">{match.matchScore}%</span>
          </span>
        </div>
      </div>

      {/* Main Donor Profile Info */}
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          {/* Avatar / Role Icon */}
          <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-cream flex items-center justify-center text-2xl border border-darkbrown/10 shrink-0 shadow-inner">
            {match.avatar || '🤝'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-base sm:text-lg text-darkbrown truncate">
                {match.name || match.publicName}
              </h3>
              {match.isAadhaarVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-300" title="mAadhaar Secure QR Digital Verified">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Aadhaar Verified</span>
                </span>
              )}
            </div>

            <p className="text-xs text-darkbrown/70 font-semibold flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-teal shrink-0" />
              <span>{match.area || 'Banda'} · </span>
              <span className="font-extrabold text-teal">{match.distanceKm} KM</span>
            </p>
          </div>
        </div>

        {/* Key Realtime Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-cream/50 border border-darkbrown/5 text-xs">
          {/* Resource Status */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-darkbrown/50">
              संसाधन (Resource)
            </div>
            <div className="font-bold text-darkbrown truncate flex items-center gap-1 text-[11px] sm:text-xs">
              <PackageCheck className="w-3.5 h-3.5 text-teal shrink-0" />
              <span className="truncate">{match.resourceName || 'Available'}</span>
            </div>
          </div>

          {/* Response Time */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-darkbrown/50">
              प्रतिक्रिया (Response)
            </div>
            <div className="font-bold text-darkbrown flex items-center gap-1 text-[11px] sm:text-xs">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>~{match.estimatedResponseMinutes} Minutes</span>
            </div>
          </div>

          {/* Availability Status */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-darkbrown/50">
              तत्परता (Availability)
            </div>
            <div className="font-bold text-emerald-700 flex items-center gap-1 text-[11px] sm:text-xs truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="truncate">{match.willingnessStatus === 'available_willing' ? 'Available' : 'Needs Confirm'}</span>
            </div>
          </div>

          {/* Trust Score */}
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-darkbrown/50">
              विश्वसनीयता (Trust Score)
            </div>
            <div className="font-black text-darkbrown flex items-center gap-1 text-[11px] sm:text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0" />
              <span className="text-emerald-600">{match.trustScore}/100</span>
            </div>
          </div>
        </div>

        {/* Quick Reasons Teaser */}
        {Array.isArray(match.reasons) && match.reasons.length > 0 && (
          <p className="text-[11px] text-darkbrown/70 leading-relaxed font-medium line-clamp-2">
            💡 <span className="font-bold text-darkbrown">{match.reasons[0]}</span> {match.reasons[1] ? `· ${match.reasons[1]}` : ''}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-4 border-t border-darkbrown/10 flex flex-col sm:flex-row items-center gap-2.5">
        {/* Why This Match Button */}
        <button
          onClick={() => onOpenWhyMatch && onOpenWhyMatch(match)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-darkbrown/20 hover:border-darkbrown/40 bg-white hover:bg-cream text-xs font-bold text-darkbrown transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal" />
          <span>Why This Match?</span>
        </button>

        {/* Send Assistance Request Button */}
        <button
          onClick={() => onSendRequest && onSendRequest(match)}
          disabled={isSending || isSent}
          className={`w-full sm:flex-1 px-4 py-2.5 rounded-full text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm ${
            isSent
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-terracotta hover:bg-terracotta-hover text-white'
          }`}
        >
          {isSending ? (
            <span>भेज रहे हैं...</span>
          ) : isSent ? (
            <>
              <Check className="w-4 h-4" />
              <span>अनुरोध भेजा गया (Sent)</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send Assistance Request</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
