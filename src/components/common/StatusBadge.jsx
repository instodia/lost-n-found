import React from 'react';
import { ITEM_TYPES, ITEM_STATUS, CLAIM_STATUS } from '../../types';
import { CheckCircle2, Clock, XCircle, Search, HelpCircle, ShieldAlert } from 'lucide-react';

export const TypeBadge = ({ type }) => {
  if (type === ITEM_TYPES.LOST) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
        <Search className="w-3.5 h-3.5" />
        Lost Item
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
      <CheckCircle2 className="w-3.5 h-3.5" />
      Found Item
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  switch (status) {
    case ITEM_STATUS.ACTIVE:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          Active
        </span>
      );
    case ITEM_STATUS.PENDING_CLAIM:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3 text-amber-500" />
          Pending Claim
        </span>
      );
    case ITEM_STATUS.RESOLVED:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Returned to Owner
        </span>
      );
    case ITEM_STATUS.REJECTED:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
          <XCircle className="w-3 h-3" />
          Closed
        </span>
      );
    default:
      return null;
  }
};

export const ClaimStatusBadge = ({ status }) => {
  switch (status) {
    case CLAIM_STATUS.PENDING:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          Pending Verification
        </span>
      );
    case CLAIM_STATUS.APPROVED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Claim Approved
        </span>
      );
    case CLAIM_STATUS.REJECTED:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          Claim Rejected
        </span>
      );
    default:
      return null;
  }
};
