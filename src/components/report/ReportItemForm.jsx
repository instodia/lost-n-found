import React, { useState } from 'react';
import { CATEGORIES, ITEM_TYPES } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getUserGpsLocation, formatCoordinates, getNearestLandmark } from '../../services/gpsService';
import {
  Search,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  ShieldCheck,
  Lock,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  Eye,
  Check,
  X,
  Locate,
  Navigation,
} from 'lucide-react';

const SAMPLE_PRESET_IMAGES = [
  { label: 'Smartphone', url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80' },
  { label: 'Leather Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80' },
  { label: 'Keys & Fob', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80' },
  { label: 'Laptop', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sunglasses', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pet Dog', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80' },
];

export const ReportItemForm = ({ initialType = ITEM_TYPES.LOST, onSubmitSuccess, onCancel }) => {
  const { currentUser } = useAuth();
  const { addToast, triggerConfetti } = useToast();

  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Metro City');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [reward, setReward] = useState('');
  const [secretDetails, setSecretDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // GPS auto-detection handler
  const handleDetectGps = async () => {
    setGpsLoading(true);
    try {
      const loc = await getUserGpsLocation();
      setCoordinates({ lat: loc.lat, lng: loc.lng });
      setGpsAccuracy(loc.accuracy);
      const nearest = getNearestLandmark(loc.lat, loc.lng);
      if (!location.trim() && nearest) {
        setLocation(`${nearest.name} (${nearest.zone})`);
      }
      addToast({
        title: 'GPS Coordinates Captured',
        message: `Locked at ${formatCoordinates(loc.lat, loc.lng)} (±${loc.accuracy}m)`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'GPS Access Failed',
        message: 'Please allow browser location permissions to capture GPS.',
        type: 'error',
      });
    } finally {
      setGpsLoading(false);
    }
  };

  // File upload handler converting image to data URL
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast({ title: 'File Too Large', message: 'Images should be under 5MB', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setUploadedImages((prev) => [...prev, result]);
      if (!imageUrl) setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (uploadedImages[indexToRemove] === imageUrl) {
      const remaining = uploadedImages.filter((_, idx) => idx !== indexToRemove);
      setImageUrl(remaining[0] || '');
    }
  };

  const selectPresetImage = (url) => {
    if (!uploadedImages.includes(url)) {
      setUploadedImages((prev) => [...prev, url]);
    }
    setImageUrl(url);
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Item title is required';
    if (!category) errs.category = 'Please select a category';
    if (!description.trim() || description.length < 10)
      errs.description = 'Please provide a detailed description (at least 10 characters)';
    if (!location.trim()) errs.location = 'Location or landmark is required';
    if (!date) errs.date = 'Date is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast({
        title: 'Form Validation Error',
        message: 'Please fill in all required fields indicated in red',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);

    try {
      const imagesToSave = uploadedImages.length > 0
        ? uploadedImages
        : [SAMPLE_PRESET_IMAGES[0].url];

      const itemPayload = {
        type,
        title: title.trim(),
        category,
        description: description.trim(),
        location: location.trim(),
        city: city.trim(),
        date,
        time,
        reward: reward.trim() || null,
        secretDetails: secretDetails.trim() || null,
        images: imagesToSave,
        coordinates: coordinates || null,
      };

      await onSubmitSuccess(itemPayload);
      triggerConfetti();
      addToast({
        title: 'Listing Published Successfully!',
        message: `Your ${type.toLowerCase()} report for "${title}" is now active in FindIt`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Submission Failed',
        message: err.message || 'Something went wrong',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Report an Item
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Provide accurate details to enable automatic smart matching and secure owner verification.
        </p>

        {/* Toggle Lost vs Found */}
        <div className="mt-6 inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => setType(ITEM_TYPES.LOST)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
              type === ITEM_TYPES.LOST
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            I Lost an Item
          </button>
          <button
            type="button"
            onClick={() => setType(ITEM_TYPES.FOUND)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
              type === ITEM_TYPES.FOUND
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            I Found an Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form fields (2 cols) */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6"
          >
            {/* 1. Basic Details */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center text-xs">
                  1
                </span>
                General Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Item Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Midnight Black iPhone 15 Pro, Navy Bellroy Leather Wallet"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.title ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.title && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.category ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {type === ITEM_TYPES.LOST && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Optional Reward (Encourages recovery)
                      </label>
                      <div className="relative">
                        <Award className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={reward}
                          onChange={(e) => setReward(e.target.value)}
                          placeholder="e.g. $50 or Coffee & Thanks!"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Public Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe color, brand, condition, external stickers, visible characteristics..."
                    className={`w-full px-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      errors.description ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.description && (
                    <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Date and Location */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center text-xs">
                  2
                </span>
                Date & Incident Location
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date {type === ITEM_TYPES.LOST ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Approximate Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Location / Landmark <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Central University Library 3rd Floor, Metro Station Bench, Main Cafeteria"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        errors.location ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {/* GPS Detection Action */}
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleDetectGps}
                      disabled={gpsLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all active:scale-95 disabled:opacity-60 shadow-sm"
                    >
                      <Locate className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin text-indigo-600' : 'text-indigo-600'}`} />
                      <span>{gpsLoading ? 'Acquiring GPS...' : '📍 Auto-Detect Current GPS Location'}</span>
                    </button>

                    {coordinates ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>GPS Locked: {formatCoordinates(coordinates.lat, coordinates.lng)}</span>
                        {gpsAccuracy && <span className="text-[10px] text-emerald-600">(±{gpsAccuracy}m)</span>}
                        <button
                          type="button"
                          onClick={() => {
                            setCoordinates(null);
                            setGpsAccuracy(null);
                          }}
                          className="ml-1 text-slate-400 hover:text-slate-600 font-bold"
                          title="Remove GPS tag"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Attaching GPS shows item on the interactive radar map
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Anti-Fraud Secret Detail (Private) */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center text-xs">
                    3
                  </span>
                  Confidential Verification Details
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <Lock className="w-3 h-3" /> Private • Hidden from Public
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                Add unique secret information known <strong>only</strong> to the true owner (e.g. lock screen photo,
                scratch on bottom left corner, exact cash inside, serial prefix, engravings). Claimants will have to verify this to claim!
              </p>
              <textarea
                rows={2}
                value={secretDetails}
                onChange={(e) => setSecretDetails(e.target.value)}
                placeholder="e.g. Lock screen wallpaper is a golden retriever puppy. Back case has a small sticker inside with student ID."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* 4. Photos & Presets */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center text-xs">
                  4
                </span>
                Photos & Imagery
              </h2>

              {/* Upload input */}
              <div className="mb-4">
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 rounded-2xl p-6 cursor-pointer bg-slate-50/50 dark:bg-navy-950/50 transition-colors">
                  <Upload className="w-8 h-8 text-brand-500 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Click to upload photo from your device
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">PNG, JPG or WEBP up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Sample Quick Preset Photos */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Or select a sample stock photo for testing:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectPresetImage(preset.url)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 hover:border-brand-500 bg-white dark:bg-navy-950 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Image Thumbnails */}
              {uploadedImages.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-3">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-rose-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-md shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Publishing Report...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit & Publish Report
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card (1 col) */}
        <div>
          <div className="sticky top-24 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-500" /> Live Listing Preview
              </span>
              <span>Card Mock</span>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-navy-950 mb-4">
                <img
                  src={
                    uploadedImages[0] ||
                    imageUrl ||
                    'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&auto=format&fit=crop&q=80'
                  }
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      type === ITEM_TYPES.LOST
                        ? 'bg-rose-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {type === ITEM_TYPES.LOST ? 'LOST ITEM' : 'FOUND ITEM'}
                  </span>
                </div>
                {reward && (
                  <div className="absolute bottom-3 right-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-500 text-white shadow">
                      {reward}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-xs text-brand-600 dark:text-brand-400 font-semibold mb-1">
                {CATEGORIES.find((c) => c.id === category)?.name || 'Category'}
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                {title || 'Untitled Item'}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 mb-3">
                {description || 'Detailed item description will appear here...'}
              </p>

              <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span className="truncate">{location || 'Location / Landmark'}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                <span>By {currentUser?.name || 'Anonymous User'}</span>
                <span>{date}</span>
              </div>
            </div>

            {/* Security note */}
            <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/40 border border-brand-200/50 dark:border-brand-800/50 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Protected Privacy</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Your phone number and private identification details are never displayed publicly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
