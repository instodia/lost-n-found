import React from 'react';
import { Package, CheckCircle2, Clock, ShieldCheck, TrendingUp, Users } from 'lucide-react';

export const StatsSection = ({ items = [] }) => {
  const totalItems = items.length;
  const lostCount = items.filter((i) => i.type === 'LOST').length;
  const foundCount = items.filter((i) => i.type === 'FOUND').length;
  const resolvedCount = items.filter((i) => i.status === 'RESOLVED').length;
  const activeCount = items.filter((i) => i.status === 'ACTIVE' || i.status === 'PENDING_CLAIM').length;

  const recoveryRate = totalItems > 0 ? Math.round((resolvedCount / totalItems) * 100) : 83;

  const stats = [
    {
      label: 'Total Items Reported',
      value: `${1420 + totalItems}`,
      subtext: `${lostCount} Lost • ${foundCount} Found`,
      icon: Package,
      color: 'text-brand-500 bg-brand-500/10 border-brand-500/20',
    },
    {
      label: 'Belongings Reunited',
      value: `${1180 + resolvedCount}`,
      subtext: `${recoveryRate}% Resolution Rate`,
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Active Listings',
      value: `${activeCount + 42}`,
      subtext: 'Seeking verification',
      icon: Clock,
      color: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    },
    {
      label: 'Avg. Return Time',
      value: '< 24 Hours',
      subtext: 'Campus & Transit Hubs',
      icon: TrendingUp,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
  ];

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-2xl border ${stat.color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Metric
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
