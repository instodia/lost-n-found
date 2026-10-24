import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TypeBadge, StatusBadge, ClaimStatusBadge } from '../common/StatusBadge';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Package,
  FileCheck,
  Search,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Activity,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';

export const AdminDashboardView = ({
  items = [],
  claims = [],
  activityLogs = [],
  onViewItem,
  onDeleteItem,
  onUpdateItem,
  onReviewClaim,
}) => {
  const { currentUser, demoUsers } = useAuth();
  const { addToast } = useToast();

  const [adminTab, setAdminTab] = useState('listings'); // 'listings' | 'claims' | 'users' | 'activity'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterFlagged, setFilterFlagged] = useState('ALL');

  // Stats
  const totalListings = items.length;
  const flaggedCount = items.filter((i) => i.flagged).length;
  const pendingClaims = claims.filter((c) => c.status === 'PENDING').length;
  const resolvedCount = items.filter((i) => i.status === 'RESOLVED').length;

  // Filter listings
  const filteredListings = items.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.reporterName.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterType !== 'ALL' && item.type !== filterType) return false;
    if (filterFlagged === 'FLAGGED' && !item.flagged) return false;
    return true;
  });

  const toggleFlagItem = (item) => {
    const newFlagged = !item.flagged;
    onUpdateItem(item.id, { flagged: newFlagged });
    addToast({
      title: newFlagged ? 'Item Flagged for Moderation' : 'Flag Cleared',
      message: `"${item.title}" status updated`,
      type: newFlagged ? 'warning' : 'success',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-navy-900 text-white border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">
                Admin Moderation & Security Center
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-900 uppercase">
                {currentUser?.name || 'Administrator Active'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Supervise platform listings, investigate suspicious ownership claims, and maintain trust.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-950/80 border border-slate-800 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            RLS Security Policies Enforced
          </span>
        </div>
      </div>

      {/* Admin Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Listings</span>
            <Package className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalListings}</div>
          <span className="text-[11px] text-slate-400">{resolvedCount} returned to owners</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Pending Claims</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500">{pendingClaims}</div>
          <span className="text-[11px] text-slate-400">Awaiting finder verification</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Moderation Flags</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-500">{flaggedCount}</div>
          <span className="text-[11px] text-slate-400">Suspicious items flagged</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Registered Personas</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {demoUsers.length}
          </div>
          <span className="text-[11px] text-slate-400">Community & Staff</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setAdminTab('listings')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
            adminTab === 'listings'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Manage Listings ({items.length})
        </button>

        <button
          onClick={() => setAdminTab('claims')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
            adminTab === 'claims'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Claims Moderation ({claims.length})
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
            adminTab === 'users'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          User Management ({demoUsers.length})
        </button>

        <button
          onClick={() => setAdminTab('activity')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
            adminTab === 'activity'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Audit Activity Logs ({activityLogs.length})
        </button>
      </div>

      {/* TAB 1: LISTINGS MODERATION */}
      {adminTab === 'listings' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search listings by title, reporter, or location..."
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800"
              >
                <option value="ALL">All Types</option>
                <option value="LOST">Lost Items</option>
                <option value="FOUND">Found Items</option>
              </select>

              <select
                value={filterFlagged}
                onChange={(e) => setFilterFlagged(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800"
              >
                <option value="ALL">All Moderation States</option>
                <option value="FLAGGED">Flagged / Suspicious Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-navy-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Type & Category</th>
                    <th className="py-3.5 px-4">Reporter</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Secret Clue On File</th>
                    <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredListings.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-navy-800/50 transition-colors ${
                        item.flagged ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=100'}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <span
                              onClick={() => onViewItem(item.id)}
                              className="font-bold text-slate-900 dark:text-white hover:text-brand-500 cursor-pointer block truncate max-w-[180px]"
                            >
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block max-w-[180px]">
                              {item.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <TypeBadge type={item.type} />
                          <span className="block text-[11px] text-slate-400 capitalize">
                            {item.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {item.reporterName}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.reporterEmail}</span>
                      </td>

                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="py-3 px-4">
                        {item.secretDetails ? (
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                            title={item.secretDetails}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Yes (Encrypted)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleFlagItem(item)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                              item.flagged
                                ? 'bg-rose-500 text-white border-rose-600'
                                : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-transparent'
                            }`}
                            title={item.flagged ? 'Clear flag' : 'Flag suspicious listing'}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onViewItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-navy-800"
                            title="View listing"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete listing (Admin)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLAIMS MODERATION */}
      {adminTab === 'claims' && (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <ClaimStatusBadge status={claim.status} />
                  <span className="text-xs text-slate-400">ID: {claim.id}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Target Item: {claim.itemTitle}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Claimant Profile
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {claim.claimantName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {claim.claimantEmail} • {claim.claimantPhone || 'No phone'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Submitted Ownership Evidence
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {claim.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onViewItem(claim.itemId)}
                  className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Inspect Item Page
                </button>

                {claim.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onReviewClaim(claim.id, 'REJECTED', 'Moderator rejected due to insufficient ownership proof.')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Reject (Admin)
                    </button>
                    <button
                      onClick={() => onReviewClaim(claim.id, 'APPROVED', 'Moderator verified identity and proof.')}
                      className="px-4 py-1.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500"
                    >
                      Override Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoUsers.map((user) => (
            <div
              key={user.id}
              className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center text-center"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-brand-500/20 mb-3"
              />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{user.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              <span
                className={`mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  user.role === 'admin'
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                }`}
              >
                ROLE: {user.role.toUpperCase()}
              </span>

              <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Login ID:</span>
                  <span className="font-mono font-bold text-brand-600">{user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-semibold text-emerald-500">Verified System User</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT ACTIVITY LOGS */}
      {adminTab === 'activity' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-500" />
            System Audit Trail
          </h3>

          <div className="space-y-3">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{log.text}</span>
                </div>
                <span className="text-slate-400 text-[11px] font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
