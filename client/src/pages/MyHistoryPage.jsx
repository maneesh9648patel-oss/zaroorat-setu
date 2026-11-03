import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, 
  Box, User, Phone, CheckCircle2, AlertCircle, RefreshCw, 
  Calendar, Hash, Sparkles, Plus, ExternalLink, RotateCcw, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function MyHistoryPage() {
  const { user, isAadhaarVerified, openAadhaarModal } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('gave'); // 'gave' | 'took'
  const [historyData, setHistoryData] = useState({ gave: [], took: [], totalGave: 0, totalTook: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.exchange.getHistory();
      setHistoryData(data);
      setLoading(false);
    } catch (err) {
      console.warn("Failed to fetch exchange history:", err.message);
      setError(err.message || "इतिहास लोड करने में असमर्थ। (Failed to load history)");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleMarkReturned = async (transactionId) => {
    if (!window.confirm("क्या आप पुष्टि करते हैं कि यह सामान आपको वापस प्राप्त हो गया है? इससे उपलब्ध स्टॉक स्वतः बढ़ जाएगा।")) {
      return;
    }
    setActionLoadingId(transactionId);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.exchange.returnItem(transactionId);
      if (res.success) {
        setSuccessMsg(res.message || "सामान सफलतापूर्वक वापस दर्ज हुआ और स्टॉक अपडेट हो गया!");
        await fetchHistory();
      } else {
        throw new Error(res.error || "वापसी दर्ज करने में त्रुटि");
      }
    } catch (err) {
      console.error("Mark as returned failed:", err);
      setError(err.message || "वापसी दर्ज करने में असमर्थ");
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return 'Recent';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoStr;
    }
  };

  const currentList = activeTab === 'gave' ? historyData.gave : historyData.took;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-12 animate-in fade-in duration-200">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/borrow-return"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-darkbrown/70 hover:text-darkbrown bg-white/70 hover:bg-white px-3 py-1.5 rounded-full border border-darkbrown/10 transition shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>कैटलॉग (Catalog)</span>
            </Link>
            <span className="text-darkbrown/30">•</span>
            <span className="text-xs font-black uppercase tracking-wider text-teal">
              डेटाबेस विनिमय लेज़र (Exchange Ledger)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-darkbrown leading-tight">
            मेरा आदान-प्रदान इतिहास (My History)
          </h1>
          <p className="text-xs text-darkbrown/70 mt-0.5">
            आपके द्वारा दिए गए और लिए गए सभी सामानों का डिजिटल रिकॉर्ड (Saved in DB with Giver & Receiver details)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            to="/dashboard"
            className="px-3.5 py-2 rounded-2xl bg-teal-light hover:bg-teal/20 text-teal border border-teal/30 text-xs font-black shadow-sm transition flex items-center gap-1.5"
            title="स्टॉक व इन्वेंट्री डैशबोर्ड देखें"
          >
            <Layers className="w-4 h-4" />
            <span>स्टॉक डैशबोर्ड (Dashboard)</span>
          </Link>

          <button
            onClick={fetchHistory}
            className="p-2 rounded-2xl bg-white hover:bg-cream text-darkbrown border border-darkbrown/10 shadow-sm transition"
            title="रीफ्रेश करें (Refresh)"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal' : ''}`} />
          </button>

          <Link
            to="/borrow-return"
            className="px-4 py-2 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>सामान दें / लें</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Total Items Given */}
        <div className="p-4 rounded-3xl bg-white border border-darkbrown/10 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-darkbrown/50">
              सामान जो मैंने दिया (Gave)
            </div>
            <div className="text-2xl font-black text-teal leading-tight">
              {historyData.totalGave} <span className="text-xs font-bold text-darkbrown/60">इकाइयाँ</span>
            </div>
            <div className="text-[10px] text-darkbrown/50">
              कुल {historyData.gave?.length || 0} लेनदेन
            </div>
          </div>
        </div>

        {/* Total Items Taken */}
        <div className="p-4 rounded-3xl bg-white border border-darkbrown/10 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-darkbrown/50">
              सामान जो मैंने लिया (Took)
            </div>
            <div className="text-2xl font-black text-terracotta leading-tight">
              {historyData.totalTook} <span className="text-xs font-bold text-darkbrown/60">इकाइयाँ</span>
            </div>
            <div className="text-[10px] text-darkbrown/50">
              कुल {historyData.took?.length || 0} लेनदेन
            </div>
          </div>
        </div>

        {/* Verified Status Card */}
        <div className="p-4 rounded-3xl bg-white border border-darkbrown/10 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-darkbrown/50">
              पहचान सुरक्षा स्तर
            </div>
            <div className="text-xs font-black text-emerald-800 leading-tight flex items-center gap-1">
              <span>{user?.aadhaarVerification?.verified ? 'mAadhaar डिजिटल सत्यापित' : 'सत्यापन आवश्यक'}</span>
            </div>
            <div className="text-[10px] text-darkbrown/60 font-mono mt-0.5">
              {user?.aadhaarVerification?.last4 ? `UID: XXXX XXXX ${user.aadhaarVerification.last4}` : 'आधार असत्यापित'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Items I Gave vs Items I Took */}
      <div className="bg-white rounded-3xl p-2 shadow-sm border border-darkbrown/10 flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('gave')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
            activeTab === 'gave'
              ? 'bg-teal text-white shadow-md'
              : 'text-darkbrown/70 hover:text-darkbrown hover:bg-cream'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>सामान जो मैंने दिया (Items I Gave)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'gave' ? 'bg-white/20 text-white' : 'bg-darkbrown/10 text-darkbrown'
          }`}>
            {historyData.gave?.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('took')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${
            activeTab === 'took'
              ? 'bg-terracotta text-white shadow-md'
              : 'text-darkbrown/70 hover:text-darkbrown hover:bg-cream'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>सामान जो मैंने लिया (Items I Took)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'took' ? 'bg-white/20 text-white' : 'bg-darkbrown/10 text-darkbrown'
          }`}>
            {historyData.took?.length || 0}
          </span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 mb-6 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2 mb-6 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm animate-pulse flex items-center justify-between">
              <div className="space-y-2 w-2/3">
                <div className="h-4 bg-darkbrown/10 rounded-full w-1/2"></div>
                <div className="h-3 bg-darkbrown/5 rounded-full w-3/4"></div>
              </div>
              <div className="h-8 bg-darkbrown/10 rounded-2xl w-24"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Transactions List */
        <div className="space-y-4">
          {currentList.length === 0 ? (
            /* Empty State */
            <div className="p-12 rounded-3xl bg-white border border-darkbrown/10 shadow-sm text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-cream text-darkbrown/40 flex items-center justify-center mx-auto">
                <Box className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-darkbrown">
                {activeTab === 'gave' 
                  ? "आपने अभी तक कोई सामान नहीं दिया है (No items given yet)" 
                  : "आपने अभी तक कोई सामान नहीं लिया है (No items taken yet)"}
              </h3>
              <p className="text-xs text-darkbrown/60 max-w-sm mx-auto">
                {activeTab === 'gave'
                  ? "अपनी अतिरिक्त पुस्तकें, उपकरण अथवा बर्तन पड़ोसियों के साथ साझा करें।"
                  : "बांदा समुदाय कैटलॉग से अपनी जरूरत का सामान 50% सुरक्षा धरोहर के साथ प्राप्त करें।"}
              </p>
              <div className="pt-2">
                <Link
                  to="/borrow-return"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal text-white text-xs font-black shadow-md hover:bg-teal-hover transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{activeTab === 'gave' ? 'सामान उधार / सहयोग दें' : 'कैटलॉग देखें'}</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Transaction Cards */
            currentList.map((txn) => {
              const isGave = activeTab === 'gave';
              const isOverdue = txn.is_overdue;
              const isReturned = txn.status === 'returned';

              return (
                <div
                  key={txn.id}
                  className={`p-5 sm:p-6 rounded-3xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isOverdue 
                      ? 'bg-red-50/60 border-red-300 shadow-sm' 
                      : 'bg-white border-darkbrown/10 shadow-sm hover:shadow-md'
                  }`}
                >
                  {/* Left: Item Info, Dates, Duration & Overdue Badge */}
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isOverdue 
                        ? 'bg-red-100 text-red-700' 
                        : (isGave ? 'bg-teal/10 text-teal' : 'bg-terracotta/10 text-terracotta')
                    }`}>
                      {isOverdue ? <AlertCircle className="w-6 h-6 animate-pulse" /> : isGave ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cream border border-darkbrown/10 text-darkbrown/80">
                          {txn.item_category || 'General'}
                        </span>

                        {/* Status Badge */}
                        {isReturned ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ वापस आ चुका (Returned)
                          </span>
                        ) : isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs">
                            🔴 अतिदेय: {txn.days_overdue} दिन (Overdue)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal text-white">
                            🟢 सक्रिय उधार: {txn.days_remaining} दिन शेष
                          </span>
                        )}

                        <span className="text-[10px] font-mono text-darkbrown/40">
                          #{txn.id}
                        </span>
                      </div>

                      <h4 className="text-base font-black text-darkbrown leading-tight">
                        {txn.item_name}
                      </h4>

                      {/* Quantity & Dates Grid */}
                      <div className="flex items-center gap-3 text-xs text-darkbrown/70 flex-wrap pt-0.5">
                        <span className="flex items-center gap-1 font-bold text-darkbrown">
                          <Box className="w-3.5 h-3.5 text-teal" />
                          <span>मात्रा: {txn.quantity} इकाई</span>
                        </span>
                        
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3.5 h-3.5 text-darkbrown/50" />
                          <span>जारी (Issue): <strong>{formatDate(txn.issue_date || txn.created_at)}</strong></span>
                        </span>

                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-terracotta" />
                          <span>नियत (Due): <strong className={isOverdue ? 'text-red-700 font-black' : 'text-darkbrown'}>{formatDate(txn.due_date)}</strong> ({txn.duration_days || 14}d)</span>
                        </span>

                        {txn.return_date && (
                          <span className="text-[11px] text-emerald-800 font-bold">
                            वापसी: {formatDate(txn.return_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Counterparty Details & "Mark as returned" Action for Giver */}
                  <div className="w-full md:w-auto md:border-l md:border-darkbrown/10 md:pl-6 shrink-0 flex flex-col justify-center md:min-w-[240px] space-y-2">
                    <div className="p-3 rounded-2xl bg-cream/50 border border-darkbrown/10 text-xs space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-darkbrown/50">
                        {isGave ? 'सामान प्राप्तकर्ता (Receiver Details):' : 'सामान प्रदाता (Giver Details):'}
                      </div>
                      
                      <div className="font-bold text-darkbrown flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal shrink-0" />
                        <span className="truncate">
                          {isGave 
                            ? (txn.receiver_name || 'Community Member') 
                            : (txn.giver_name || 'Community Lender')}
                        </span>
                      </div>

                      {(isGave ? txn.receiver_phone : txn.giver_phone) && (
                        <div className="text-[11px] font-mono text-darkbrown/70 flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-terracotta shrink-0" />
                          <span>{isGave ? txn.receiver_phone : txn.giver_phone}</span>
                        </div>
                      )}

                      {(isGave ? txn.receiver_aadhaar_last4 : txn.giver_aadhaar_last4) && (
                        <div className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>आधार: XXXX XXXX {isGave ? txn.receiver_aadhaar_last4 : txn.giver_aadhaar_last4}</span>
                        </div>
                      )}
                    </div>

                    {/* "Mark as returned" Button: Visible to Giver on active take transactions */}
                    {isGave && !isReturned && txn.type === 'take' && (
                      <button
                        onClick={() => handleMarkReturned(txn.id)}
                        disabled={actionLoadingId === txn.id}
                        className="w-full py-2.5 px-3 rounded-2xl bg-teal hover:bg-teal-hover disabled:opacity-50 text-white text-xs font-black shadow-sm transition flex items-center justify-center gap-1.5 tap-target"
                        title="वस्तु वापस प्राप्त दर्ज करें और स्टॉक पुनः बढ़ाएं"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{actionLoadingId === txn.id ? "स्टॉक अपडेट हो रहा है..." : "वापस प्राप्त हुआ (Mark as Returned)"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Database Architecture Notice Footer */}
      <div className="mt-8 p-4 rounded-3xl bg-cream border border-darkbrown/10 text-[11px] text-darkbrown/70 leading-relaxed flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal" />
          <span>
            <strong>डेटाबेस लेज़र:</strong> प्रत्येक गिव/टेक लेनदेन में प्रदाता एवं प्राप्तकर्ता दोनों के आधार व संपर्क विवरण सुरक्षित रूप से संग्रहित हैं।
          </span>
        </div>
        <div className="text-[10px] font-mono text-darkbrown/50">
          Tables: users · items · transactions
        </div>
      </div>

    </div>
  );
}
