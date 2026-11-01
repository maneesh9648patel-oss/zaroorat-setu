import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, Flag, AlertTriangle, Sparkles, Clock, 
  ShieldCheck, Check, Filter, History, Award, CheckCircle2 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import PriorityBadge from '../components/common/PriorityBadge';

export default function VerifierDashboard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [queue, setQueue] = useState([
    {
      id: "req_2001",
      userName: "Ramesh K.",
      userArea: "District Hospital Banda",
      category: "Medical",
      title: "Blood donor, B+ required urgently",
      description: "Emergency surgery in 4 hours at District Hospital. Looking for 2 replacement donors.",
      urgency: "Urgent",
      aiSuggestion: {
        score: 9.8,
        priority: "Urgent",
        reason: "Critical surgical need; B+ blood supply scarce."
      },
      duplicateAlert: false,
      status: "pending"
    },
    {
      id: "req_2002",
      userName: "Amit S.",
      userArea: "Civil Lines, Banda",
      category: "Items",
      title: "Wheelchair needed for fracture",
      description: "Need a folding wheelchair for 2 weeks after leg fracture in Civil Lines.",
      urgency: "High",
      aiSuggestion: {
        score: 7.9,
        priority: "High",
        reason: "Temporary mobility impairment."
      },
      duplicateAlert: true, // Duplicate alert demonstration
      status: "pending"
    },
    {
      id: "req_2003",
      userName: "Deepak S.",
      userArea: "REC Banda",
      category: "Education",
      title: "Scientific Calculator Casio fx-991EX for Semester Exam",
      description: "Final year end-semester examinations starting tomorrow. Need calculator for 3 days.",
      urgency: "High",
      aiSuggestion: {
        score: 7.2,
        priority: "High",
        reason: "Academic deadline within 24 hours."
      },
      duplicateAlert: false,
      status: "pending"
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: "aud_01",
      performer: "Manoj Tripathi (Verifier #01)",
      action: "Approved req_1042 (Wheelchair)",
      time: "10:14 AM Today",
      notes: "Duplicate check passed. Priority confirmed as High."
    },
    {
      id: "aud_02",
      performer: "Manoj Tripathi (Verifier #01)",
      action: "Approved req_1041 (Blood Donor)",
      time: "09:45 AM Today",
      notes: "Hospital surgical emergency verified with Duty Officer."
    }
  ]);

  const handleAction = (reqId, action) => {
    setQueue(prev => prev.filter(r => r.id !== reqId));
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        performer: `${user?.displayName || 'Verifier'} (${user?.role})`,
        action: `${action.toUpperCase()} ${reqId}`,
        time: "Just now",
        notes: `Reviewer confirmed decision: ${action}.`
      },
      ...prev
    ]);
  };

  return (
    <div className="pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
              Community Governance Panel · REC Banda
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('verifierTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 max-w-xl">
            {t('verifierSubtitle')} — Human review gate for anti-duplicate verification, AI score validation, and safe community matching.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold text-softYellow flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse"></span>
            <span>Active Verifier: {user?.displayName || 'Manoj Tripathi'}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Pending Verification Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg text-darkbrown flex items-center gap-2">
              <span>Pending Verification Queue</span>
              <span className="px-2.5 py-0.5 rounded-full bg-terracotta text-white text-xs font-extrabold">
                {queue.length}
              </span>
            </h2>
            <span className="text-xs text-darkbrown/60 font-semibold">
              Prioritized by urgency & wait time
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-darkbrown/10 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-teal mx-auto" />
              <div className="font-extrabold text-lg text-darkbrown">All caught up!</div>
              <div className="text-xs text-darkbrown/60 max-w-md mx-auto">
                No pending requests requiring verification. All community requests in the REC Banda cluster have been validated.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((req) => (
                <div key={req.id} className="p-6 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-teal">{req.id}</span>
                        <span className="text-xs font-semibold text-darkbrown/60">· {req.category}</span>
                      </div>
                      <h3 className="font-black text-base sm:text-lg text-darkbrown mt-0.5 leading-snug">
                        {req.title}
                      </h3>
                      <div className="text-xs text-darkbrown/70 mt-1 font-medium">
                        Posted by <strong>{req.userName}</strong> · {req.userArea}
                      </div>
                    </div>
                    <PriorityBadge urgency={req.urgency} size="md" />
                  </div>

                  <p className="text-xs sm:text-sm text-darkbrown/80 leading-relaxed font-medium bg-cream/40 p-3.5 rounded-2xl">
                    {req.description}
                  </p>

                  {/* Duplicate alert if detected */}
                  {req.duplicateAlert && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 font-semibold">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                      <div>
                        <div>{t('duplicateAlert')}</div>
                        <div className="text-[11px] font-normal text-red-700 mt-0.5">
                          Potential duplicate request detected from same user within 24h (Jaccard similarity: 0.88).
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Priority Engine Suggestion Box */}
                  <div className="p-4 rounded-2xl bg-teal-light border border-teal/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-black text-teal">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-teal" />
                        AI Priority Engine Score: {req.aiSuggestion.score}/10 ({req.aiSuggestion.priority})
                      </span>
                    </div>
                    <div className="text-xs text-darkbrown/80 leading-relaxed font-medium">
                      {req.aiSuggestion.reason}
                    </div>
                    <div className="text-[11px] text-darkbrown/60 italic pt-1 border-t border-teal/10">
                      "{t('aiDisclaimer')}"
                    </div>
                  </div>

                  {/* Human Action Controls */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handleAction(req.id, 'Approved')}
                      className="flex-1 py-3 px-4 rounded-2xl bg-teal hover:bg-teal-hover text-white font-black text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-1.5 tap-target"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{t('btnApprove')}</span>
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'Flagged')}
                      className="flex-1 py-3 px-4 rounded-2xl bg-softYellow text-darkbrown font-black text-xs sm:text-sm border border-darkbrown/10 hover:bg-softYellow-hover transition flex items-center justify-center gap-1.5 tap-target"
                    >
                      <Flag className="w-4 h-4" />
                      <span>{t('btnFlag')}</span>
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'Rejected')}
                      className="py-3 px-4 rounded-2xl bg-red-100 hover:bg-red-200 text-red-700 font-black text-xs sm:text-sm transition flex items-center justify-center gap-1.5 tap-target"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{t('btnReject')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Audit Trail & Verification Protocols */}
        <div className="lg:col-span-4 space-y-6">
          {/* Audit Log Box */}
          <div className="p-6 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-darkbrown/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-terracotta" />
                <h3 className="font-black text-sm text-darkbrown">
                  {t('auditLogTitle')}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-darkbrown/50">Immutable</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-cream border border-darkbrown/5 space-y-1">
                  <div className="flex items-center justify-between font-extrabold text-darkbrown">
                    <span className="truncate mr-1">{log.performer}</span>
                    <span className="text-[10px] text-darkbrown/50 font-normal shrink-0">{log.time}</span>
                  </div>
                  <div className="text-teal font-black">{log.action}</div>
                  <div className="text-darkbrown/70 text-[11px] leading-normal">{log.notes}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Protocol Rules Card */}
          <div className="p-6 rounded-3xl bg-darkbrown text-cream space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-softYellow text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifier Code of Conduct</span>
            </div>
            <ul className="text-xs text-cream/80 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-teal font-black">✓</span>
                <span><strong>No AI Auto-Approval:</strong> Gemini recommendations are strictly advisory.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal font-black">✓</span>
                <span><strong>Privacy Shield:</strong> Never share caller full phone or exact residence address.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-teal font-black">✓</span>
                <span><strong>Emergency Triage:</strong> Surgical blood & oxygen requests must be cleared within 5 minutes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
