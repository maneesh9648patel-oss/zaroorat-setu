import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Search, Filter, AlertTriangle, CheckCircle2, 
  Clock, Box, Layers, User, Phone, ShieldCheck, RefreshCw, 
  Calendar, RotateCcw, AlertCircle, TrendingUp, PackageCheck,
  ChevronRight, ArrowUpRight, ArrowDownLeft, ShieldAlert, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import AdminMatchingAnalytics from '../components/matching/AdminMatchingAnalytics';

export default function StockDashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'matching'

  // Filters for the Full Records Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'active' | 'returned' | 'overdue'
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.exchange.getDashboard();
      if (res && res.success) {
        setDashboardData(res);
      } else {
        throw new Error(res?.error || "डैशबोर्ड डेटा लोड करने में त्रुटि");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "डैशबोर्ड डेटा लोड नहीं हो सका।");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Handle Mark as Returned
  const handleMarkReturned = async (transactionId) => {
    if (!window.confirm("क्या आप इस वस्तु को वापस प्राप्त (Mark as Returned) के रूप में चिह्नित करना चाहते हैं? इससे स्टॉक स्वतः बढ़ जाएगा।")) {
      return;
    }
    setActionLoadingId(transactionId);
    setSuccessMsg(null);
    setError(null);
    try {
      const res = await api.exchange.returnItem(transactionId);
      if (res.success) {
        setSuccessMsg(res.message || "सामान सफलतापूर्वक वापस दर्ज हुआ और स्टॉक अपडेट हो गया!");
        await fetchDashboard();
      } else {
        throw new Error(res.error || "वापसी दर्ज करने में विफल");
      }
    } catch (err) {
      console.error("Return item error:", err);
      setError(err.message || "वापसी दर्ज करने में त्रुटि हुई।");
    } finally {
      setActionLoadingId(null);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const records = dashboardData?.allTransactions || [];
    if (!records.length) {
      alert("एक्सपोर्ट करने के लिए कोई रिकॉर्ड उपलब्ध नहीं है।");
      return;
    }

    const headers = [
      "Transaction ID",
      "Item Name",
      "Category",
      "Quantity",
      "Type",
      "Status",
      "Giver Name",
      "Giver Phone",
      "Giver Aadhaar Last4",
      "Receiver Name",
      "Receiver Phone",
      "Receiver Aadhaar Last4",
      "Issue Date",
      "Duration (Days)",
      "Due Date",
      "Return Date",
      "Days Remaining",
      "Days Overdue",
      "Created At"
    ];

    const rows = records.map(r => [
      `"${r.id || ''}"`,
      `"${(r.item_name || '').replace(/"/g, '""')}"`,
      `"${(r.item_category || '').replace(/"/g, '""')}"`,
      r.quantity || 1,
      `"${r.type || ''}"`,
      `"${r.status || ''}"`,
      `"${(r.giver_name || '').replace(/"/g, '""')}"`,
      `"${r.giver_phone || ''}"`,
      `"${r.giver_aadhaar_last4 || ''}"`,
      `"${(r.receiver_name || '').replace(/"/g, '""')}"`,
      `"${r.receiver_phone || ''}"`,
      `"${r.receiver_aadhaar_last4 || ''}"`,
      `"${r.issue_date || ''}"`,
      r.duration_days || '',
      `"${r.due_date || ''}"`,
      `"${r.return_date || ''}"`,
      r.days_remaining !== null ? r.days_remaining : '',
      r.days_overdue !== null ? r.days_overdue : '',
      `"${r.created_at || ''}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ZarooratSetu_Stock_Exchange_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered transactions for the full records table
  const filteredRecords = useMemo(() => {
    if (!dashboardData?.allTransactions) return [];
    return dashboardData.allTransactions.filter(r => {
      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'overdue' && !r.is_overdue) return false;
        if (selectedStatus === 'active' && (r.status !== 'active' || r.is_overdue)) return false;
        if (selectedStatus === 'returned' && r.status !== 'returned') return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && r.item_category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.item_name && r.item_name.toLowerCase().includes(q);
        const matchGiver = r.giver_name && r.giver_name.toLowerCase().includes(q);
        const matchReceiver = r.receiver_name && r.receiver_name.toLowerCase().includes(q);
        const matchId = r.id && r.id.toLowerCase().includes(q);
        const matchPhone = (r.giver_phone && r.giver_phone.includes(q)) || (r.receiver_phone && r.receiver_phone.includes(q));
        if (!matchName && !matchGiver && !matchReceiver && !matchId && !matchPhone) return false;
      }
      return true;
    });
  }, [dashboardData, selectedStatus, selectedCategory, searchQuery]);

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-16 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Banner / Header */}
      <div className="bg-darkbrown text-cream p-6 sm:p-8 rounded-3xl shadow-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Link
              to="/borrow-return"
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
              title="वापस कैटलॉग जाएं"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="px-3 py-1 rounded-full bg-softYellow/20 text-softYellow text-xs font-bold border border-softYellow/30">
              इन्वेंट्री एवं आदान-प्रदान प्रशासन (Stock Governance)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            स्टॉक संतुलन एवं विनिमय डैशबोर्ड (Stock & Exchange Dashboard)
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 max-w-2xl leading-relaxed">
            कुल स्टॉक बनाम उपलब्ध स्टॉक, जारी की गई वस्तुओं की समयावधि, <strong>अतिदेय (Overdue) सामानों का लाल अलर्ट</strong> एवं <strong>CSV डेटा लेज़र निर्यात</strong>।
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition flex items-center gap-2 text-xs font-bold"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-softYellow' : ''}`} />
            <span className="hidden sm:inline">रीफ्रेश</span>
          </button>

          <button
            onClick={handleExportCsv}
            disabled={!dashboardData?.allTransactions?.length}
            className="px-4 py-3 rounded-2xl bg-teal hover:bg-teal-hover text-white text-xs sm:text-sm font-black shadow-md transition flex items-center gap-2 border border-teal/40 tap-target"
            title="CSV फ़ाइल डाउनलोड करें"
          >
            <Download className="w-4 h-4 text-softYellow" />
            <span>CSV निर्यात (Export)</span>
          </button>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-darkbrown/10 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'stock'
              ? 'bg-darkbrown text-cream shadow-sm'
              : 'bg-white text-darkbrown/70 hover:bg-cream/60 border border-darkbrown/10'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>स्टॉक एवं विनिमय लेज़र (Stock & Ledger)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'matching'
              ? 'bg-terracotta text-white shadow-sm'
              : 'bg-white text-darkbrown/70 hover:bg-cream/60 border border-darkbrown/10'
          }`}
        >
          <Sparkles className="w-4 h-4 text-softYellow" />
          <span>⚡ AI स्मार्ट मैचिंग नियंत्रण (AI Matching Analytics)</span>
        </button>
      </div>

      {activeTab === 'matching' ? (
        <AdminMatchingAnalytics />
      ) : (
        <>
          {/* Alerts & Messages */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {/* KPI Stats Overview Cards */}
      {dashboardData?.summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Stock */}
          <div className="p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-darkbrown/50">
                कुल पंजीकृत स्टॉक
              </span>
              <div className="w-8 h-8 rounded-xl bg-darkbrown/5 text-darkbrown flex items-center justify-center">
                <Box className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-darkbrown">
              {dashboardData.summary.totalStock} <span className="text-xs font-bold text-darkbrown/50">इकाइयां</span>
            </div>
            <div className="text-[11px] text-darkbrown/60">
              {dashboardData.summary.totalItemsCount} अलग-अलग वस्तुएं कैटलॉग में
            </div>
          </div>

          {/* Available Stock */}
          <div className="p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal">
                उपलब्ध स्टॉक (Available)
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-teal">
              {dashboardData.summary.availableStock} <span className="text-xs font-bold text-teal/70">इकाइयां</span>
            </div>
            <div className="text-[11px] text-darkbrown/60">
              समुदाय में तुरंत लेने हेतु उपलब्ध
            </div>
          </div>

          {/* Currently Given Out */}
          <div className="p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-terracotta">
                वर्तमान में उधार पर (Issued)
              </span>
              <div className="w-8 h-8 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-terracotta">
              {dashboardData.summary.borrowedStock} <span className="text-xs font-bold text-terracotta/70">इकाइयां</span>
            </div>
            <div className="text-[11px] text-darkbrown/60">
              {dashboardData.summary.activeGivenOutCount} सक्रिय लेनदेन प्रगति पर
            </div>
          </div>

          {/* Overdue Items Alert Card */}
          <div className={`p-5 rounded-3xl border shadow-sm space-y-1 transition ${
            dashboardData.summary.overdueCount > 0 
              ? 'bg-red-50 border-red-300 ring-2 ring-red-400/20' 
              : 'bg-white border-darkbrown/10'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                dashboardData.summary.overdueCount > 0 ? 'text-red-700 font-extrabold' : 'text-darkbrown/50'
              }`}>
                अतिदेय सामान (Overdue)
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                dashboardData.summary.overdueCount > 0 ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {dashboardData.summary.overdueCount > 0 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </div>
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${
              dashboardData.summary.overdueCount > 0 ? 'text-red-600' : 'text-emerald-700'
            }`}>
              {dashboardData.summary.overdueCount} <span className="text-xs font-bold text-darkbrown/60">लेनदेन</span>
            </div>
            <div className="text-[11px] text-darkbrown/70 font-semibold">
              {dashboardData.summary.overdueCount > 0 ? "समय सीमा समाप्त! वापसी आवश्यक" : "कोई अतिदेय सामान नहीं"}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: OVERDUE ITEMS HIGHLIGHTED IN RED (IF ANY) */}
      {dashboardData?.overdueItems && dashboardData.overdueItems.length > 0 && (
        <div className="p-6 rounded-3xl bg-red-50/90 border-2 border-red-400 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg text-red-950 flex items-center gap-2">
                  <span>🚨 अतिदेय वस्तुएं (Overdue Items Alert)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-200 text-red-900 text-xs font-extrabold">
                    {dashboardData.overdueItems.length} अतिदेय
                  </span>
                </h3>
                <p className="text-xs text-red-800 font-medium">
                  इन वस्तुओं की निर्धारित वापसी तिथि (Due Date) बीत चुकी है। तत्काल संपर्क कर वापसी सुनिश्चित करें।
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {dashboardData.overdueItems.map((item) => (
              <div 
                key={item.id} 
                className="p-4 rounded-2xl bg-white border-2 border-red-300 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                      🔴 {item.days_overdue} दिन अतिदेय ({item.days_overdue}d Overdue)
                    </span>
                    <span className="text-[10px] font-mono text-darkbrown/40">#{item.id}</span>
                  </div>

                  <h4 className="font-black text-sm text-darkbrown leading-tight">
                    {item.item_name}
                  </h4>

                  <div className="text-xs text-darkbrown/70 space-y-0.5 pt-1">
                    <div>
                      मात्रा: <strong className="text-red-700 font-bold">{item.quantity} इकाई</strong>
                    </div>
                    <div>
                      अंतिम तिथि (Due Date): <strong className="text-red-600">{formatDate(item.due_date)}</strong>
                    </div>
                    <div>
                      जारी तिथि (Issued): <strong>{formatDate(item.issue_date)}</strong> ({item.duration_days} दिन अवधि)
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-red-900 uppercase">उधार लेने वाला (Borrower):</span>
                      <span className="text-[10px] text-red-800 font-mono">XXXX {item.receiver_aadhaar_last4 || '---'}</span>
                    </div>
                    <div className="font-black text-darkbrown text-xs">{item.receiver_name}</div>
                    {item.receiver_phone && (
                      <a 
                        href={`tel:${item.receiver_phone}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:underline pt-0.5"
                      >
                        <Phone className="w-3 h-3 text-terracotta" />
                        <span>{item.receiver_phone} (कॉल करें)</span>
                      </a>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleMarkReturned(item.id)}
                  disabled={actionLoadingId === item.id}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm transition flex items-center justify-center gap-1.5 tap-target disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{actionLoadingId === item.id ? "स्टॉक अपडेट हो रहा है..." : "वापस प्राप्त हुआ (Mark as Returned)"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: TOTAL STOCK VS. AVAILABLE STOCK PER ITEM */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-darkbrown/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-darkbrown flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              <span>कुल स्टॉक बनाम उपलब्ध स्टॉक (Total vs. Available Stock)</span>
            </h2>
            <p className="text-xs text-darkbrown/60">
              प्रत्येक वस्तु की कुल सूचीबद्ध संख्या एवं समुदाय में वर्तमान में उपलब्ध बची हुई मात्रा
            </p>
          </div>
          <div className="text-xs font-bold text-darkbrown/70 bg-cream px-3 py-1.5 rounded-full border border-darkbrown/10">
            {dashboardData?.items?.length || 0} वस्तुएं ट्रैक की जा रही हैं
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {dashboardData?.items?.map((item) => {
            const total = Number(item.quantity_total || 1);
            const avail = Number(item.quantity_available ?? total);
            const issued = Math.max(0, total - avail);
            const pct = Math.round((avail / total) * 100);

            return (
              <div 
                key={item.id} 
                className="p-4 rounded-2xl bg-cream/30 border border-darkbrown/10 hover:border-darkbrown/25 transition space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-darkbrown/10 text-darkbrown text-[10px] font-bold">
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      avail > 0 ? 'bg-teal text-white' : 'bg-terracotta text-white'
                    }`}>
                      {avail > 0 ? `${pct}% उपलब्ध` : 'स्टॉक समाप्त'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-xs sm:text-sm text-darkbrown line-clamp-2 leading-snug" title={item.name}>
                    {item.name}
                  </h3>

                  {/* Stock Counts Comparison Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-teal flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal"></span>
                        उपलब्ध: {avail}
                      </span>
                      <span className="text-terracotta flex items-center gap-1">
                        उधार पर: {issued}
                      </span>
                      <span className="text-darkbrown/60 font-semibold">
                        कुल: {total}
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-darkbrown/10 overflow-hidden flex">
                      <div 
                        className="bg-teal transition-all duration-300" 
                        style={{ width: `${pct}%` }}
                        title={`उपलब्ध: ${avail}/${total}`}
                      />
                      <div 
                        className="bg-terracotta transition-all duration-300" 
                        style={{ width: `${100 - pct}%` }}
                        title={`उधार पर: ${issued}/${total}`}
                      />
                    </div>
                  </div>

                  <div className="text-[10px] text-darkbrown/60 flex items-center justify-between pt-1 border-t border-darkbrown/10">
                    <span>प्रदाता: <strong>{item.ownerPublicName || 'Community Member'}</strong></span>
                    <span>{item.loanPeriodDays || 14}d मानक लोन</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: ITEMS CURRENTLY GIVEN OUT, WITH DAYS REMAINING */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-darkbrown/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-darkbrown flex items-center gap-2">
              <Clock className="w-5 h-5 text-terracotta" />
              <span>वर्तमान में दिए गए सामान (Items Currently Given Out)</span>
            </h2>
            <p className="text-xs text-darkbrown/60">
              सक्रिय उधार अवधि एवं शेष बचे दिनों (Days Remaining) की लाइव स्थिति
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold border border-terracotta/20">
            {dashboardData?.currentlyGivenOut?.length || 0} सक्रिय लोन
          </span>
        </div>

        {dashboardData?.currentlyGivenOut?.length === 0 ? (
          <div className="p-8 rounded-2xl bg-cream/40 border border-darkbrown/10 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-teal mx-auto" />
            <div className="font-bold text-xs text-darkbrown">वर्तमान में कोई सामान उधार पर नहीं है।</div>
            <div className="text-[11px] text-darkbrown/60">सभी सामान कम्युनिटी हब/प्रदाताओं के पास उपलब्ध हैं।</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData?.currentlyGivenOut?.map((txn) => {
              const isOverdue = txn.is_overdue;

              return (
                <div 
                  key={txn.id}
                  className={`p-4 rounded-2xl border transition shadow-sm space-y-3 flex flex-col justify-between ${
                    isOverdue 
                      ? 'bg-red-50 border-red-300' 
                      : 'bg-white border-darkbrown/10 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {isOverdue ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                          🔴 अतिदेय ({txn.days_overdue}d Overdue)
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          (txn.days_remaining ?? 14) <= 3 
                            ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                            : 'bg-teal-light text-teal font-extrabold'
                        }`}>
                          🟢 {txn.days_remaining} दिन शेष ({txn.days_remaining}d Left)
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-darkbrown/40">#{txn.id}</span>
                    </div>

                    <h4 className="font-black text-xs sm:text-sm text-darkbrown leading-tight">
                      {txn.item_name}
                    </h4>

                    <div className="p-2.5 rounded-xl bg-cream/60 border border-darkbrown/10 text-xs space-y-1">
                      <div className="flex justify-between text-darkbrown/70">
                        <span>उधार मात्रा:</span>
                        <strong className="text-darkbrown">{txn.quantity} इकाई</strong>
                      </div>
                      <div className="flex justify-between text-darkbrown/70">
                        <span>जारी तिथि (Issued):</span>
                        <strong>{formatDate(txn.issue_date)}</strong>
                      </div>
                      <div className="flex justify-between text-darkbrown/70">
                        <span>नियत वापसी (Due):</span>
                        <strong className={isOverdue ? 'text-red-700' : 'text-teal'}>{formatDate(txn.due_date)}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] space-y-1 pt-1 border-t border-darkbrown/10">
                      <div>
                        लेने वाला: <strong>{txn.receiver_name}</strong> {txn.receiver_phone ? `(${txn.receiver_phone})` : ''}
                      </div>
                      <div>
                        देने वाला: <strong>{txn.giver_name}</strong> {txn.giver_phone ? `(${txn.giver_phone})` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Mark as Returned Action Button for Giver / Admin */}
                  <button
                    onClick={() => handleMarkReturned(txn.id)}
                    disabled={actionLoadingId === txn.id}
                    className="w-full py-2 px-3 rounded-xl bg-teal hover:bg-teal-hover text-white text-xs font-black shadow-sm transition flex items-center justify-center gap-1.5 tap-target disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{actionLoadingId === txn.id ? "प्रक्रिया जारी..." : "वापस प्राप्त हुआ (Mark as Returned)"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: FULL RECORDS TABLE WITH SEARCH, FILTER, AND CSV EXPORT */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-darkbrown/10 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-darkbrown flex items-center gap-2">
              <Box className="w-5 h-5 text-teal" />
              <span>सम्पूर्ण विनिमय लेज़र (Full Exchange Records Ledger)</span>
            </h2>
            <p className="text-xs text-darkbrown/60">
              समुदाय के सभी लेन-देन, जारी तिथि, देय तिथि, वापसी स्थिति एवं दोनों पक्षों के आधार विवरण
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            disabled={!filteredRecords.length}
            className="px-4 py-2.5 rounded-2xl bg-teal hover:bg-teal-hover text-white text-xs font-black shadow-sm transition flex items-center gap-1.5 shrink-0 self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>CSV डाउनलोड ({filteredRecords.length} रिकॉर्ड)</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-darkbrown/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="सामान, देने वाले या लेने वाले का नाम/फोन खोजें..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-darkbrown/15 bg-cream/30 text-xs font-semibold outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-darkbrown/50 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-darkbrown/15 bg-cream/30 text-xs font-bold text-darkbrown outline-none"
            >
              <option value="all">सभी स्थितियाँ (All Status)</option>
              <option value="active">उधार पर सक्रिय (Active)</option>
              <option value="overdue">अतिदेय (Overdue)</option>
              <option value="returned">वापस आ चुका (Returned)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-darkbrown/15 bg-cream/30 text-xs font-bold text-darkbrown outline-none"
            >
              <option value="all">सभी श्रेणियां (All Categories)</option>
              <option value="Study Material">Study Material (किताबें / कैलकुलेटर)</option>
              <option value="Family Utensils">Family Utensils (बर्तन)</option>
              <option value="Electronics">Electronics (इलेक्ट्रॉनिक्स)</option>
              <option value="Medical & Mobility">Medical & Mobility (चिकित्सा उपकरण)</option>
            </select>
          </div>
        </div>

        {/* Responsive Table with horizontal scroll wrapper */}
        <div className="overflow-x-auto rounded-2xl border border-darkbrown/10">
          <table className="w-full min-w-[850px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-darkbrown text-cream text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-3.5">ID / प्रकार</th>
                <th className="py-3 px-3.5">सामान (Item)</th>
                <th className="py-3 px-2 text-center">मात्रा</th>
                <th className="py-3 px-3.5">देने वाला (Giver)</th>
                <th className="py-3 px-3.5">लेने वाला (Receiver)</th>
                <th className="py-3 px-3">जारी तिथि</th>
                <th className="py-3 px-3">नियत वापसी</th>
                <th className="py-3 px-3 text-center">स्थिति</th>
                <th className="py-3 px-3.5 text-right">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-darkbrown/10 bg-white">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-darkbrown/50 font-bold">
                    कोई रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredRecords.map((txn) => {
                  const isOverdue = txn.is_overdue;
                  const isReturned = txn.status === 'returned';

                  return (
                    <tr 
                      key={txn.id}
                      className={`hover:bg-cream/40 transition ${
                        isOverdue ? 'bg-red-50/60 font-medium' : ''
                      }`}
                    >
                      {/* ID & Type */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono text-[10px] text-darkbrown/50 block">#{txn.id}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          txn.type === 'give' ? 'bg-teal/10 text-teal' : 'bg-terracotta/10 text-terracotta'
                        }`}>
                          {txn.type}
                        </span>
                      </td>

                      {/* Item Name & Category */}
                      <td className="py-3 px-3.5 max-w-[200px]">
                        <div className="font-black text-darkbrown truncate" title={txn.item_name}>
                          {txn.item_name}
                        </div>
                        <span className="text-[10px] text-darkbrown/60">{txn.item_category}</span>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-2 text-center font-bold text-darkbrown">
                        {txn.quantity}
                      </td>

                      {/* Giver Details */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-darkbrown truncate">{txn.giver_name}</div>
                        <div className="text-[10px] text-darkbrown/60">{txn.giver_phone || '-'}</div>
                      </td>

                      {/* Receiver Details */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-darkbrown truncate">{txn.receiver_name || '-'}</div>
                        <div className="text-[10px] text-darkbrown/60">{txn.receiver_phone || '-'}</div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3 px-3 text-[11px] whitespace-nowrap text-darkbrown/80">
                        {formatDate(txn.issue_date || txn.created_at)}
                      </td>

                      {/* Due Date & Remaining / Overdue badge */}
                      <td className="py-3 px-3 text-[11px] whitespace-nowrap">
                        <div className={isOverdue ? 'font-bold text-red-700' : 'text-darkbrown'}>
                          {formatDate(txn.due_date)}
                        </div>
                        {isReturned ? (
                          <span className="text-[9px] text-emerald-700 font-bold">वापस: {formatDate(txn.return_date)}</span>
                        ) : isOverdue ? (
                          <span className="text-[9px] font-black text-red-600 block">
                            🔴 {txn.days_overdue} दिन अतिदेय
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-teal block">
                            🟢 {txn.days_remaining} दिन शेष
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          isReturned
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-teal text-white'
                        }`}>
                          {isReturned ? 'वापस आ चुका' : isOverdue ? 'अतिदेय' : 'उधार पर'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        {!isReturned && txn.type === 'take' ? (
                          <button
                            onClick={() => handleMarkReturned(txn.id)}
                            disabled={actionLoadingId === txn.id}
                            className="px-2.5 py-1.5 rounded-xl bg-teal hover:bg-teal-hover text-white text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                            title="वस्तु वापस प्राप्त दर्ज करें"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{actionLoadingId === txn.id ? "..." : "वापस लें"}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-darkbrown/40 font-mono">
                            {isReturned ? "पूर्ण ✓" : "-"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}

    </div>
  );
}
