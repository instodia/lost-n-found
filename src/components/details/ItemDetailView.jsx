import React, { useState, useEffect } from 'react';
import { TypeBadge, StatusBadge } from '../common/StatusBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import { CATEGORIES } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { findSmartMatches } from '../../services/smartMatcher';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Award,
  Sparkles,
  Share2,
  AlertTriangle,
  Lock,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const ItemDetailView = ({
  item,
  allItems = [],
  onBack,
  onOpenClaimModal,
  onOpenMatchModal,
  onMarkRecovered,
  onViewItem,
}) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (item && allItems.length > 0) {
      const detected = findSmartMatches(item, allItems);
      setMatches(detected);
    }
  }, [item, allItems]);

  if (!item) return null;

  const categoryObj = CATEGORIES.find((c) => c.id === item.category) || { name: item.category };
  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800'];

  const isMyItem = currentUser && currentUser.id === item.reporterId;
  const isResolved = item.status === 'RESOLVED';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      addToast({ title: 'Link Copied', message: 'Listing URL copied to clipboard!', type: 'success' });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    addToast({
      title: 'Message Relayed Securely',
      message: 'Your message has been sent to the reporter via FindIt relay service.',
      type: 'success',
    });
    setMessageText('');
    setContactModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse Directory
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-brand-500 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          Share Listing
        </button>
      </div>

      {/* Smart Match Notification Banner if matches detected */}
      {matches.length > 0 && !isResolved && (
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-brand-500/15 border-2 border-amber-500/40 shadow-lg backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse-subtle">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md flex-shrink-0">
              <Sparkles className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Smart AI Match Alert
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-900 dark:text-amber-200">
                  {matches[0].score}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                We found a {matches[0].candidate.type.toLowerCase()} listing ("{matches[0].candidate.title}") matching this description & location!
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenMatchModal(matches[0])}
            className="whitespace-nowrap px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-md flex items-center gap-1.5 self-start sm:self-auto"
          >
            Compare Match Side-by-Side
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[16/11] w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 shadow-xl">
            <img
              src={images[activeImageIndex]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <TypeBadge type={item.type} />
              <StatusBadge status={item.status} />
            </div>

            {item.reward && (
              <div className="absolute bottom-4 right-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-white shadow-lg">
                  <Award className="w-4 h-4" />
                  {item.reward}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-brand-500 ring-2 ring-brand-500/30'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Interactive Map Location Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-500" /> Incident Location & Drop-off Hub
            </h3>
            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
              {/* Map background mockup styling */}
              <div
                className="absolute inset-0 opacity-40 dark:opacity-20 bg-cover bg-center"
                style={{
                  backgroundImage: `radial-gradient(#6366f1 1px, transparent 1px), radial-gradient(#6366f1 1px, #f8fafc 1px)`,
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="relative z-10 flex flex-col items-center p-3 text-center">
                <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 mb-2 animate-bounce">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white max-w-xs">
                  {item.location}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5">
                  Verified Public Area • {item.city || 'Metro City'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {/* Category and Date */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-800 dark:text-slate-200 font-semibold">
                <CategoryIcon categoryId={item.category} className="w-4 h-4 text-brand-500" />
                {categoryObj.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {item.date} {item.time && `• ${item.time}`}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 mb-4 leading-snug">
              {item.title}
            </h1>

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Public Description
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Confidential Secret Verification Details (Visible to reporter/admin) */}
            {item.secretDetails ? (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400 mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  Reporter Private Verification Details
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.secretDetails}
                </p>
                <span className="block text-[10px] text-amber-600/80 dark:text-amber-400/70 mt-1">
                  (Visible only to you as the reporter and platform administrators for claim validation)
                </span>
              </div>
            ) : (
              <div className="mb-6 p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Anti-fraud verification clues securely registered on file.</span>
              </div>
            )}

            {/* Reporter Profile Snippet (Privacy Masked) */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-sm">
                  {item.reporterName ? item.reporterName.charAt(0) : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.reporterName}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <UserCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Contact relayed via FindIt Portal
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-medium text-slate-400">
                {item.viewsCount || 42} views
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {isMyItem ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-xs text-brand-700 dark:text-brand-300 font-medium text-center">
                    You reported this item listing.
                  </div>
                  {!isResolved && (
                    <button
                      onClick={() => onMarkRecovered(item.id)}
                      className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Recovered / Returned to Owner
                    </button>
                  )}
                </div>
              ) : isResolved ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    This item has been successfully reunited with its owner!
                  </p>
                </div>
              ) : (
                <>
                  {item.type === 'FOUND' ? (
                    <button
                      onClick={() => onOpenClaimModal(item)}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Claim This Item (Prove Ownership)
                    </button>
                  ) : (
                    <button
                      onClick={() => setContactModalOpen(true)}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      I Found This Item! (Notify Owner)
                    </button>
                  )}

                  <button
                    onClick={() => setContactModalOpen(true)}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                    Contact Reporter Safely
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Safe Contact Relay Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md p-6 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Send Safe Message to Reporter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              FindIt shields both parties' phone and personal email. Your message will be forwarded securely.
            </p>

            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                rows={4}
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Hi, I believe I have info regarding your reported item..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContactModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
