import React, { useState, useMemo } from 'react';
import { CATEGORIES } from '../../types';
import { ItemCard } from '../common/ItemCard';
import { EmptyState } from '../common/EmptyState';
import { findSmartMatches } from '../../services/smartMatcher';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  Calendar,
  MapPin,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';

export const BrowseItemsView = ({
  items = [],
  initialFilter = {},
  onViewDetails,
  onReportClick,
  onOpenMap,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialFilter.keyword || '');
  const [selectedType, setSelectedType] = useState(initialFilter.type || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState(initialFilter.category || '');
  const [selectedStatus, setSelectedStatus] = useState(initialFilter.status || 'ALL');
  const [selectedLocation, setSelectedLocation] = useState(initialFilter.location || '');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search term (title, description, location, city, category)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase().trim();
          const combined = `${item.title || ''} ${item.description || ''} ${item.location || ''} ${item.city || ''} ${item.category || ''}`.toLowerCase();
          if (!combined.includes(term)) {
            const words = term.split(/\s+/).filter(Boolean);
            const allWordsPresent = words.length > 0 && words.every((w) => combined.includes(w));
            if (!allWordsPresent) return false;
          }
        }

        // Type filter
        if (selectedType !== 'ALL' && item.type !== selectedType) return false;

        // Category filter
        if (selectedCategory && item.category !== selectedCategory) return false;

        // Status filter
        if (selectedStatus === 'ACTIVE' && item.status !== 'ACTIVE' && item.status !== 'PENDING_CLAIM') return false;
        if (selectedStatus === 'RESOLVED' && item.status !== 'RESOLVED') return false;

        // Location filter
        if (selectedLocation.trim()) {
          const locTerm = selectedLocation.toLowerCase();
          if (!item.location.toLowerCase().includes(locTerm) && !(item.city || '').toLowerCase().includes(locTerm)) {
            return false;
          }
        }

        // Date filter
        if (dateFilter !== 'ALL') {
          const itemDate = new Date(item.date).getTime();
          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;
          if (dateFilter === 'TODAY' && now - itemDate > oneDay) return false;
          if (dateFilter === 'WEEK' && now - itemDate > 7 * oneDay) return false;
          if (dateFilter === 'MONTH' && now - itemDate > 30 * oneDay) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
        if (sortBy === 'oldest') return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [items, searchTerm, selectedType, selectedCategory, selectedStatus, selectedLocation, dateFilter, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedCategory('');
    setSelectedStatus('ALL');
    setSelectedLocation('');
    setDateFilter('ALL');
    setSortBy('newest');
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedType !== 'ALL' ||
    Boolean(selectedCategory) ||
    selectedStatus !== 'ALL' ||
    Boolean(selectedLocation) ||
    dateFilter !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Browse Lost & Found Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search verified community listings, apply smart filters, and reunite with your belongings.
          </p>
        </div>

        {/* Quick Report CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onReportClick('LOST')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm"
          >
            + Report Lost
          </button>
          <button
            onClick={() => onReportClick('FOUND')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
          >
            + Report Found
          </button>
        </div>
      </div>

      {/* Main Search & Quick Controls Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, model, serial, or landmark..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Segment Control */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'ALL'
                  ? 'bg-white dark:bg-navy-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setSelectedType('LOST')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'LOST'
                  ? 'bg-white dark:bg-navy-800 text-rose-600 dark:text-rose-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setSelectedType('FOUND')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedType === 'FOUND'
                  ? 'bg-white dark:bg-navy-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Toggle Mobile Filters */}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-navy-950"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-500" />
            {showFiltersMobile ? 'Hide Filters' : 'Show Advanced Filters'}
          </button>
        </div>

        {/* Extended Filters Bar */}
        <div
          className={`mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 ${
            showFiltersMobile ? 'block' : 'hidden md:grid'
          }`}
        >
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location / Campus */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Location / Landmark
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                placeholder="e.g. Library, Metro, Park"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Reported Date
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">Anytime</option>
              <option value="TODAY">Today (Last 24h)</option>
              <option value="WEEK">Past 7 Days</option>
              <option value="MONTH">Past 30 Days</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Listing Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Listings Only</option>
              <option value="RESOLVED">Returned / Recovered</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips & Reset */}
        {hasActiveFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-medium">Active Filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Keyword: "{searchTerm}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm('')} />
              </span>
            )}
            {selectedType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Type: {selectedType}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType('ALL')} />
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Category: {CATEGORIES.find((c) => c.id === selectedCategory)?.name || selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
              </span>
            )}
            {selectedLocation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Location: {selectedLocation}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLocation('')} />
              </span>
            )}
            {dateFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
                Date: {dateFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setDateFilter('ALL')} />
              </span>
            )}
            <button
              onClick={resetFilters}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold inline-flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Sorting & Results Count Bar */}
      <div className="flex items-center justify-between mb-6 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredItems.length}</span>{' '}
          {filteredItems.length === 1 ? 'item' : 'items'}
        </div>

        <div className="flex items-center gap-3">
          {/* Sorting */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-200 text-xs border border-slate-200 dark:border-slate-800 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>

          {/* GPS Radar Switch Button */}
          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>🗺️ GPS Radar</span>
            </button>
          )}

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center p-1 rounded-lg bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-navy-800 text-brand-500 shadow-sm' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-navy-800 text-brand-500 shadow-sm' : 'text-slate-400'}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Items Results */}
      {filteredItems.length > 0 ? (
        <div
          className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}
        >
          {filteredItems.map((item) => {
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
      ) : (
        <EmptyState
          title="No items matched your filters"
          description="Try broadening your search keywords, clearing your location or category filters, or report a new lost/found item."
          actionLabel="Report Lost Item"
          onAction={() => onReportClick('LOST')}
          secondaryActionLabel="Reset Filters"
          onSecondaryAction={resetFilters}
        />
      )}
    </div>
  );
};
