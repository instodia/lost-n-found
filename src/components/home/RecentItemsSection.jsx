import React, { useState } from 'react';
import { ItemCard } from '../common/ItemCard';
import { findSmartMatches } from '../../services/smartMatcher';
import { ArrowRight, Sparkles, Filter } from 'lucide-react';

export const RecentItemsSection = ({ items = [], onViewDetails, onExploreAll }) => {
  const [filterType, setFilterType] = useState('ALL');

  const filteredItems = items.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  const displayItems = filteredItems.slice(0, 6);

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Activity Stream
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Recently Reported Items
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Check latest belongings reported lost or turned in by honest community members
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Items ({items.length})
            </button>
            <button
              onClick={() => setFilterType('LOST')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'LOST'
                  ? 'bg-white dark:bg-navy-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Lost Only ({items.filter((i) => i.type === 'LOST').length})
            </button>
            <button
              onClick={() => setFilterType('FOUND')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'FOUND'
                  ? 'bg-white dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Found Only ({items.filter((i) => i.type === 'FOUND').length})
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => {
            const matches = findSmartMatches(item, items);
            return (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={onViewDetails}
                matchCount={matches.length}
              />
            );
          })}
        </div>

        {/* View all button */}
        <div className="mt-10 text-center">
          <button
            onClick={onExploreAll}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-slate-800 dark:text-white bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Browse Complete Directory ({items.length} Items)</span>
            <ArrowRight className="w-4 h-4 text-brand-500" />
          </button>
        </div>
      </div>
    </section>
  );
};
