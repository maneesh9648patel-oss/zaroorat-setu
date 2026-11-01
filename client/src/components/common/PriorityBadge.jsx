import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PriorityBadge({ urgency, size = "md" }) {
  const { t } = useLanguage();

  if (urgency === 'Urgent') {
    return (
      <span className={`inline-flex items-center font-extrabold rounded-full bg-terracotta text-white shadow-sm ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}>
        {t('priorityUrgent')}
      </span>
    );
  }

  if (urgency === 'High') {
    return (
      <span className={`inline-flex items-center font-extrabold rounded-full bg-softYellow text-darkbrown border border-darkbrown/10 ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}>
        {t('priorityHigh')}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-bold rounded-full bg-teal-light text-teal border border-teal/20 ${
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
    }`}>
      {t('priorityNormal')}
    </span>
  );
}
