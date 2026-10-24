import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  X,
  ShieldCheck,
  Lock,
  Upload,
  AlertCircle,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

export const ClaimModal = ({ isOpen, onClose, item, onSubmitClaim }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [description, setDescription] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [certifyTruthful, setCertifyTruthful] = useState(false);
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !item) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || description.length < 15) {
      setError('Please provide a detailed description and proof of ownership (at least 15 characters).');
      return;
    }
    if (!certifyTruthful) {
      setError('You must certify that this item belongs to you under penalty of fraud.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmitClaim({
        itemId: item.id,
        itemTitle: item.title,
        reporterId: item.reporterId,
        description: description.trim(),
        proofImages: proofImage ? [proofImage] : [],
        claimantPhone: phone.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 p-6 sm:p-8 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Ownership Verification
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Claim "{item.title}"
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            To prevent fraud, submit specific distinguishing characteristics that only the rightful owner would know.
          </p>
        </div>

        {/* Anti-Fraud Notice */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Confidential Protection:</strong> Your claim details will only be sent to the finder
            and verified campus/platform administrators. It is never displayed publicly.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Proof of Ownership & Unique Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe secret details such as screen lock photo, specific scratches, engravings, internal contents, purchase receipt, serial number..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Contact Phone Number (Kept confidential for handover)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Optional Proof Photo / Receipt */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attach Receipt / Proof Photo (Optional)
            </label>
            <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 cursor-pointer hover:border-brand-500 transition-colors">
              <Upload className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500 truncate">
                {proofImage ? 'Photo attached ✓' : 'Upload photo of receipt or matching item...'}
              </span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
            {proofImage && (
              <div className="mt-2 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={proofImage} alt="Proof preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Legal Certification Checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={certifyTruthful}
                onChange={(e) => setCertifyTruthful(e.target.checked)}
                className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                I solemnly certify under penalty of account suspension and law that I am the genuine owner of
                this item and that the details provided are accurate.
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Submitting Claim...
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  Submit Ownership Claim
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
