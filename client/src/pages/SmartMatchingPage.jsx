import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Sparkles, Search, MapPin, Filter, AlertTriangle, 
  Heart, ShieldCheck, RefreshCw, Send, CheckCircle2, 
  Clock, PackageCheck, Layers, ChevronRight, Sliders, Settings2, BarChart3, ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SmartMatchCard from '../components/matching/SmartMatchCard';
import WhyThisMatchModal from '../components/matching/WhyThisMatchModal';
import DonorWillingnessModal from '../components/matching/DonorWillingnessModal';
import AdminMatchingAnalytics from '../components/matching/AdminMatchingAnalytics';

export default function SmartMatchingPage() {
  const [searchParams] = useSearchParams();
  const initialRequestId = searchParams.get('requestId') || 'req_1041';
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('engine'); // 'engine' | 'custom' | 'admin'
  const [existingRequests, setExistingRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(initialRequestId);
  
  // Custom Query State
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Medical');
  const [customUrgency, setCustomUrgency] = useState('Urgent');
  const [customDesc, setCustomDesc] = useState('');

  // Radius & Category Filters
  const [selectedRadius, setSelectedRadius] = useState(20);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Matching Engine Results State
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [error, setError] = useState(null);

  // Modals & Actions
  const [activeWhyMatch, setActiveWhyMatch] = useState(null);
  const [isWillingnessOpen, setIsWillingnessOpen] = useState(false);
  const [sendingMatchId, setSendingMatchId] = useState(null);
  const [sentMatchIds, setSentMatchIds] = useState(new Set());
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState(null);

  // Fetch Requests on mount
  useEffect(() => {
    async function loadRequests() {
      try {
        const res = await api.requests.getAll();
        if (res.requests) {
          setExistingRequests(res.requests);
        }
      } catch (e) {
        // fallback sample requests
      }
    }
    loadRequests();
  }, []);

  // Fetch Matches for selected Request
  const fetchMatchesForRequest = async (reqId, radius) => {
    setLoading(true);
    setError(null);
    setDispatchSuccessMsg(null);
    try {
      const res = await api.matching.getSmartMatches(reqId, { radius: radius || selectedRadius });
      if (res.success) {
        setMatchData(res);
      } else {
        throw new Error(res.error || "Failed to calculate smart matches");
      }
    } catch (err) {
      console.warn("Fetch smart matches error:", err);
      setError(err.message || "Failed to find matching providers");
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on selectedRequestId or radius change
  useEffect(() => {
    if (activeTab === 'engine' && selectedRequestId) {
      fetchMatchesForRequest(selectedRequestId, selectedRadius);
    }
  }, [selectedRequestId, selectedRadius, activeTab]);

  // Handle Custom On-the-fly Match
  const handleCustomSearch = async (e) => {
    if (e) e.preventDefault();
    if (!customTitle.trim()) return;

    setLoading(true);
    setError(null);
    setDispatchSuccessMsg(null);
    try {
      const res = await api.matching.findCustomMatches({
        title: customTitle,
        description: customDesc,
        category: customCategory,
        urgency: customUrgency,
        radiusKm: selectedRadius
      });
      if (res.success) {
        setMatchData(res);
      } else {
        throw new Error(res.error || "No match found");
      }
    } catch (err) {
      console.warn("Custom match error:", err);
      setError(err.message || "Custom search failed");
    } finally {
      setLoading(false);
    }
  };

  // Dispatch Assistance Request
  const handleSendAssistanceRequest = async (match) => {
    setSendingMatchId(match.candidateId);
    setDispatchSuccessMsg(null);
    try {
      const res = await api.matching.sendAssistanceRequest({
        requestId: matchData?.requestId || selectedRequestId,
        requestTitle: matchData?.requestTitle || customTitle || "Community Assistance Need",
        category: matchData?.category || customCategory || "General",
        urgency: matchData?.emergencyLevel || customUrgency || "Normal",
        donorId: match.candidateId,
        matchScore: match.matchScore,
        factorScores: match.factorScores,
        explanation: match.reasons
      });

      if (res.success) {
        setSentMatchIds(prev => new Set([...prev, match.candidateId]));
        setDispatchSuccessMsg(res.message || `Request successfully dispatched to ${match.name}!`);
      } else {
        throw new Error(res.error || "Dispatch failed");
      }
    } catch (err) {
      alert(err.message || "Failed to send assistance request");
    } finally {
      setSendingMatchId(null);
    }
  };

  // Filter matches by category if selected
  const displayedMatches = (matchData?.matches || []).filter(m => {
    if (selectedCategoryFilter === 'all') return true;
    return (m.resourceName || '').toLowerCase().includes(selectedCategoryFilter.toLowerCase()) ||
      (m.role || '').toLowerCase().includes(selectedCategoryFilter.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 animate-in fade-in duration-200 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-darkbrown via-darkbrown to-darkbrown/95 text-cream rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-60 h-60 bg-terracotta/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-softYellow/20 border border-softYellow/30 text-softYellow text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Based Smart Matching Engine · HackFest 3.0</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            स्मार्ट सहायता मैचिंग इंजन
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 leading-relaxed font-medium">
            Connects requesters with the highest-compatibility verified donors, lenders, and NGOs based on Emergency Priority, Distance, Resource Availability, Time, Trust Score, and Willingness.
          </p>
        </div>

        {/* Quick Action Buttons in Banner */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsWillingnessOpen(true)}
            className="px-4 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Settings2 className="w-4 h-4 text-softYellow" />
            <span>मेरी तत्परता (My Readiness)</span>
          </button>

          {user?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                activeTab === 'admin'
                  ? 'bg-softYellow text-darkbrown font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin Analytics</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-darkbrown/10 pb-2 overflow-x-auto no-scrollbar flex-nowrap">
        <button
          onClick={() => setActiveTab('engine')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
            activeTab === 'engine'
              ? 'bg-darkbrown text-white shadow-md'
              : 'text-darkbrown/70 hover:text-darkbrown hover:bg-cream'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-softYellow" />
          <span>लाइव आवश्यकता मैचिंग (Live Requests)</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
            activeTab === 'custom'
              ? 'bg-darkbrown text-white shadow-md'
              : 'text-darkbrown/70 hover:text-darkbrown hover:bg-cream'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-teal" />
          <span>कस्टम आवश्यकता खोज (Custom Need)</span>
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'admin'
                ? 'bg-darkbrown text-white shadow-md'
                : 'text-darkbrown/70 hover:text-darkbrown hover:bg-cream'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-softYellow" />
            <span>एडमिन ऑडिटिंग (Control Panel)</span>
          </button>
        )}
      </div>

      {/* ADMIN CONTROL PANEL TAB */}
      {activeTab === 'admin' && (
        <div className="bg-cream/40 p-6 rounded-3xl border border-darkbrown/10">
          <AdminMatchingAnalytics />
        </div>
      )}

      {/* CUSTOM NEED TAB */}
      {activeTab === 'custom' && (
        <form onSubmit={handleCustomSearch} className="bg-white p-6 rounded-3xl border border-darkbrown/10 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-black text-sm text-darkbrown">
            <Search className="w-4 h-4 text-teal" />
            <span>Search Matching Donors for Any Urgent Community Need</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-darkbrown/60">
                Need Title (आवश्यकता का शीर्षक)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={e => setCustomTitle(e.target.value)}
                placeholder="e.g. O+ Blood Donor / Wheelchair / Casio Calculator"
                className="w-full px-4 py-2.5 rounded-2xl border border-darkbrown/15 text-xs font-bold focus:ring-2 focus:ring-teal focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-darkbrown/60">
                Category (श्रेणी)
              </label>
              <select
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-darkbrown/15 text-xs font-bold bg-white focus:ring-2 focus:ring-teal focus:outline-none"
              >
                <option value="Medical">Medical (चिकित्सा)</option>
                <option value="Items">Items & Mobility (सामग्री)</option>
                <option value="Education">Education & Study (शिक्षा)</option>
                <option value="Electronics">Electronics (इलेक्ट्रॉनिक्स)</option>
                <option value="Family Utensils">Family Utensils (बर्तन)</option>
                <option value="Emergency">Emergency (आपातकाल)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-darkbrown/70">Urgency:</span>
              {['Urgent', 'High', 'Normal'].map(u => (
                <button
                  type="button"
                  key={u}
                  onClick={() => setCustomUrgency(u)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition border ${
                    customUrgency === u
                      ? 'bg-terracotta text-white border-terracotta shadow-sm'
                      : 'border-darkbrown/15 text-darkbrown/70 hover:border-darkbrown/30'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !customTitle.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-teal hover:bg-teal-dark text-white text-xs font-black shadow-md transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'एआई विश्लेषण कर रहा है...' : 'AI स्मार्ट मैच खोजें (Search Matches)'}</span>
            </button>
          </div>
        </form>
      )}

      {/* LIVE REQUEST SELECTOR (When on 'engine' tab) */}
      {activeTab === 'engine' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-darkbrown/10 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-darkbrown flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal" />
              <span>Select Community Need Request for Live Matching (आवश्यकता चुनें):</span>
            </label>

            {selectedRequestId && (
              <span className="text-xs font-bold text-teal">
                Active ID: #{selectedRequestId}
              </span>
            )}
          </div>

          {/* Quick Select Pill Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "req_1041", title: "Blood Donor B+", category: "Medical", urgency: "Urgent", area: "District Hospital" },
              { id: "req_1042", title: "Wheelchair (2 weeks)", category: "Items", urgency: "High", area: "Civil Lines" },
              { id: "req_1044", title: "Casio Calculator", category: "Education", urgency: "High", area: "REC Banda" },
              { id: "req_1045", title: "Solar Emergency Lantern", category: "Electronics", urgency: "High", area: "Baberu" },
              { id: "req_1043", title: "Scholarship Guidance", category: "Education", urgency: "Normal", area: "REC Banda" }
            ].map(r => {
              const isSelected = selectedRequestId === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRequestId(r.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 border text-left ${
                    isSelected
                      ? 'bg-darkbrown text-white border-darkbrown shadow-md ring-2 ring-teal/50'
                      : 'bg-cream/40 text-darkbrown border-darkbrown/10 hover:border-darkbrown/30 hover:bg-cream'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${r.urgency === 'Urgent' ? 'bg-terracotta animate-pulse' : 'bg-teal'}`} />
                  <div>
                    <span className="font-black">{r.title}</span>
                    <span className="text-[10px] opacity-70 ml-1.5">({r.area})</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER & RADIUS CONTROLS */}
      <div className="p-4 sm:p-5 rounded-3xl bg-cream/50 border border-darkbrown/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Radius Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black uppercase tracking-wider text-darkbrown/60 flex items-center gap-1.5 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-teal" />
            <span>Search Radius (दूरी दायरा):</span>
          </span>

          {[2, 5, 10, 20, 50].map(radius => (
            <button
              key={radius}
              onClick={() => setSelectedRadius(radius)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                selectedRadius === radius
                  ? 'bg-teal text-white border-teal shadow-sm'
                  : 'bg-white text-darkbrown/70 border-darkbrown/15 hover:border-darkbrown/30'
              }`}
            >
              {radius <= 20 ? `${radius} KM` : '20+ KM (Expanded)'}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'Medical', 'Items', 'Study', 'Electronics'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
                selectedCategoryFilter === cat
                  ? 'bg-darkbrown text-white shadow-sm'
                  : 'bg-white/80 text-darkbrown/60 hover:text-darkbrown'
              }`}
            >
              {cat === 'all' ? 'All Resources' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Success Dispatch Alert */}
      {dispatchSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* Medical Alert Disclaimer */}
      {matchData?.medicalDisclaimer && (
        <div className="p-4 rounded-2xl bg-terracotta/10 border border-terracotta/25 text-terracotta text-xs font-semibold flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-terracotta mt-0.5" />
          <div>
            <span className="font-black uppercase tracking-wider block">Important Medical Urgency Disclaimer</span>
            <span>{matchData.medicalDisclaimer} For immediate life-saving critical conditions, contact emergency ambulance (108) or police (112) without delay.</span>
          </div>
        </div>
      )}

      {/* MATCHING RESULTS HEADER */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="space-y-0.5">
          <h2 className="text-xl sm:text-2xl font-black text-darkbrown flex items-center gap-2">
            <span>AI Smart Matches ({displayedMatches.length})</span>
            {loading && <RefreshCw className="w-4 h-4 text-teal animate-spin" />}
          </h2>
          <p className="text-xs text-darkbrown/60">
            {matchData?.requestTitle ? `Matched for: "${matchData.requestTitle}"` : "Evaluating registered community providers"} · Search radius: {selectedRadius} KM
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'engine' && selectedRequestId) fetchMatchesForRequest(selectedRequestId, selectedRadius);
            else if (activeTab === 'custom') handleCustomSearch();
          }}
          className="p-2 rounded-full border border-darkbrown/15 bg-white hover:bg-cream text-darkbrown text-xs font-bold transition shadow-sm"
          title="Re-run AI Matching"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="p-12 text-center bg-white rounded-3xl border border-darkbrown/10 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-teal/10 text-teal flex items-center justify-center mx-auto animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-black text-darkbrown">
            AI Triage & Smart Matching in Progress...
          </p>
          <p className="text-xs text-darkbrown/60 max-w-sm mx-auto">
            Computing weighted score across emergency urgency, GPS proximity, resource stock, time compatibility, and donor willingness.
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && displayedMatches.length === 0 && (
        <div className="p-10 text-center bg-white rounded-3xl border border-darkbrown/10 shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center mx-auto text-darkbrown/40">
            <MapPin className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-darkbrown">
              No suitable donor found within {selectedRadius} km
            </h3>
            <p className="text-xs text-darkbrown/60 max-w-md mx-auto">
              There are currently no active verified donors with matching resources or readiness in your immediate radius. Expand the radius to find regional providers.
            </p>
          </div>

          <button
            onClick={() => setSelectedRadius(50)}
            className="px-6 py-2.5 rounded-full bg-teal hover:bg-teal-dark text-white text-xs font-black transition shadow-sm inline-flex items-center gap-2"
          >
            <span>दूरी दायरा बढ़ाएं (Expand Search Radius to 50 KM)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MATCH CARDS GRID */}
      {!loading && displayedMatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedMatches.map(match => (
            <SmartMatchCard
              key={match.candidateId}
              match={match}
              onOpenWhyMatch={m => setActiveWhyMatch(m)}
              onSendRequest={handleSendAssistanceRequest}
              isSending={sendingMatchId === match.candidateId}
              isSent={sentMatchIds.has(match.candidateId)}
            />
          ))}
        </div>
      )}

      {/* WHY THIS MATCH MODAL */}
      <WhyThisMatchModal
        match={activeWhyMatch}
        onClose={() => setActiveWhyMatch(null)}
        onSendRequest={handleSendAssistanceRequest}
        isSending={activeWhyMatch && sendingMatchId === activeWhyMatch.candidateId}
        sendSuccess={activeWhyMatch && sentMatchIds.has(activeWhyMatch.candidateId)}
      />

      {/* DONOR WILLINGNESS MODAL */}
      <DonorWillingnessModal
        isOpen={isWillingnessOpen}
        onClose={() => setIsWillingnessOpen(false)}
        onUpdated={() => {
          if (activeTab === 'engine' && selectedRequestId) fetchMatchesForRequest(selectedRequestId, selectedRadius);
        }}
      />

    </div>
  );
}
