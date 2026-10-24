import React from 'react';
import { Radar, ShieldCheck, HeartHandshake, Lock, RefreshCw, ExternalLink } from 'lucide-react';
import { resetToDemoData } from '../../services/storage';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-navy-950 transition-colors">
      {/* Trust & Guarantee Banner */}
      <div className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-navy-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-brand-400 border border-indigo-200/50 dark:border-indigo-800/50 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Anti-Fraud Protection</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Secret identifying details are locked and only verified owners with matching proof can claim items.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Zero Public Personal Info</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Phone numbers, addresses, and full identities stay masked from public view to prevent spam and scams.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/50 flex-shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Smart Heuristic AI Match</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Automatic cross-referencing between reported lost items and newly found items across campus and city zones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Radar className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                Find<span className="text-brand-500">It</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              The modern, trustworthy lost & found community portal connecting honest finders with rightful owners.
            </p>
            <button
              onClick={resetToDemoData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restore Default Listings
            </button>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Platform
            </h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('browse')} className="hover:text-brand-500 transition-colors">
                  Browse All Items
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('report')} className="hover:text-brand-500 transition-colors">
                  Report a Lost Item
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('report')} className="hover:text-brand-500 transition-colors">
                  Report a Found Item
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-brand-500 transition-colors">
                  My Claims & Listings
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Popular Categories
            </h5>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li>Smartphones & Electronics</li>
              <li>Passports & Student IDs</li>
              <li>Wallets & Purses</li>
              <li>Keys & Car Remotes</li>
              <li>Pets & Missing Animals</li>
            </ul>
          </div>

          {/* Safety & Guidelines */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Safety & Verification
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Always meet in designated public safety drop-off locations (e.g. campus security desk, station manager booth) for handovers.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400">
              <span>Verified Safe Exchange Program</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} FindIt Portal Inc. Built with React & Tailwind CSS.</p>
          <div className="flex items-center gap-4 mt-3 sm:mt-0">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
