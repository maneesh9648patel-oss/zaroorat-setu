import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PhoneCall, MessageSquare, UserCheck, CheckCircle2, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function VolunteerAssistPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [queue, setQueue] = useState([
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
  ]);

  const [callerName, setCallerName] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [needCategory, setNeedCategory] = useState('Medical');
  const [needDesc, setNeedDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleRegisterOnBehalf = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setNeedDesc('');
      setCallerName('');
      setCallerPhone('');
    }, 2000);
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

        <div className="flex items-center gap-2.5">
          <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold text-softYellow flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse"></span>
            <span>Toll-Free IVR: 1800-ZAROORAT</span>
          </div>
        </div>
      </div>

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
                      setCallerPhone("9876543210");
                      setCallerName("Ram Prasad");
                      setNeedDesc(item.note);
                    }}
                    className="px-4 py-2 rounded-xl bg-terracotta text-white font-bold hover:bg-terracotta-hover transition shadow-sm"
                  >
                    Assist & Pre-fill Form
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
              className="w-full py-4 rounded-2xl bg-teal hover:bg-teal-hover text-white font-black text-sm shadow-md transition tap-target"
            >
              {submitted ? "✓ Submitted to Verifier Queue!" : "Submit Assisted Registration &rarr;"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
