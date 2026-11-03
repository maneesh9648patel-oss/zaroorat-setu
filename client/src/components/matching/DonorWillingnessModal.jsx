import React, { useState } from 'react';
import { X, Heart, Clock, CheckCircle2, ShieldCheck, AlertCircle, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function DonorWillingnessModal({ isOpen, onClose, onUpdated }) {
  const { user } = useAuth();

  const [willingnessStatus, setWillingnessStatus] = useState(user?.willingnessStatus || 'available_willing');
  const [estimatedResponseMinutes, setEstimatedResponseMinutes] = useState(user?.estimatedResponseMinutes || 15);
  const [availableHours, setAvailableHours] = useState(user?.availableHours || '24x7 Emergency Help');
  const [specialties, setSpecialties] = useState(user?.specialties || ['Medical', 'Items']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const categories = ['Medical', 'Blood', 'Items', 'Study Material', 'Electronics', 'Family Utensils', 'Emergency Support'];

  const toggleSpecialty = (cat) => {
    setSpecialties(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.matching.updateDonorWillingness({
        willingnessStatus,
        estimatedResponseMinutes: Number(estimatedResponseMinutes),
        availableHours,
        specialties
      });

      if (res.success) {
        setSuccessMsg(res.message || "Donor readiness settings updated!");
        if (onUpdated) onUpdated(res.user);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error(res.error || "Update failed");
      }
    } catch (err) {
      console.error("Failed to update donor willingness:", err);
      setErrorMsg(err.message || "Failed to update settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbrown/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-darkbrown to-darkbrown/90 text-cream p-6 border-b border-white/10 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-xs font-bold text-softYellow mb-1">
            <Heart className="w-4 h-4 text-terracotta fill-terracotta" />
            <span>Donor Readiness & Willingness Settings</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            दाता तत्परता एवं उपलब्धता (Readiness)
          </h2>
          <p className="text-xs text-cream/75 mt-1">
            Configure how the AI Matching Engine routes community needs to you.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Willingness Status Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-darkbrown/70 block">
              1. Availability Status (वर्तमान उपलब्धता)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'available_willing', label: 'Available and willing', hi: 'तैयार और उपलब्ध (Recommended)', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                { id: 'needs_confirmation', label: 'Needs confirmation', hi: 'पुष्टि की आवश्यकता', color: 'border-blue-500 bg-blue-50 text-blue-900' },
                { id: 'temporarily_unavailable', label: 'Temporarily busy', hi: 'अस्थायी रूप से व्यस्त', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                { id: 'not_interested', label: 'Not interested', hi: 'रुचि नहीं (Opt-out)', color: 'border-gray-400 bg-gray-50 text-gray-700' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setWillingnessStatus(opt.id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    willingnessStatus === opt.id
                      ? `${opt.color} ring-2 ring-darkbrown/20 font-black`
                      : 'border-darkbrown/10 hover:border-darkbrown/30 bg-cream/30 text-darkbrown'
                  }`}
                >
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] text-darkbrown/60 mt-0.5">{opt.hi}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Response Time & Available Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-darkbrown/70 block">
                Estimated Response (प्रतिक्रिया)
              </label>
              <select
                value={estimatedResponseMinutes}
                onChange={e => setEstimatedResponseMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-darkbrown/15 bg-cream/30 text-darkbrown text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal"
              >
                <option value={10}>10 Minutes (Instant Emergency)</option>
                <option value={15}>15 Minutes (Rapid Dispatch)</option>
                <option value={30}>30 Minutes (Prompt)</option>
                <option value={60}>1 Hour (Standard)</option>
                <option value={180}>3 Hours (Same Day)</option>
                <option value={1440}>Within 24 Hours</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-darkbrown/70 block">
                Operating Hours (कार्य समय)
              </label>
              <input
                type="text"
                value={availableHours}
                onChange={e => setAvailableHours(e.target.value)}
                placeholder="e.g. 24x7 Emergency / 9am - 8pm"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-darkbrown/15 bg-cream/30 text-darkbrown text-xs font-bold focus:outline-none focus:ring-2 focus:ring-teal"
              />
            </div>
          </div>

          {/* Specialties Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-darkbrown/70 block">
              Specialized Help Categories (विशेषज्ञता)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => {
                const selected = specialties.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleSpecialty(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                      selected
                        ? 'bg-teal text-white border-teal shadow-sm'
                        : 'bg-cream/40 text-darkbrown/70 border-darkbrown/10 hover:border-darkbrown/30'
                    }`}
                  >
                    {selected ? '✓ ' : '+ '}{cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-darkbrown/20 text-xs font-bold text-darkbrown hover:bg-cream transition"
            >
              रद्द करें (Cancel)
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-teal hover:bg-teal-dark text-white text-xs font-black shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'सेव हो रहा है...' : 'सेटिंग्स सेव करें (Save Readiness)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
