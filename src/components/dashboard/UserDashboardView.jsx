import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { TypeBadge, StatusBadge, ClaimStatusBadge } from '../common/StatusBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { EmptyState } from '../common/EmptyState';
import { findMatchesForUserReports } from '../../services/smartMatcher';
import {
  Package,
  FileCheck,
  Clock,
  Sparkles,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  PlusCircle,
  ShieldCheck,
  Eye,
  AlertTriangle,
  ArrowRight,
  Phone,
  Mail,
  User,
} from 'lucide-react';

export const UserDashboardView = ({
  items = [],
  claims = [],
  onViewItem,
  onReportClick,
  onDeleteItem,
  onMarkRecovered,
  onReviewClaim,
  onOpenMatchModal,
}) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('my-reports'); // 'my-reports' | 'incoming-claims' | 'my-claims' | 'smart-matches'
  const [rejectingClaimId, setRejectingClaimId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // 1. My reported items
  const myItems = items.filter((i) => i.reporterId === currentUser?.id);
  const myLost = myItems.filter((i) => i.type === 'LOST');
  const myFound = myItems.filter((i) => i.type === 'FOUND');

  // 2. Incoming claims on my reported items
  const incomingClaims = claims.filter((c) => {
    // If I am the reporter of this item
    const parentItem = items.find((i) => i.id === c.itemId);
    return parentItem && parentItem.reporterId === currentUser?.id;
  });

  // 3. Claims I submitted
  const mySubmittedClaims = claims.filter((c) => c.claimantId === currentUser?.id);

  // 4. Smart Matches detected for my items
  const myMatches = findMatchesForUserReports(myItems, items);

  const handleConfirmReject = (claimId) => {
    onReviewClaim(claimId, 'REJECTED', rejectReason || 'Details provided do not match item records.');
    setRejectingClaimId(null);
    setRejectReason('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Dashboard Header with User Profile */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-navy-900 flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentUser?.name || 'My Dashboard'}
              </h1>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 uppercase">
                {currentUser?.role || 'user'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentUser?.email} • Member since {currentUser?.joinedDate || '2024'}
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onReportClick('LOST')}
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            Report New Item
          </button>
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setActiveTab('my-reports')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'my-reports'
              ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 shadow-sm'
              : 'bg-white dark:bg-navy-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>My Reports</span>
            <Package className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {myItems.length}
          </div>
          <span className="text-[11px] text-slate-400">
            {myLost.length} Lost • {myFound.length} Found
          </span>
        </div>

        <div
          onClick={() => setActiveTab('incoming-claims')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'incoming-claims'
              ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 shadow-sm'
              : 'bg-white dark:bg-navy-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Claims on My Items</span>
            <FileCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {incomingClaims.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {incomingClaims.filter((c) => c.status === 'PENDING').length} Pending Review
          </span>
        </div>

        <div
          onClick={() => setActiveTab('my-claims')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'my-claims'
              ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 shadow-sm'
              : 'bg-white dark:bg-navy-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>My Submitted Claims</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {mySubmittedClaims.length}
          </div>
          <span className="text-[11px] text-slate-400">
            {mySubmittedClaims.filter((c) => c.status === 'APPROVED').length} Approved
          </span>
        </div>

        <div
          onClick={() => setActiveTab('smart-matches')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'smart-matches'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm'
              : 'bg-white dark:bg-navy-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>AI Match Alerts</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-500">
            {myMatches.length}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">
            Potential Item Matches
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('my-reports')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'my-reports'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          My Reported Items ({myItems.length})
        </button>

        <button
          onClick={() => setActiveTab('incoming-claims')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'incoming-claims'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          Claims on My Listings ({incomingClaims.length})
          {incomingClaims.filter((c) => c.status === 'PENDING').length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
              {incomingClaims.filter((c) => c.status === 'PENDING').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('my-claims')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'my-claims'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          My Submitted Claims ({mySubmittedClaims.length})
        </button>

        <button
          onClick={() => setActiveTab('smart-matches')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-colors whitespace-nowrap border-b-2 ${
            activeTab === 'smart-matches'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-navy-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          ✨ AI Match Alerts ({myMatches.length})
        </button>
      </div>

      {/* TAB 1: MY REPORTED ITEMS */}
      {activeTab === 'my-reports' && (
        <div>
          {myItems.length > 0 ? (
            <div className="space-y-4">
              {myItems.map((item) => {
                const isResolved = item.status === 'RESOLVED';
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-navy-950 flex-shrink-0">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <TypeBadge type={item.type} />
                          <StatusBadge status={item.status} />
                        </div>
                        <h3
                          onClick={() => onViewItem(item.id)}
                          className="text-base font-bold text-slate-900 dark:text-white hover:text-brand-500 cursor-pointer"
                        >
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {item.location} • Reported on {item.date}
                        </p>
                        {item.secretDetails && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Secret verification info active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
                      {!isResolved && (
                        <button
                          onClick={() => onMarkRecovered(item.id)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Mark Returned
                        </button>
                      )}
                      <button
                        onClick={() => onViewItem(item.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="You haven't reported any items yet"
              description="Keep track of your lost items or report found belongings to connect with owners."
              actionLabel="Report Lost Item"
              onAction={() => onReportClick('LOST')}
            />
          )}
        </div>
      )}

      {/* TAB 2: INCOMING CLAIMS ON MY ITEMS */}
      {activeTab === 'incoming-claims' && (
        <div>
          {incomingClaims.length > 0 ? (
            <div className="space-y-4">
              {incomingClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <ClaimStatusBadge status={claim.status} />
                      <span className="text-xs text-slate-400">
                        Submitted {new Date(claim.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                      Listing: {claim.itemTitle}
                    </span>
                  </div>

                  {/* Claimant Profile & Proof Description */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-brand-500" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Claimant: {claim.claimantName}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Submitted Proof of Ownership:
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {claim.description}
                      </p>
                    </div>
                  </div>

                  {/* If Approved, show contact for handover */}
                  {claim.status === 'APPROVED' && (
                    <div className="mb-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Phone: {claim.claimantPhone || 'Relayed in-app'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Email: {claim.claimantEmail}</span>
                      </div>
                    </div>
                  )}

                  {/* Approval Actions if Pending */}
                  {claim.status === 'PENDING' && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-3">
                      {rejectingClaimId === claim.id ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejection (e.g. proof does not match)"
                            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-xs text-slate-900 dark:text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleConfirmReject(claim.id)}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
                          >
                            Confirm Reject
                          </button>
                          <button
                            onClick={() => setRejectingClaimId(null)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setRejectingClaimId(claim.id)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
                          >
                            Reject Claim
                          </button>
                          <button
                            onClick={() => onReviewClaim(claim.id, 'APPROVED', 'Ownership proof verified.')}
                            className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve & Arrange Handover
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No claims submitted on your items"
              description="When someone files an ownership claim on an item you reported, it will appear here for review."
            />
          )}
        </div>
      )}

      {/* TAB 3: MY SUBMITTED CLAIMS */}
      {activeTab === 'my-claims' && (
        <div>
          {mySubmittedClaims.length > 0 ? (
            <div className="space-y-4">
              {mySubmittedClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <ClaimStatusBadge status={claim.status} />
                      <span className="text-xs text-slate-400">
                        Submitted on {new Date(claim.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {claim.itemTitle}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      <strong>Your submitted proof:</strong> {claim.description}
                    </p>
                    {claim.reporterNotes && (
                      <p className="text-xs text-brand-600 dark:text-brand-400 mt-2 font-medium">
                        Reporter note: "{claim.reporterNotes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => onViewItem(claim.itemId)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No claims filed yet"
              description="Browse the directory to see found items and submit claims with proof of ownership."
              actionLabel="Browse Directory"
              onAction={() => onViewItem('browse')}
            />
          )}
        </div>
      )}

      {/* TAB 4: SMART MATCH ALERTS */}
      {activeTab === 'smart-matches' && (
        <div>
          {myMatches.length > 0 ? (
            <div className="space-y-6">
              {myMatches.map(({ myItem, matches }) => (
                <div
                  key={myItem.id}
                  className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-amber-500/30 shadow-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-wider text-amber-500 block">
                        Your Reported Listing
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {myItem.title} ({myItem.type})
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-600 dark:text-amber-400">
                      {matches.length} Detected {matches.length === 1 ? 'Match' : 'Matches'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-amber-500">
                              {m.score}% Similarity Score
                            </span>
                            <TypeBadge type={m.candidate.type} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {m.candidate.title}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {m.candidate.description}
                          </p>
                          <div className="mt-2 text-[11px] text-slate-400">
                            Location: {m.candidate.location}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <button
                            onClick={() => onViewItem(m.candidate.id)}
                            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500"
                          >
                            View Listing
                          </button>
                          <button
                            onClick={() => onOpenMatchModal(m, myItem)}
                            className="px-3 py-1.5 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-1"
                          >
                            Compare Side-by-Side
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No automatic matches detected at this moment"
              description="Our heuristic match engine constantly compares newly reported items against your listings. We'll alert you the moment a potential match appears."
            />
          )}
        </div>
      )}
    </div>
  );
};
