import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, ShieldCheck, AlertCircle, QrCode, CheckCircle2, RotateCcw, 
  Search, BookOpen, Utensils, Cpu, Heart, Plus, Sparkles, Filter, Check, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function BorrowReturnPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [tokenStatus, setTokenStatus] = useState('active'); // 'active' | 'used'
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [disputeMessage, setDisputeMessage] = useState(null);
  const [showLendModal, setShowLendModal] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Study Material');
  const [newItemCondition, setNewItemCondition] = useState('Good');
  const [newItemLoanDays, setNewItemLoanDays] = useState('30');
  const [lendSuccess, setLendSuccess] = useState(false);

  // Rich Community Catalog encompassing Study Material, Family Utensils, Electronics, and Medical
  const [items, setItems] = useState([
    // Study Material
    {
      id: "itm_study_01",
      name: "B.Tech Engineering Mathematics & Mechanics (Sem 1-4) Book Set",
      category: "Study Material",
      condition: "Very Good (Complete set)",
      loanPeriodDays: 90,
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      status: "available",
      icon: "📚"
    },
    {
      id: "itm_study_02",
      name: "Casio fx-991EX ClassWiz Scientific Calculator",
      category: "Study Material",
      condition: "Like New (Solar + Battery)",
      loanPeriodDays: 30,
      ownerPublicName: "Pooja S. (Student Volunteer)",
      ownerArea: "REC Banda",
      status: "available",
      icon: "🔢"
    },
    {
      id: "itm_study_03",
      name: "UPPSC / UP Civil Services GS Notes & Solved Papers",
      category: "Study Material",
      condition: "Good with highlights",
      loanPeriodDays: 60,
      ownerPublicName: "Manoj Tripathi (Reviewer)",
      ownerArea: "Civil Lines, Banda",
      status: "available",
      icon: "📝"
    },
    {
      id: "itm_study_04",
      name: "Engineering Mini-Drafter & Drawing Board Kit",
      category: "Study Material",
      condition: "Calibrated steel clamp",
      loanPeriodDays: 120,
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      status: "available",
      icon: "📐"
    },
    {
      id: "itm_study_05",
      name: "NCERT Class 10 & 12 Science & Math Books Bundle",
      category: "Study Material",
      condition: "Complete 8 books",
      loanPeriodDays: 180,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Baberu",
      status: "available",
      icon: "📖"
    },

    // Family Utensils
    {
      id: "itm_utensil_01",
      name: "Community Event Large Cooking Cauldron (बड़ा पतीला / देग - 50L)",
      category: "Family Utensils",
      condition: "Heavy Aluminum / Sanitized",
      loanPeriodDays: 7,
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "Civil Lines, Banda",
      status: "available",
      icon: "🍲"
    },
    {
      id: "itm_utensil_02",
      name: "50-Person Stainless Steel Thali, Katori & Glass Set",
      category: "Family Utensils",
      condition: "Mirror Polish Stainless Steel",
      loanPeriodDays: 5,
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "Civil Lines, Banda",
      status: "available",
      icon: "🍽️"
    },
    {
      id: "itm_utensil_03",
      name: "Commercial Heavy Cast Iron Kadhai & Puri Strainer (कड़ाही एवं झारा)",
      category: "Family Utensils",
      condition: "Heavy Seasoned Iron",
      loanPeriodDays: 5,
      ownerPublicName: "Banda Community Kitchen",
      ownerArea: "District Hospital Banda",
      status: "available",
      icon: "🍳"
    },
    {
      id: "itm_utensil_04",
      name: "25-Liter Stainless Steel Drinking Water Camper / Dispenser",
      category: "Family Utensils",
      condition: "Insulated Double Wall",
      loanPeriodDays: 14,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Civil Lines, Banda",
      status: "available",
      icon: "🚰"
    },
    {
      id: "itm_utensil_05",
      name: "Traditional Brass Ceremony & Pooja Utensil Set (पीतल सेट)",
      category: "Family Utensils",
      condition: "Pure Brass / Polished",
      loanPeriodDays: 7,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Atarra",
      status: "available",
      icon: "🪔"
    },

    // Electronics & Tools
    {
      id: "itm_elec_01",
      name: "Digital Multimeter & Soldering Station Repair Kit",
      category: "Electronics",
      condition: "Pro Kit with Solder Wire",
      loanPeriodDays: 14,
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      status: "available",
      icon: "⚡"
    },
    {
      id: "itm_elec_02",
      name: "Solar Emergency Lantern with Dual Phone Charging Bank",
      category: "Electronics",
      condition: "Lithium Ferro / 20h light",
      loanPeriodDays: 14,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Baberu",
      status: "available",
      icon: "🔦"
    },
    {
      id: "itm_elec_03",
      name: "Ultrasonic Compressor Nebulizer Machine",
      category: "Electronics",
      condition: "Medical Grade / Sterilized",
      loanPeriodDays: 14,
      ownerPublicName: "Priya Verma (Donor)",
      ownerArea: "District Hospital Banda",
      status: "available",
      icon: "💨"
    },
    {
      id: "itm_elec_04",
      name: "Digital Automatic Blood Pressure Monitor (Omron)",
      category: "Electronics",
      condition: "Accurate & Tested",
      loanPeriodDays: 21,
      ownerPublicName: "Priya Verma (Donor)",
      ownerArea: "District Hospital Banda",
      status: "available",
      icon: "🩺"
    },
    {
      id: "itm_elec_05",
      name: "Portable LED Projector & 80-inch Tripod Screen Set",
      category: "Electronics",
      condition: "Full HD 1080p / HDMI",
      loanPeriodDays: 4,
      ownerPublicName: "REC Banda Maker Club",
      ownerArea: "REC Banda",
      status: "available",
      icon: "📽️"
    },

    // Medical & Mobility
    {
      id: "itm_501",
      name: "Wheelchair, foldable lightweight with hand brakes",
      category: "Medical & Mobility",
      condition: "Excellent / Sanitized",
      loanPeriodDays: 14,
      ownerPublicName: "Seva Sahayata Trust",
      ownerArea: "Civil Lines, Banda",
      status: "borrowed",
      icon: "♿"
    },
    {
      id: "itm_502",
      name: "Walking Crutches (Pair, Adult adjustable aluminum)",
      category: "Medical & Mobility",
      condition: "Like New with rubber grips",
      loanPeriodDays: 21,
      ownerPublicName: "Priya Verma",
      ownerArea: "District Hospital Banda",
      status: "available",
      icon: "🦯"
    }
  ]);

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ownerArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Handover single-use token logic
  const handleSelectItemForQR = (item) => {
    setSelectedItem(item);
    setTokenStatus('active');
    setConfirmSuccess(false);
    setDisputeMessage(null);
  };

  const handleConfirmHandover = () => {
    setTokenStatus('used');
    setConfirmSuccess(true);
    // update status in item list
    setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: 'borrowed' } : i));
  };

  const handleDispute = () => {
    setDisputeMessage("Dispute reported to verifiers desk for mediation. Item marked under review.");
  };

  const handleAddNewItem = (e) => {
    e.preventDefault();
    const newItem = {
      id: `itm_${Date.now()}`,
      name: newItemName,
      category: newItemCategory,
      condition: newItemCondition,
      loanPeriodDays: Number(newItemLoanDays),
      ownerPublicName: user?.publicName || user?.displayName || "Community Member",
      ownerArea: user?.area || "Civil Lines, Banda",
      status: "available",
      icon: newItemCategory === 'Study Material' ? '📚' : newItemCategory === 'Family Utensils' ? '🍲' : newItemCategory === 'Electronics' ? '⚡' : '♿'
    };
    setItems(prev => [newItem, ...prev]);
    setLendSuccess(true);
    setTimeout(() => {
      setLendSuccess(false);
      setShowLendModal(false);
      setNewItemName('');
    }, 1500);
  };

  const qrPayload = selectedItem ? JSON.stringify({
    tokenId: `tok_${selectedItem.id}_${Date.now()}`,
    itemId: selectedItem.id,
    receiverId: user?.uid || "usr_aarav",
    nonce: "sec_8841a",
    timestamp: Date.now()
  }) : "";

  return (
    <div className="pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Header (Full Width) */}
      <div className="bg-darkbrown text-cream p-6 sm:p-8 rounded-3xl shadow-lg border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="px-3 py-1 rounded-full bg-softYellow/20 text-softYellow text-xs font-bold border border-softYellow/30">
              Circular Sharing Economy · REC Banda
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {t('borrowReturnTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 max-w-2xl leading-relaxed">
            {t('borrowSubtitle')} — Borrow and lend calculators, books, utensils, tools, and mobility gear freely with verified single-use QR handover.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowLendModal(true)}
            className="px-5 py-3 rounded-2xl bg-teal hover:bg-teal-hover text-white text-xs sm:text-sm font-extrabold shadow-md transition flex items-center gap-2 tap-target"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{t('btnLendNewItem')}</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-darkbrown/10 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-darkbrown/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchItemsPlaceholder')}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-darkbrown/15 bg-cream/30 text-xs font-semibold text-darkbrown focus:ring-2 focus:ring-terracotta outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-darkbrown/40 hover:text-darkbrown"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-darkbrown/70 font-bold px-1 shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal"></span>
            <span>{filteredItems.length} items available in Banda pool</span>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'all', label: t('catAll'), icon: null },
            { id: 'Study Material', label: t('catStudyMaterial'), icon: BookOpen },
            { id: 'Family Utensils', label: t('catFamilyUtensils'), icon: Utensils },
            { id: 'Electronics', label: t('catElectronics'), icon: Cpu },
            { id: 'Medical & Mobility', label: t('catMedicalMobility'), icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-2 rounded-2xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeCategory === tab.id
                    ? 'bg-darkbrown text-cream shadow-sm'
                    : 'bg-cream/60 text-darkbrown/70 border border-darkbrown/10 hover:border-darkbrown/30'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Grid for Community Catalog Items */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-darkbrown/10 text-center space-y-3">
          <div className="text-4xl">🔍</div>
          <div className="font-extrabold text-base text-darkbrown">No items found matching "{searchQuery}"</div>
          <div className="text-xs text-darkbrown/60 max-w-md mx-auto">
            Try searching for books, utensils, calculators, or tools, or list a new resource for the REC Banda community.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-3xl bg-white border transition shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md ${
                selectedItem?.id === item.id ? 'border-teal ring-2 ring-teal/20 shadow-md' : 'border-darkbrown/10'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cream flex items-center justify-center text-2xl shrink-0 border border-darkbrown/10">
                    {item.icon}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                    item.status === 'available'
                      ? 'bg-teal-light text-teal border border-teal/20'
                      : 'bg-softYellow/50 text-darkbrown border border-softYellow'
                  }`}>
                    {item.status === 'available' ? t('availableToBorrow') : t('currentlyCirculating')}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-darkbrown leading-snug line-clamp-2" title={item.name}>
                    {item.name}
                  </h3>
                  <div className="text-[11px] text-darkbrown/65 mt-1">
                    {t('lentBy')} <strong>{item.ownerPublicName}</strong> · {item.ownerArea}
                  </div>
                </div>

                {/* Specs & Tags */}
                <div className="flex items-center justify-between text-xs bg-cream/50 p-2.5 rounded-2xl">
                  <div className="text-[11px] text-darkbrown/80 truncate mr-1">
                    <span className="font-bold">{t('conditionLabel')}:</span> {item.condition}
                  </div>
                  <div className="text-[11px] font-bold text-teal flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{item.loanPeriodDays}d</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {item.status === 'available' ? (
                  <button
                    onClick={() => handleSelectItemForQR(item)}
                    className="w-full py-2.5 rounded-xl bg-teal hover:bg-teal-hover text-white font-extrabold text-xs shadow-sm transition flex items-center justify-center gap-1.5 tap-target"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{t('btnBorrowThis')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectItemForQR(item)}
                    className="w-full py-2.5 rounded-xl bg-darkbrown/10 hover:bg-darkbrown/20 text-darkbrown font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>View Loan Status & QR</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DYNAMIC SINGLE-USE QR MODAL / DRAWER when item is selected */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbrown/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-darkbrown text-cream p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedItem.icon}</span>
                <div>
                  <h3 className="font-extrabold text-sm leading-tight text-white line-clamp-1">
                    {selectedItem.name}
                  </h3>
                  <div className="text-[10px] text-cream/70">
                    {selectedItem.category} · {selectedItem.ownerPublicName}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full hover:bg-white/10 text-cream/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Body matching Page 4 design screenshot */}
            <div className="p-5 text-center space-y-4 overflow-y-auto">
              <div>
                <div className="font-extrabold text-sm text-darkbrown">
                  {t('showCodePickup')}
                </div>
                <div className="text-xs text-darkbrown/60 mt-0.5">
                  {t('scanCodeExpl')}
                </div>
              </div>

              {/* Dynamic QR Box */}
              <div className="inline-block p-4 rounded-2xl bg-cream border-2 border-darkbrown/10 shadow-inner">
                {tokenStatus === 'active' ? (
                  <QRCodeSVG
                    value={qrPayload}
                    size={170}
                    bgColor="#FAF1E4"
                    fgColor="#2B1B10"
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div className="w-[170px] h-[170px] flex flex-col items-center justify-center text-teal space-y-2">
                    <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                    <span className="font-black text-sm">Handover Confirmed</span>
                    <span className="text-[10px] text-darkbrown/60">Single-use token consumed</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-darkbrown/60 leading-normal">
                {t('qrScreenshotWarning')}
              </div>

              {/* Single-use badge */}
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-softYellow/40 text-darkbrown text-xs font-bold border border-softYellow">
                <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                <span>{t('singleUseBadge')}</span>
              </div>

              {/* Return Reminder Box */}
              <div className="p-3.5 rounded-2xl bg-softYellow/40 border border-softYellow/80 flex items-start gap-2 text-left">
                <Clock className="w-4 h-4 text-darkbrown shrink-0 mt-0.5" />
                <p className="text-xs text-darkbrown font-medium leading-relaxed">
                  <strong>Return reminder:</strong> Due in {selectedItem.loanPeriodDays} days. We will message 2 days before.
                </p>
              </div>

              {/* Confirm / Action Button */}
              {tokenStatus === 'active' ? (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleConfirmHandover}
                    className="w-full py-3.5 rounded-2xl bg-teal hover:bg-teal-hover text-white font-extrabold text-sm shadow-md transition tap-target"
                  >
                    {t('btnConfirmHandover')}
                  </button>
                  <button
                    onClick={handleDispute}
                    className="w-full py-2 rounded-xl text-xs font-bold text-darkbrown/60 hover:text-darkbrown transition"
                  >
                    {t('btnRaiseDispute')}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-3 rounded-2xl bg-darkbrown text-cream font-bold text-sm transition"
                >
                  Done
                </button>
              )}

              {disputeMessage && (
                <div className="p-3 rounded-2xl bg-red-50 text-red-800 text-xs border border-red-200">
                  {disputeMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEND AN ITEM MODAL (Level 2 Verified) */}
      {showLendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbrown/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-cream rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-darkbrown text-cream p-4 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-white">Lend Community Resource</h3>
                <p className="text-[10px] text-cream/70">Books, utensils, electronics, tools & mobility gear</p>
              </div>
              <button
                onClick={() => setShowLendModal(false)}
                className="p-1 rounded-full hover:bg-white/10 text-cream/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="p-5 space-y-3.5 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-darkbrown uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Casio fx-991EX Calculator or Large Patila 50L"
                  className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-darkbrown uppercase mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-semibold outline-none"
                >
                  <option>Study Material</option>
                  <option>Family Utensils</option>
                  <option>Electronics</option>
                  <option>Medical & Mobility</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-darkbrown uppercase mb-1">Condition</label>
                <input
                  type="text"
                  required
                  value={newItemCondition}
                  onChange={(e) => setNewItemCondition(e.target.value)}
                  placeholder="e.g. Excellent / Like New / Sanitized"
                  className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-darkbrown uppercase mb-1">Loan Period (Days)</label>
                <select
                  value={newItemLoanDays}
                  onChange={(e) => setNewItemLoanDays(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-darkbrown/20 bg-white font-semibold outline-none"
                >
                  <option value="5">5 Days (Events / Ceremonies)</option>
                  <option value="7">7 Days (Short Loan)</option>
                  <option value="14">14 Days (Standard)</option>
                  <option value="30">30 Days (Calculators / Exams)</option>
                  <option value="90">90 Days (Semester Textbooks)</option>
                </select>
              </div>

              <div className="p-3 rounded-2xl bg-teal-light text-teal font-medium text-[11px] leading-tight">
                🛡️ Items circulate under verified community handover agreements with return reminders.
              </div>

              {lendSuccess ? (
                <div className="p-3 rounded-2xl bg-teal text-white font-bold text-center">
                  ✓ Item listed in community pool!
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-sm shadow-md transition tap-target"
                >
                  Publish Item to Community Pool
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
