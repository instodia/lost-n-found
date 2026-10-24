import React from 'react';
import { TypeBadge, StatusBadge } from '../common/StatusBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { CATEGORIES } from '../../types';
import {
  X,
  Sparkles,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const SmartMatchModal = ({ isOpen, onClose, targetItem, match, onClaimCandidate, onViewCandidate }) => {
  if (!isOpen || !match || !targetItem) return null;

  const candidate = match.candidate;
  const targetCategory = CATEGORIES.find((c) => c.id === targetItem.category)?.name || targetItem.category;
  const candidateCategory = CATEGORIES.find((c) => c.id === candidate.category)?.name || candidate.category;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 p-6 sm:p-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-1/4 -mt-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-sm mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              Smart Match Heuristic Comparison
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Potential Match Detected
            </h2>
          </div>

          {/* Match Score Meter */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Confidence Score</span>
              <span className="text-xl font-black text-amber-500">{match.score}% Match</span>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-amber-500 flex items-center justify-center font-bold text-xs text-amber-500">
              {match.score}%
            </div>
          </div>
        </div>

        {/* Warning banner */}
        <div className="mb-6 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-500" />
          <span>
            <strong>Human Verification Required:</strong> This comparison is algorithmic. Ownership must
            be confirmed by reviewing secret proof details.
          </span>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Target Item Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Item
              </span>
              <TypeBadge type={targetItem.type} />
            </div>

            <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-navy-900 mb-3">
              <img
                src={targetItem.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'}
                alt={targetItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {targetItem.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-3">
              {targetItem.description}
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-auto pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <CategoryIcon categoryId={targetItem.category} className="w-3.5 h-3.5 text-brand-500" />
                <span>{targetCategory}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                <span>{targetItem.date}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span className="truncate">{targetItem.location}</span>
              </div>
            </div>
          </div>

          {/* Candidate Matched Card */}
          <div className="p-4 rounded-2xl bg-brand-50/40 dark:bg-brand-950/30 border-2 border-brand-500/40 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Matched Listing
              </span>
              <TypeBadge type={candidate.type} />
            </div>

            <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-navy-900 mb-3">
              <img
                src={candidate.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'}
                alt={candidate.title}
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
              {candidate.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-3">
              {candidate.description}
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mt-auto pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <CategoryIcon categoryId={candidate.category} className="w-3.5 h-3.5 text-brand-500" />
                <span>{candidateCategory}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-500" />
                <span>{candidate.date}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                <span className="truncate">{candidate.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why this matched explanation list */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Algorithmic Matching Factors:
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            {match.factors.map((factor, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              onViewCandidate(candidate.id);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Matched Listing Page
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onClose();
                onClaimCandidate(candidate);
              }}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit Claim for This Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
