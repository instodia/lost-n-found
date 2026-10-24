import React from 'react';
import { CATEGORIES } from '../../types';
import { CategoryIcon } from '../common/CategoryIcon';
import { ArrowUpRight } from 'lucide-react';

export const CategoryGrid = ({ items = [], onSelectCategory }) => {
  const getItemCountForCategory = (catId) => {
    return items.filter((item) => item.category === catId).length;
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore by Category
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Quickly filter reports by item type and classification
            </p>
          </div>
          <button
            onClick={() => onSelectCategory('')}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline mt-2 sm:mt-0 flex items-center gap-1"
          >
            View all categories
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const count = getItemCountForCategory(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="group p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-950 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-colors shadow-sm">
                    <CategoryIcon categoryId={cat.id} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-brand-500 transition-colors">
                    {count} {count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-500 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {cat.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
