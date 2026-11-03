import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  Users, RefreshCw, ShieldAlert, Award, FileText, ArrowRight, ShieldCheck, Check
} from 'lucide-react';
import { api } from '../../services/api';

export default function AdminMatchingAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.matching.getAdminAnalytics();
      if (res.success) {
        setAnalytics(res.analytics);
      } else {
        throw new Error(res.error || "Failed to load matching analytics");
      }
    } catch (err) {
      console.warn("Analytics fetch error:", err);
      setError(err.message || "Failed to load matching metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleUnrestrict = async (uid) => {
    if (!window.confirm("क्या आप इस खाते से प्रतिबंध हटाना चाहते हैं? (Lift restriction for this account?)")) return;
    setActionLoadingId(uid);
    try {
      await api.disputes.unrestrictUser(uid);
      await fetchAnalytics();
    } catch (err) {
      alert(err.message || "Failed to unrestrict account");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-darkbrown/10">
        <RefreshCw className="w-8 h-8 mx-auto text-teal animate-spin mb-2" />
        <p className="text-xs font-bold text-darkbrown/70">लोड हो रहा है (Calculating real-time matching metrics)...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-3xl border border-darkbrown/10 text-center space-y-2">
        <AlertTriangle className="w-6 h-6 text-terracotta mx-auto" />
        <p className="text-xs font-bold text-terracotta">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-1.5 rounded-full bg-darkbrown text-white text-xs font-bold"
        >
          पुनः प्रयास करें (Retry)
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-darkbrown">
            AI Matching Engine Control Panel & Auditing
          </h2>
          <p className="text-xs text-darkbrown/70">
            Real-time monitoring of community triage, dispatch efficiency, and fraud prevention.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-darkbrown/15 bg-white hover:bg-cream text-xs font-bold text-darkbrown transition self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal" />
          <span>रिफ्रेश (Refresh Metrics)</span>
        </button>
      </div>

      {/* 6 Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Requests */}
        <div className="p-4 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-darkbrown/50">Total Matching Requests</div>
          <div className="text-2xl font-black text-darkbrown">{analytics.totalRequests}</div>
          <div className="text-[10px] text-teal font-semibold">Active civic requests</div>
        </div>

        {/* Critical Emergency */}
        <div className="p-4 rounded-3xl bg-terracotta/5 border border-terracotta/20 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-terracotta">Critical Emergencies</div>
          <div className="text-2xl font-black text-terracotta">{analytics.criticalRequests}</div>
          <div className="text-[10px] text-terracotta font-semibold">Immediate life-critical priority</div>
        </div>

        {/* Successful Matches */}
        <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-800">Successful Matches</div>
          <div className="text-2xl font-black text-emerald-700">{analytics.successfulMatches}</div>
          <div className="text-[10px] text-emerald-800 font-semibold">Accepted assistance dispatches</div>
        </div>

        {/* Average Matching Time */}
        <div className="p-4 rounded-3xl bg-teal/5 border border-teal/20 shadow-sm space-y-1">
          <div className="text-[10px] uppercase font-bold text-teal">Avg. Response Time</div>
          <div className="text-2xl font-black text-teal">{analytics.avgMatchingTimeMinutes} <span className="text-xs font-bold">Mins</span></div>
          <div className="text-[10px] text-teal font-semibold">Rapid community dispatch</div>
        </div>
      </div>

      {/* Secondary Metrics Bar: Pending, Rejected, Fraud Reports */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-cream/60 border border-darkbrown/10 text-center">
        <div>
          <div className="text-[10px] uppercase font-bold text-darkbrown/50">Pending Matches</div>
          <div className="text-lg font-black text-amber-600">{analytics.pendingRequests}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-darkbrown/50">Rejected / Re-routed</div>
          <div className="text-lg font-black text-gray-600">{analytics.rejectedMatches}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-darkbrown/50">Fraud / Restricted Flags</div>
          <div className="text-lg font-black text-terracotta">{analytics.fraudReports}</div>
        </div>
      </div>

      {/* Suspicious Account Review & Fraud Auditing */}
      {Array.isArray(analytics.suspiciousAccounts) && analytics.suspiciousAccounts.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-terracotta/20 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-terracotta" />
            <h3 className="font-black text-sm text-darkbrown">
              Suspicious Accounts & Fraud Review ({analytics.suspiciousAccounts.length})
            </h3>
          </div>

          <div className="divide-y divide-darkbrown/5">
            {analytics.suspiciousAccounts.map(acc => (
              <div key={acc.uid} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-bold text-darkbrown flex items-center gap-2">
                    <span>{acc.displayName || acc.publicName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-black">
                      Trust: {acc.trustScore}/100
                    </span>
                    {acc.isRestricted && (
                      <span className="px-2 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-black">
                        Restricted
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-darkbrown/60 mt-0.5">
                    {acc.restrictionReason || `${acc.disputesLostCount || 0} disputes lost on record.`}
                  </p>
                </div>

                {acc.isRestricted && (
                  <button
                    onClick={() => handleUnrestrict(acc.uid)}
                    disabled={actionLoadingId === acc.uid}
                    className="px-3 py-1 rounded-full border border-darkbrown/20 hover:bg-darkbrown text-darkbrown hover:text-white text-xs font-bold transition self-start sm:self-auto"
                  >
                    प्रतिबंध हटाएं (Unrestrict)
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent AI Matching Dispatches Table */}
      <div className="bg-white rounded-3xl border border-darkbrown/10 overflow-hidden shadow-sm">
        <div className="p-4 bg-cream/40 border-b border-darkbrown/10 font-black text-xs uppercase tracking-wider text-darkbrown flex items-center justify-between">
          <span>Recent AI Dispatches & Audit Log</span>
          <span className="text-[10px] text-teal font-bold">{analytics.recentDispatches?.length || 0} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[550px] text-left text-xs text-darkbrown">
            <thead className="bg-cream/20 text-darkbrown/60 uppercase text-[10px] font-bold border-b border-darkbrown/5">
              <tr>
                <th className="p-3">Request</th>
                <th className="p-3">Requester</th>
                <th className="p-3">Matched Donor</th>
                <th className="p-3">AI Score</th>
                <th className="p-3">Status</th>
                <th className="p-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkbrown/5">
              {!analytics.recentDispatches || analytics.recentDispatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-darkbrown/40 font-bold">
                    No recent match dispatches recorded.
                  </td>
                </tr>
              ) : (
                analytics.recentDispatches.map(m => (
                  <tr key={m.id} className="hover:bg-cream/10 transition">
                    <td className="p-3 font-bold truncate max-w-[150px]">{m.requestTitle}</td>
                    <td className="p-3 text-darkbrown/70">{m.requesterName}</td>
                    <td className="p-3 text-darkbrown/70">{m.donorName}</td>
                    <td className="p-3 font-black text-teal">{m.matchScore}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        m.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        m.status === 'declined' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 text-darkbrown/50 text-[10px]">
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
