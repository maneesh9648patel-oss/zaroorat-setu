import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Repeat, ArrowRight, ShieldCheck, HeartHandshake, MapPin, Sparkles, 
  AlertCircle, PhoneCall, CheckCircle, Mic, Globe, Clock, Users, PackageCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import PriorityBadge from '../components/common/PriorityBadge';
import KycBadge from '../components/common/KycBadge';
import BrandLogo from '../components/common/BrandLogo';

export default function HomeDashboard({ onOpenVoiceRecorder }) {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');

  // Realistic sample requests matching the design screens & community needs
  const sampleRequests = [
    {
      id: "req_1041",
      initial: "B",
      initialColor: "bg-terracotta/20 text-terracotta",
      title: "Blood donor, B+ required urgently",
      area: "District Hospital Banda",
      distance: "2 km",
      timeAgo: "12 min ago",
      urgency: "Urgent",
      category: "Medical",
      desc: "Emergency surgery in 4 hours. Replacement units required immediately."
    },
    {
      id: "req_1042",
      initial: "W",
      initialColor: "bg-teal/20 text-teal",
      title: "Wheelchair for 2 weeks",
      area: "Civil Lines, Banda",
      distance: "3 km",
      timeAgo: "1 h ago",
      urgency: "High",
      category: "Items",
      desc: "Rehabilitation support after leg fracture. Patient is elderly."
    },
    {
      id: "req_1044",
      initial: "C",
      initialColor: "bg-softYellow/80 text-darkbrown",
      title: "Casio fx-991EX Calculator for Exam",
      area: "REC Banda",
      distance: "1 km",
      timeAgo: "25 min ago",
      urgency: "High",
      category: "Education",
      desc: "End-semester examinations starting tomorrow. 3-day loan required."
    },
    {
      id: "req_1046",
      initial: "U",
      initialColor: "bg-terracotta/20 text-terracotta",
      title: "Community Patila (50L) & 40 Thali Set",
      area: "Civil Lines, Banda",
      distance: "2.5 km",
      timeAgo: "40 min ago",
      urgency: "High",
      category: "Family Utensils",
      desc: "Gathering meal at home. Required for 2 days then returned clean."
    },
    {
      id: "req_1045",
      initial: "E",
      initialColor: "bg-teal/20 text-teal",
      title: "Solar Emergency Lantern & Power Bank",
      area: "Baberu",
      distance: "4 km",
      timeAgo: "45 min ago",
      urgency: "High",
      category: "Electronics",
      desc: "Rural transformer breakdown. Medical lighting backup required."
    },
    {
      id: "req_1043",
      initial: "S",
      initialColor: "bg-softYellow/60 text-darkbrown",
      title: "Scholarship form guidance & textbook",
      area: "REC Banda",
      distance: "5 km",
      timeAgo: "Today",
      urgency: "Normal",
      category: "Education",
      desc: "Assistance with UP Post-Matric portal document upload & Sem 3 book."
    }
  ];

  const filteredRequests = activeCategory === 'all'
    ? sampleRequests
    : sampleRequests.filter(r => {
        const cat = r.category.toLowerCase();
        if (activeCategory === 'medical') return cat === 'medical';
        if (activeCategory === 'education') return cat === 'education';
        if (activeCategory === 'items') return cat === 'items' || cat === 'family utensils' || cat === 'electronics';
        return cat.includes(activeCategory.toLowerCase());
      });

  return (
    <div className="pb-24 pt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* FULL-WIDTH HERO SECTION */}
      <div className="bg-darkbrown text-cream p-6 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
        <div className="relative z-10 max-w-3xl space-y-4">
          {/* Welcome Pill & Location */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-softYellow">
              <span>{t('heroGreeting')}, {user?.displayName ? user.displayName.split(' ')[0] : 'Neighbor'}</span>
              <KycBadge level={user?.kycLevel} status={user?.kycStatus} size="sm" />
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-cream/90 bg-white/10 px-3 py-1 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-terracotta" />
              <span>Pilot: REC Banda & nearby areas</span>
            </div>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              <BrandLogo size="lg" className="hidden sm:inline-block" />
              <span>Zaroorat<span className="text-softYellow">Setu</span></span>
            </h1>
            <p className="text-base sm:text-xl font-medium text-cream/90 leading-relaxed max-w-2xl">
              "{t('heroQuote')}"
            </p>
          </div>

          {/* Two Big Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 max-w-xl">
            <button
              onClick={() => navigate('/new-request')}
              className="p-5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white text-left shadow-lg transition flex items-center justify-between group tap-target"
            >
              <div>
                <div className="font-black text-lg leading-tight">{t('btnNeedHelp')}</div>
                <div className="text-xs text-white/80 mt-1">Post an urgent or community need</div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition shrink-0 ml-3">
                <Plus className="w-6 h-6 text-white stroke-[3]" />
              </div>
            </button>

            <button
              onClick={() => navigate('/borrow-return')}
              className="p-5 rounded-2xl bg-teal hover:bg-teal-hover text-white text-left shadow-lg transition flex items-center justify-between group tap-target"
            >
              <div>
                <div className="font-black text-lg leading-tight">{t('btnBorrowLend')}</div>
                <div className="text-xs text-white/80 mt-1">Books, utensils, calculators, tools</div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition shrink-0 ml-3">
                <Repeat className="w-6 h-6 text-white stroke-[3]" />
              </div>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Backing */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none hidden lg:block">
          <BrandLogo size="xl" className="w-96 h-96" />
        </div>
      </div>

      {/* 2-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / MAIN COLUMN (8 Columns on desktop) */}
        <div className="lg:col-span-8 space-y-8">
          {/* AI Voice Recorder Quick Banner */}
          {onOpenVoiceRecorder && (
            <div 
              onClick={onOpenVoiceRecorder}
              className="p-4 sm:p-5 rounded-3xl bg-white border-2 border-terracotta/30 shadow-sm hover:border-terracotta hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-terracotta text-white flex items-center justify-center shadow-md group-hover:scale-105 transition shrink-0">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm sm:text-base text-darkbrown flex items-center gap-2">
                    <span>AI Voice Recorder (बोलकर अपनी ज़रूरत दर्ज करें)</span>
                    <span className="px-2 py-0.5 rounded-full bg-softYellow/70 text-[10px] font-extrabold text-darkbrown">
                      Hindi / बुंदेली
                    </span>
                  </div>
                  <div className="text-xs text-darkbrown/70 mt-1 leading-normal">
                    Speak your need naturally in Hindi, Bundeli, or English. AI automatically transcribes and categorizes your request.
                  </div>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-terracotta shrink-0 animate-pulse hidden sm:block" />
            </div>
          )}

          {/* Verified Requests Near You Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-black text-xl text-darkbrown tracking-tight">
                  {t('verifiedRequestsNearYou')}
                </h2>
                <p className="text-xs text-darkbrown/60">Community verified needs in Banda region</p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { id: 'all', label: t('catAll') },
                  { id: 'medical', label: t('catMedical') },
                  { id: 'education', label: t('catEducation') },
                  { id: 'items', label: t('catItems') }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition ${
                      activeCategory === cat.id
                        ? 'bg-darkbrown text-cream shadow-sm'
                        : 'bg-white text-darkbrown/70 border border-darkbrown/10 hover:border-darkbrown/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Request Cards Grid (1 col on mobile, 2 cols on desktop) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => navigate(`/requests/${req.id}/status`)}
                  className="p-4 rounded-3xl bg-white border border-darkbrown/10 shadow-sm hover:shadow-md hover:border-terracotta/40 transition cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base shrink-0 ${req.initialColor}`}>
                        {req.initial}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-darkbrown leading-snug group-hover:text-terracotta transition">
                          {req.title}
                        </h3>
                        <p className="text-[11px] text-darkbrown/60 mt-0.5 font-medium">
                          {req.area} · {req.distance} · {req.timeAgo}
                        </p>
                      </div>
                    </div>
                    <PriorityBadge urgency={req.urgency} size="sm" />
                  </div>

                  <p className="text-xs text-darkbrown/75 leading-relaxed line-clamp-2">
                    {req.desc}
                  </p>

                  <div className="pt-1 flex items-center justify-between text-xs text-teal font-bold border-t border-darkbrown/5">
                    <span>{req.category}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                      View Status &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3-Step Solution Flow (Desktop 3-Column Cards) */}
          <div className="space-y-4">
            <h3 className="font-black text-lg text-darkbrown tracking-tight">
              How ZarooratSetu Works
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-2">
                <span className="w-8 h-8 rounded-2xl bg-terracotta text-white font-black text-sm flex items-center justify-center">
                  1
                </span>
                <div className="font-extrabold text-sm text-darkbrown">Post a Need</div>
                <p className="text-xs text-darkbrown/70 leading-relaxed">
                  Describe what you need in the app, tap the mic to speak in Bundeli or Hindi, or register via missed call.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-2">
                <span className="w-8 h-8 rounded-2xl bg-teal text-white font-black text-sm flex items-center justify-center">
                  2
                </span>
                <div className="font-extrabold text-sm text-darkbrown">Verify & Match</div>
                <p className="text-xs text-darkbrown/70 leading-relaxed">
                  A human verifier confirms the request. The AI suggests priority and matches with verified donors/lenders nearby.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-2">
                <span className="w-8 h-8 rounded-2xl bg-darkbrown text-cream font-black text-sm flex items-center justify-center">
                  3
                </span>
                <div className="font-extrabold text-sm text-darkbrown">Receive & Reuse</div>
                <p className="text-xs text-darkbrown/70 leading-relaxed">
                  Handover is confirmed safely via a single-use QR code. Items circulate back to the next community member.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT / SIDEBAR COLUMN (4 Columns on desktop) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Problem Story Box: Ramesh (Matching prompt) */}
          <div className="p-5 rounded-3xl bg-softYellow/35 border border-softYellow/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-terracotta uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Why ZarooratSetu Exists</span>
            </div>
            <h4 className="font-black text-sm sm:text-base text-darkbrown leading-snug">
              The 11 PM Emergency Problem: Ramesh's Story
            </h4>
            <p className="text-xs text-darkbrown/80 leading-relaxed">
              At 11 PM, Ramesh's relative needed rare <strong>B+ blood</strong> at District Hospital Banda. He sent WhatsApp messages to 5 groups. After <strong>50 forwards and 3 hours lost</strong>, most numbers were unresponsive.
            </p>
            <p className="text-xs text-darkbrown/85 leading-relaxed font-semibold bg-white/70 p-3 rounded-2xl border border-softYellow">
              ZarooratSetu solves this: verified urgent needs are matched directly with verified local donors and NGOs within 5 km in minutes.
            </p>
          </div>

          {/* Offline Access Callout Banner */}
          <div className="p-5 rounded-3xl bg-darkbrown text-cream space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-softYellow flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-terracotta" />
                {t('offlineTitle')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold text-cream/70">
                {t('offlineStatusBadge')}
              </span>
            </div>
            <p className="text-xs text-cream/80 leading-relaxed">
              {t('offlineDesc')}
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-white/10">
              <span className="text-sm font-mono font-black text-softYellow">
                1800-ZAROORAT
              </span>
              <Link
                to="/volunteer-assist"
                className="text-xs font-extrabold text-white underline hover:text-softYellow"
              >
                Volunteer Desk &rarr;
              </Link>
            </div>
          </div>

          {/* Impact Counters (Clearly Labeled Demo Data) */}
          <div className="p-5 rounded-3xl bg-white border border-darkbrown/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-black text-sm text-darkbrown">REC Banda Pilot Impact</span>
              <span className="px-2.5 py-0.5 rounded-full bg-softYellow/60 text-darkbrown text-[10px] font-extrabold">
                Demo data
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-cream">
                <div className="font-black text-2xl text-terracotta">142</div>
                <div className="text-xs font-bold text-darkbrown/70 mt-1">Needs Fulfilled</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-cream">
                <div className="font-black text-2xl text-teal">18 min</div>
                <div className="text-xs font-bold text-darkbrown/70 mt-1">Avg Response</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-cream">
                <div className="font-black text-2xl text-darkbrown">38</div>
                <div className="text-xs font-bold text-darkbrown/70 mt-1">Items Reused</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-cream">
                <div className="font-black text-2xl text-terracotta">42</div>
                <div className="text-xs font-bold text-darkbrown/70 mt-1">Blood Units</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
