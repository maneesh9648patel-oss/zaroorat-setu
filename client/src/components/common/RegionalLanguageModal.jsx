import React, { useState, useMemo } from 'react';
import { X, Check, Globe, Search, MapPin, Sparkles, Volume2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function RegionalLanguageModal() {
  const { 
    language, 
    selectLanguage, 
    currentDialect, 
    allIndiaStates, 
    indiaZones, 
    isLangModalOpen, 
    setIsLangModalOpen, 
    t 
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');

  // Filter states and regional dialects based on zone and search query
  const filteredStates = useMemo(() => {
    return allIndiaStates
      .filter(state => {
        if (selectedZone !== 'all' && state.zone !== selectedZone) {
          return false;
        }
        return true;
      })
      .map(state => {
        if (!searchQuery.trim()) return state;
        const query = searchQuery.toLowerCase();
        const matchesStateName = state.name.toLowerCase().includes(query);
        const matchingLanguages = state.languages.filter(l => 
          l.name.toLowerCase().includes(query) || 
          l.native.toLowerCase().includes(query) ||
          l.dialect.toLowerCase().includes(query)
        );
        if (matchesStateName) return state;
        if (matchingLanguages.length > 0) {
          return { ...state, languages: matchingLanguages };
        }
        return null;
      })
      .filter(Boolean);
  }, [allIndiaStates, selectedZone, searchQuery]);

  if (!isLangModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-darkbrown/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-cream rounded-3xl shadow-2xl border border-darkbrown/15 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-darkbrown text-cream p-5 flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal text-white flex items-center justify-center shadow-inner shrink-0">
              <Globe className="w-5 h-5 text-softYellow" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-white leading-tight flex items-center gap-2">
                <span>अखिल भारतीय राज्य व क्षेत्रीय भाषाएं</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-softYellow/20 text-softYellow text-[10px] font-extrabold border border-softYellow/30">
                  Pan-India Languages
                </span>
              </h2>
              <p className="text-xs text-cream/70 mt-0.5">
                भारत के 28 राज्य व केंद्र शासित प्रदेश तथा उनकी स्थानीय बोलियां (Local Dialects)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLangModalOpen(false)}
            className="p-2 rounded-2xl hover:bg-white/10 text-cream/70 hover:text-white transition shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Zone Filter Bar */}
        <div className="p-4 bg-white border-b border-darkbrown/10 space-y-3 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-darkbrown/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="राज्य या बोली का नाम खोजें (उदा. बुंदेली, भोजपुरी, मारवाड़ी, मराठी, गुजराती, तमिल, पंजाब)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-darkbrown/15 bg-cream/30 text-xs sm:text-sm font-semibold text-darkbrown outline-none focus:ring-2 focus:ring-terracotta transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-darkbrown/40 hover:text-darkbrown"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Geographic Zone Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {indiaZones.map((zone) => (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition text-xs ${
                  selectedZone === zone.id
                    ? 'bg-darkbrown text-cream shadow-sm'
                    : 'bg-cream/60 text-darkbrown/70 hover:bg-cream-dark'
                }`}
              >
                {zone.label}
              </button>
            ))}
          </div>
        </div>

        {/* State-wise Dialects Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-cream/40">
          {filteredStates.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-white rounded-3xl border border-darkbrown/10">
              <div className="text-3xl">🔍</div>
              <div className="font-extrabold text-sm text-darkbrown">कोई भाषा नहीं मिली</div>
              <div className="text-xs text-darkbrown/60">
                कृपया राज्य का नाम (जैसे UP, Bihar, Maharashtra, Gujarat) या बोली खोजें।
              </div>
            </div>
          ) : (
            filteredStates.map((state) => (
              <div 
                key={state.id}
                className="bg-white p-4 sm:p-5 rounded-3xl border border-darkbrown/10 shadow-xs space-y-3"
              >
                {/* State Title */}
                <div className="flex items-center justify-between border-b border-darkbrown/5 pb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                    <h3 className="font-black text-sm text-darkbrown">
                      {state.name}
                    </h3>
                  </div>
                  {state.pilotBadge && (
                    <span className="px-2.5 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-black uppercase tracking-wider">
                      {state.pilotBadge} (REC Banda)
                    </span>
                  )}
                </div>

                {/* Dialect Badges Grid under this State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {state.languages.map((dial) => {
                    const isSelected = language === dial.code;
                    return (
                      <button
                        key={dial.code}
                        onClick={() => selectLanguage(dial.code)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition group ${
                          isSelected
                            ? 'bg-teal-light border-teal text-teal shadow-xs ring-2 ring-teal/20 font-black'
                            : 'bg-cream/30 border-darkbrown/10 hover:border-darkbrown/30 hover:bg-white text-darkbrown font-semibold'
                        }`}
                      >
                        <div className="pr-2">
                          <div className="text-xs font-black flex items-center gap-1.5">
                            <span>{dial.name}</span>
                            {dial.isPilot && (
                              <span className="px-1.5 py-0.2 rounded bg-terracotta/20 text-terracotta text-[9px] font-bold">
                                Pilot
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-darkbrown/60 mt-0.5 flex items-center gap-1">
                            <span>Speech: {dial.speechLang}</span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-darkbrown/20 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition">
                            <span className="w-2 h-2 rounded-full bg-terracotta" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer Active Indicator */}
        <div className="p-4 bg-white border-t border-darkbrown/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
            <span className="font-bold text-darkbrown">
              सक्रिय भाषा: <strong className="text-teal">{currentDialect?.name || 'बुंदेली'}</strong>
            </span>
            <span className="text-darkbrown/50">({currentDialect?.stateShortName})</span>
          </div>

          <button
            onClick={() => setIsLangModalOpen(false)}
            className="py-2.5 px-6 rounded-2xl bg-darkbrown text-cream font-black hover:bg-darkbrown-hover transition text-center"
          >
            लागू करें (Confirm) &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
