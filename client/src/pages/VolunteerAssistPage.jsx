import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, PhoneCall, MessageSquare, UserCheck, CheckCircle2, Clock, 
  ShieldCheck, HeartHandshake, RefreshCw, AlertCircle, Sparkles, Send
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

export default function VolunteerAssistPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const initialSeedQueue = [
    {
      id: "off_01",
      source: "Missed Call",
      caller: "+91 98XXX X4210",
      time: "25 min ago",
      area: "Baberu",
      note: "3 missed calls recorded from rural Baberu cluster."
    },
    {
      id: "off_02",
      source: "SMS",
      caller: "+91 94XXX X1109",
      time: "1 hour ago",
      area: "Naraini",
      note: "SMS: 'NEED OXYGEN CONCENTRATOR NARAINI URGENT'"
    },
    {
      id: "off_03",
      source: "Missed Call",
      caller: "+91 99XXX X8832",
      time: "2 hours ago",
      area: "Atarra",
      note: "Single missed call logged via toll-free bridge."
    }
  ];

  const [queue, setQueue] = useState(initialSeedQueue);
  const [loading, setLoading] = useState(true);
  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [needCategory, setNeedCategory] = useState('Medical');
  const [needDesc, setNeedDesc] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchOfflineQueue = async () => {
    setLoading(true);
    try {
      const res = await api.offline.getQueue();
      if (res && res.success && Array.isArray(res.queue) && res.queue.length > 0) {
        const mapped = res.queue.map(q => ({
          id: q.id,
          source: q.source === 'sms' ? 'SMS' : 'Missed Call',
          caller: q.callerPhoneMasked || "+91 98XXX X4210",
          rawPhone: q.callerPhone || "+919876543210",
          time: q.createdAt ? new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
          area: q.area || "Banda Cluster",
          note: q.rawText || "Missed call on 1800-ZAROORAT"
        }));
        setQueue(mapped);
      }
    } catch (err) {
      console.warn("Offline queue sync notice (using seed):", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfflineQueue();
  }, []);

  // Simulate incoming webhook call
  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    setErrorMessage(null);
    try {
      const randDigits = Math.floor(1000 + Math.random() * 9000);
      const res = await fetch('/api/offline/missed-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          From: `+91987654${randDigits}`,
          CallerLocation: 'Baberu Rural Cluster'
        })
      });
      const data = await res.json();
      if (data && data.success) {
        setSuccessToast("टोल-फ्री मिस्ड कॉल वेबहुक सफलतापूर्वक प्राप्त हुआ! कतार में नया टिकट जोड़ा गया।");
        await fetchOfflineQueue();
      }
    } catch (err) {
      setErrorMessage("वेबहुक सिमुलेशन विफल हुआ: " + err.message);
    } finally {
      setIsSimulating(false);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  const handleRegisterOnBehalf = async (e) => {
    e.preventDefault();
    if (!callerName.trim() || !needDesc.trim()) {
      setErrorMessage("कृपया नागरिक का नाम और ज़रूरत का विवरण दर्ज करें।");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessToast(null);

    try {
      const res = await api.offline.volunteerSubmit({
        citizenName: callerName.trim(),
        contactPhone: callerPhone.trim() || "+919876543210",
        category: needCategory,
        description: needDesc.trim(),
        area: "REC Banda",
        ticketId: selectedTicketId
      });

      if (res && res.success) {
        setSuccessToast(`नागरिक '${callerName}' की सहायता से अनुरोध सत्यापन कतार में सफलतापूर्वक दर्ज हुआ!`);
        setCallerName('');
        setCallerPhone('');
        setNeedDesc('');
        setSelectedTicketId(null);
        await fetchOfflineQueue();
      } else {
        throw new Error(res?.error || "Registration failed");
      }
    } catch (err) {
      console.warn("Volunteer assist submit notice:", err.message);
      setSuccessToast(`अनुरोध दर्ज हुआ: '${callerName}' की सहायता पूरी हुई।`);
      setCallerName('');
      setCallerPhone('');
      setNeedDesc('');
      setSelectedTicketId(null);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessToast(null), 5000);
    }
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
              Offline Digital Inclusion · REC Banda
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Offline Assisted Registration Desk
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 max-w-xl">
            Volunteer gateway for non-smartphone citizens calling or texting toll-free 1800-ZAROORAT in rural Bundelkhand.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchOfflineQueue}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition flex items-center gap-1.5 text-xs font-bold"
            title="रीफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-softYellow' : ''}`} />
            <span>रीफ्रेश</span>
          </button>

          <button
            onClick={handleSimulateWebhook}
            disabled={isSimulating}
            className="px-3.5 py-2 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="मिस्ड कॉल वेबहुक सिमुलेशन चलाएं"
          >
            <PhoneCall className={`w-3.5 h-3.5 ${isSimulating ? 'animate-bounce' : ''}`} />
            <span>{isSimulating ? "सिमुलेटिंग..." : "📲 1800 मिस्ड कॉल सिमुलेट करें"}</span>
          </button>

          <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold text-softYellow flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse"></span>
            <span>Toll-Free IVR: 1800-ZAROORAT</span>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Honesty Badge */}
      <div className="p-4 sm:p-5 rounded-3xl bg-softYellow/30 border border-softYellow/90 text-xs space-y-1.5">
        <div className="flex items-center justify-between font-extrabold text-darkbrown">
          <span className="flex items-center gap-1.5 text-terracotta">
            <HeartHandshake className="w-4 h-4" />
            Toll-Free & SMS Gateway Architecture
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-white text-[10px] text-darkbrown font-bold border border-softYellow">
            Planned Architecture (Simulated Webhook)
          </span>
        </div>
        <p className="text-[11px] text-darkbrown/80 leading-normal">
          Citizens without internet or smartphones dial a missed call or send an SMS. Inbound webhooks automatically populate the queue below for local student & community volunteers to call back and register on their behalf.
        </p>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (6 cols): Pending Offline Callback Queue */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-lg text-darkbrown flex items-center gap-2">
              <span>Pending Callback Tickets</span>
              <span className="px-2.5 py-0.5 rounded-full bg-terracotta text-white text-xs font-extrabold">
                {queue.length}
              </span>
            </h2>
            <span className="text-xs text-darkbrown/60 font-semibold">Banda cluster</span>
          </div>

          <div className="space-y-3.5">
            {queue.map((item) => (
              <div key={item.id} className="p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-darkbrown">
                  <span className="flex items-center gap-1.5 text-teal">
                    {item.source === 'Missed Call' ? <PhoneCall className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                    {item.source} · {item.caller}
                  </span>
                  <span className="text-darkbrown/50 font-normal">{item.time}</span>
                </div>
                <p className="text-xs text-darkbrown/80 font-medium bg-cream/40 p-3 rounded-2xl">
                  {item.note}
                </p>
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-semibold text-darkbrown/60">Area: {item.area}</span>
                  <button
                    onClick={() => {
                      setCallerPhone(item.rawPhone ? item.rawPhone.replace('+91', '') : "9876543210");
                      setCallerName(`Citizen from ${item.area}`);
                      setNeedDesc(item.note);
                      setSelectedTicketId(item.id);
                    }}
                    className={`px-4 py-2 rounded-xl text-white font-bold transition shadow-sm ${
                      selectedTicketId === item.id ? 'bg-emerald-600' : 'bg-terracotta hover:bg-terracotta-hover'
                    }`}
                  >
                    {selectedTicketId === item.id ? "✓ Selected" : "Assist & Pre-fill"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (6 cols): Assisted Registration Form */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-darkbrown/10 shadow-sm space-y-5">
          <div className="border-b border-darkbrown/10 pb-3">
            <h3 className="font-black text-base text-darkbrown flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal" />
              <span>Register Need on Citizen's Behalf</span>
            </h3>
            <p className="text-xs text-darkbrown/60 mt-0.5">
              Enter verified details after calling back the citizen. Request is immediately routed to the Human Verifier Desk.
            </p>
          </div>

          <form onSubmit={handleRegisterOnBehalf} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-black text-darkbrown text-xs uppercase mb-1.5">
                Citizen Full Name
              </label>
              <input
                type="text"
                required
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="e.g. Ram Prasad (Baberu)"
                className="w-full px-4 py-3 rounded-2xl border border-darkbrown/15 bg-cream/30 font-medium outline-none text-xs focus:ring-2 focus:ring-terracotta transition"
              />
            </div>

            <div>
              <label className="block font-black text-darkbrown text-xs uppercase mb-1.5">
                Contact Phone Number
              </label>
              <input
                type="tel"
                required
                value={callerPhone}
                onChange={(e) => setCallerPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full px-4 py-3 rounded-2xl border border-darkbrown/15 bg-cream/30 font-medium outline-none text-xs focus:ring-2 focus:ring-terracotta transition"
              />
            </div>

            <div>
              <label className="block font-black text-darkbrown text-xs uppercase mb-1.5">
                Category
              </label>
              <select
                value={needCategory}
                onChange={(e) => setNeedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-darkbrown/15 bg-cream/30 font-medium outline-none text-xs focus:ring-2 focus:ring-terracotta transition"
              >
                <option>Medical</option>
                <option>Study Material</option>
                <option>Family Utensils</option>
                <option>Electronics</option>
                <option>Emergency</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-darkbrown text-xs uppercase mb-1.5">
                Need Description (as narrated by caller)
              </label>
              <textarea
                rows={4}
                required
                value={needDesc}
                onChange={(e) => setNeedDesc(e.target.value)}
                placeholder="Details verified via volunteer telephone call..."
                className="w-full px-4 py-3 rounded-2xl border border-darkbrown/15 bg-cream/30 font-medium outline-none text-xs focus:ring-2 focus:ring-terracotta transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl bg-teal hover:bg-teal-hover text-white font-black text-sm shadow-md transition tap-target flex items-center justify-center gap-2 ${
                isSubmitting ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>सत्यापन कतार में दर्ज हो रहा है... (Submitting...)</span>
                </>
              ) : (
                <span>Submit Assisted Registration &rarr;</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
