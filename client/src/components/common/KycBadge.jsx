import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function KycBadge({ level, status, size = "sm" }) {
  const { t } = useLanguage();

  if (level === 'level_3' || status === 'fully_verified_ngo') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-teal-light text-teal border border-teal/20 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        <Building2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        {t('badgeNgoVerified')}
      </span>
    );
  }

  if (level === 'level_2') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-teal-light text-teal border border-teal/20 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        {t('badgeIdVerified')}
      </span>
    );
  }

  // Level 1: Phone + Email OTP -> Strictly "Basic verified", NEVER "Complete KYC"
  if (level === 'level_1' || status === 'basic_verified') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-softYellow/40 text-darkbrown border border-softYellow ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        <CheckCircle2 className={`text-teal ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
        {t('badgeBasicVerified')}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-gray-100 text-gray-600 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      Unverified
    </span>
  );
}
