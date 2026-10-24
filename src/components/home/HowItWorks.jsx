import React from 'react';
import { PlusCircle, Cpu, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorks = ({ onReportClick }) => {
  const steps = [
    {
      step: '01',
      title: 'Report Your Item',
      description:
        'Submit key details, photos, and location. Include secret identifying clues (e.g. engravings, wallpaper) locked safely for verification.',
      icon: PlusCircle,
      gradient: 'from-brand-500 to-indigo-600',
    },
    {
      step: '02',
      title: 'Smart Heuristic AI Match',
      description:
        'Our engine cross-checks descriptions, categories, time windows, and landmarks to alert reporters of potential matches automatically.',
      icon: Cpu,
      gradient: 'from-indigo-600 to-sky-500',
    },
    {
      step: '03',
      title: 'Verified Ownership Claim',
      description:
        'The claimant submits proof matching the confidential details. Once the finder or admin approves, arrange a safe handover at a verified hub.',
      icon: ShieldCheck,
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-navy-900/30 border-y border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Trust & Security First
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            How FindIt Safely Reunites Belongings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Engineered to eliminate false claims, keep personal contact private, and speed up recoveries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.gradient} text-white flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-1">
                  {item.description}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2 text-xs font-medium text-brand-600 dark:text-brand-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Guaranteed safe workflow</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action banner */}
        <div className="mt-12 p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-sky-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-brand-500/20">
          <div>
            <h3 className="text-lg font-bold">Have you found an abandoned item today?</h3>
            <p className="text-xs text-indigo-100 mt-1 max-w-xl">
              Be an everyday hero. Report it in 60 seconds and give someone their peace of mind back.
            </p>
          </div>
          <button
            onClick={() => onReportClick('FOUND')}
            className="whitespace-nowrap px-6 py-3 rounded-xl font-bold text-xs bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            Report Found Item Now
          </button>
        </div>
      </div>
    </section>
  );
};
