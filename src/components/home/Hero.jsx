import React, { useState } from 'react';
import { CATEGORIES } from '../../types';
import {
  Search,
  PlusCircle,
  CheckCircle2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Radar,
  ArrowRight,
} from 'lucide-react';

export const Hero = ({ onReportClick, onSearchSubmit }) => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearchSubmit({ keyword, category, location });
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/15 via-indigo-500/10 to-sky-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            <span>Smart Heuristic Match Engine • Over 1,180 Items Reunited</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Lost Something? <br />
            <span className="bg-gradient-to-r from-brand-500 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              Found Someone's Belonging?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-5 leading-relaxed max-w-2xl mx-auto">
            FindIt connects honest finders and rightful owners through secure, anti-fraud verification,
            instant AI matching, and safe campus & city handover hubs.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onReportClick('LOST')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-rose-500 via-rose-600 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 shadow-lg shadow-rose-500/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <Search className="w-5 h-5" />
              Report Lost Item
            </button>

            <button
              onClick={() => onReportClick('FOUND')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Report Found Item
            </button>
          </div>
        </div>

        {/* Hero Interactive Search Bar */}
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={handleSearch}
            className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-navy-900/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Keyword input */}
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="What was lost or found? (e.g. iPhone, Wallet, Keys)"
                  className="w-full pl-10 pr-3 py-3 rounded-2xl bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Category dropdown */}
              <div className="sm:col-span-3">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location input */}
              <div className="sm:col-span-2 relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / Area"
                  className="w-full pl-9 pr-2 py-3 rounded-2xl bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm border border-slate-200/80 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Submit button */}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/25"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Quick tags */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-400">Frequent searches:</span>
            {['iPhone 15', 'Bellroy Wallet', 'Car Keys', 'North Face Backpack', 'Puppy', 'Student ID'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSearchSubmit({ keyword: tag })}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-900 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
