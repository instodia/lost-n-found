import React from 'react';
import { TypeBadge, StatusBadge } from './StatusBadge';
import { CategoryIcon } from './CategoryIcon';
import { CATEGORIES } from '../../types';
import { MapPin, Calendar, Sparkles, ArrowRight, Award, ShieldCheck } from 'lucide-react';

export const ItemCard = ({ item, onViewDetails, matchCount = 0 }) => {
  const categoryObj = CATEGORIES.find((c) => c.id === item.category) || { name: item.category };
  const mainImage = item.images && item.images.length > 0
    ? item.images[0]
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80';

  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={() => onViewDetails(item.id)}
      className="group relative flex flex-col rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-navy-900/90 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-950/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-navy-950">
        <img
          src={mainImage}
          alt={item.title}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80';
          }}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
        </div>

        {/* Possible Smart Match Pill */}
        {matchCount > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 animate-pulse-subtle">
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
              {matchCount} Possible {matchCount === 1 ? 'Match' : 'Matches'}
            </span>
          </div>
        )}

        {/* Reward Pill */}
        {item.reward && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white shadow-md">
              <Award className="w-3.5 h-3.5" />
              {item.reward}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category & Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 font-medium">
            <CategoryIcon categoryId={item.category} className="w-3.5 h-3.5 text-brand-500" />
            {categoryObj.name}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-500 transition-colors">
          {item.title}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 mb-3 leading-relaxed">
          {item.description}
        </p>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-4 mt-auto">
          <MapPin className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        {/* Action footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Anti-Fraud Verified
          </span>
          <span className="font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            View Details
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
