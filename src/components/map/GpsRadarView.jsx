import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORIES } from '../../types';
import { TypeBadge, StatusBadge } from '../common/StatusBadge';
import { CategoryIcon } from '../common/CategoryIcon';
import {
  getUserGpsLocation,
  calculateDistanceMeters,
  formatDistance,
  formatCoordinates,
  getDirectionsUrl,
  DEFAULT_CAMPUS_CENTER,
  CAMPUS_LANDMARKS,
} from '../../services/gpsService';
import {
  MapPin,
  Locate,
  Navigation,
  Compass,
  Search,
  Filter,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Eye,
  Radio,
} from 'lucide-react';

export const GpsRadarView = ({ items = [], onViewDetails, onReportClick }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userCircleRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [proximityRadius, setProximityRadius] = useState('ALL'); // 'ALL' | 500 | 1000 | 3000
  const [selectedItemOnMap, setSelectedItemOnMap] = useState(null);

  // Automatically request GPS or check permission on mount
  useEffect(() => {
    getUserGpsLocation()
      .then((loc) => {
        setUserLocation(loc);
      })
      .catch((err) => {
        console.log('GPS initial locate skipped (will use campus center):', err.message);
      });
  }, []);

  // Center on user button
  const handleLocateMe = async () => {
    setLocating(true);
    setGpsError(null);
    try {
      const loc = await getUserGpsLocation();
      setUserLocation(loc);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 });
      }
    } catch (err) {
      setGpsError('Could not access GPS. Please ensure location permissions are allowed.');
    } finally {
      setLocating(false);
    }
  };

  // Pre-process items with coordinates & distance calculation
  const mappedItems = useMemo(() => {
    return items.map((item, index) => {
      // If coordinates exist, use them; otherwise distribute safely around campus
      const coords = item.coordinates || {
        lat: DEFAULT_CAMPUS_CENTER.lat + (index % 4 === 0 ? 0.003 : -0.002) * (index + 1) * 0.4,
        lng: DEFAULT_CAMPUS_CENTER.lng + (index % 3 === 0 ? 0.004 : -0.003) * (index + 1) * 0.4,
      };

      const distance = userLocation
        ? calculateDistanceMeters(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
        : null;

      return {
        ...item,
        coordinates: coords,
        distanceMeters: distance,
      };
    });
  }, [items, userLocation]);

  // Filtered items based on search, type, category, and radius
  const filteredItems = useMemo(() => {
    return mappedItems.filter((item) => {
      if (selectedType !== 'ALL' && item.type !== selectedType) return false;
      if (selectedCategory && item.category !== selectedCategory) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(term);
        const matchDesc = item.description?.toLowerCase().includes(term);
        const matchLoc = item.location?.toLowerCase().includes(term);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }

      if (proximityRadius !== 'ALL' && item.distanceMeters !== null) {
        if (item.distanceMeters > Number(proximityRadius)) return false;
      }

      return true;
    });
  }, [mappedItems, selectedType, selectedCategory, searchTerm, proximityRadius]);

  // Sort items for the side drawer: closest first if user location available
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (a.distanceMeters !== null && b.distanceMeters !== null) {
        return a.distanceMeters - b.distanceMeters;
      }
      return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
  }, [filteredItems]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [DEFAULT_CAMPUS_CENTER.lat, DEFAULT_CAMPUS_CENTER.lng];

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 15,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean & modern CartoDB Voyager tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(map);

      // Marker cluster or layer group
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Radius Circle when items or user location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    // Clear old markers
    markersLayerRef.current.clearLayers();

    // 1. Render User Marker & Proximity Radar Circle
    if (userLocation) {
      const userHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: #3b82f6; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background-color: #2563eb; border: 3.5px solid white; box-shadow: 0 4px 14px rgba(37,99,235,0.6); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 9999px; background-color: white;"></div>
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'custom-user-radar-pin',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px; text-align: center;">
            <strong style="color: #1e293b; display: block; font-weight: 800;">📍 Your Current Location</strong>
            <span style="color: #64748b; font-size: 11px;">GPS Accuracy: ±${userLocation.accuracy || 15}m</span>
          </div>
        `);

      // Radar range circle if radius filter is active
      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }

      if (proximityRadius !== 'ALL') {
        const radiusNum = Number(proximityRadius);
        userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusNum,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 6',
        }).addTo(map);
      }
    }

    // 2. Render Item Markers
    const markerBounds = [];

    filteredItems.forEach((item) => {
      const isLost = item.type === 'LOST';
      const color = isLost ? '#ef4444' : '#10b981';
      const bgColor = isLost ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)';

      const markerHtml = `
        <div class="group cursor-pointer" style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background-color: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 34px; height: 34px; border-radius: 9999px; background: linear-gradient(135deg, ${color}, ${isLost ? '#dc2626' : '#059669'}); border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 11px; transition: transform 0.2s ease;">
            ${isLost ? '!' : '✓'}
          </div>
          <span style="position: absolute; bottom: -20px; font-size: 10px; font-weight: 800; background-color: white; color: #0f172a; padding: 1px 6px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.15); white-space: nowrap; border: 1px solid #e2e8f0; pointer-events: none;">
            ${item.title.length > 14 ? item.title.slice(0, 14) + '...' : item.title}
          </span>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-item-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], { icon })
        .addTo(markersLayerRef.current);

      markerBounds.push([item.coordinates.lat, item.coordinates.lng]);

      // Popup Content
      const popupHtml = `
        <div style="font-family: inherit; width: 230px; padding: 2px;">
          <div style="position: relative; height: 110px; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <img src="${item.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400'}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 6px; left: 6px; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; color: white; background-color: ${isLost ? '#ef4444' : '#10b981'};">
              ${item.type}
            </span>
            ${item.distanceMeters !== null ? `<span style="position: absolute; bottom: 6px; right: 6px; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background-color: rgba(15,23,42,0.85); color: white;">📍 ${formatDistance(item.distanceMeters)}</span>` : ''}
          </div>
          <h4 style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 3px 0; line-height: 1.3;">${item.title}</h4>
          <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">📍 ${item.location}</p>
          <div style="display: flex; gap: 6px;">
            <button id="view-btn-${item.id}" style="flex: 1; padding: 6px 10px; font-size: 11px; font-weight: 700; background-color: #4f46e5; color: white; border: none; border-radius: 8px; cursor: pointer;">
              View Details
            </button>
            <a href="${getDirectionsUrl(item.coordinates.lat, item.coordinates.lng)}" target="_blank" rel="noopener noreferrer" style="padding: 6px 8px; font-size: 11px; font-weight: 700; background-color: #f1f5f9; color: #334155; text-decoration: none; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              🧭
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Attach click event for custom popup button
      marker.on('popupopen', () => {
        setSelectedItemOnMap(item);
        const btn = document.getElementById(`view-btn-${item.id}`);
        if (btn) {
          btn.onclick = () => onViewDetails(item.id);
        }
      });
    });

    // If items exist and no manual user override, fit bounds nicely
    if (markerBounds.length > 0 && !selectedItemOnMap) {
      if (userLocation) {
        markerBounds.push([userLocation.lat, userLocation.lng]);
      }
      map.fitBounds(markerBounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [filteredItems, userLocation, proximityRadius]);

  // Click on side drawer item: fly map to it
  const handleSelectDrawerItem = (item) => {
    setSelectedItemOnMap(item);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.coordinates.lat, item.coordinates.lng], 17, {
        duration: 1.0,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
            <span>FindIt Live Radar & GPS Mapping</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus & Metro Lost & Found Radar
          </h1>
          <p className="text-sm text-indigo-100 max-w-2xl mt-1">
            Pinpoint lost and recovered items geographically. View real-time proximity alerts, distance estimates, and turn-by-turn navigation routes.
          </p>
        </div>

        {/* GPS Status & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleLocateMe}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-brand-700 hover:bg-indigo-50 font-bold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-75"
          >
            <Locate className={`w-4 h-4 ${locating ? 'animate-spin text-brand-600' : 'text-brand-600'}`} />
            <span>{locating ? 'Acquiring GPS...' : userLocation ? 'Recenter My GPS' : 'Enable My GPS'}</span>
          </button>

          {onReportClick && (
            <button
              onClick={() => onReportClick()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs border border-white/30 transition-all active:scale-95"
            >
              <MapPin className="w-4 h-4" />
              <span>Report Item Here</span>
            </button>
          )}
        </div>
      </div>

      {gpsError && (
        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button onClick={() => setGpsError(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="mb-6 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter radar by item name, location, or tag..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
          </div>

          {/* Type Toggle Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            {['ALL', 'LOST', 'FOUND'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedType === type
                    ? type === 'LOST'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : type === 'FOUND'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'All Pins' : type === 'LOST' ? '🔴 Lost' : '🟢 Found'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Proximity Radius Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">Radar Radius:</span>
            <select
              value={proximityRadius}
              onChange={(e) => setProximityRadius(e.target.value)}
              disabled={!userLocation}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
            >
              <option value="ALL">Entire Campus / City</option>
              <option value="500">Within 500 Meters (Walking)</option>
              <option value="1000">Within 1 Kilometer</option>
              <option value="3000">Within 3 Kilometers</option>
            </select>
          </div>
        </div>

        {/* Active Radar Info Badges */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              {filteredItems.filter((i) => i.type === 'LOST').length} Lost Items
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              {filteredItems.filter((i) => i.type === 'FOUND').length} Found Items
            </span>
          </div>

          {userLocation ? (
            <span className="text-[11px] font-semibold text-brand-600 flex items-center gap-1">
              <Navigation className="w-3 h-3 text-brand-500 animate-pulse" />
              Your GPS: {formatCoordinates(userLocation.lat, userLocation.lng)}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              Tip: Click "Enable My GPS" to unlock real-time distance scanning.
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Map (8 cols) + Nearby Feed (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map View */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md relative min-h-[560px] flex flex-col">
          <div ref={mapContainerRef} className="w-full flex-1 z-0 min-h-[560px]" />

          {/* Quick Floating Legend on top-left of map */}
          <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-2.5 shadow-lg text-[11px] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm"></span>
              <span>Lost Item Pinned</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span>
              <span>Found Item Pinned</span>
            </div>
            {userLocation && (
              <div className="flex items-center gap-2 font-bold text-blue-600">
                <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></span>
                <span>Your Location</span>
              </div>
            )}
          </div>
        </div>

        {/* Nearby Items Side Feed (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[560px] bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-600" />
                <span>Nearby Radar Stream</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {userLocation ? 'Sorted by proximity to your GPS' : 'All campus active listings'}
              </span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              {sortedItems.length}
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
            {sortedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MapPin className="w-10 h-10 mb-2 opacity-40 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No items in this radius</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try expanding the radar radius or resetting your filters.
                </p>
                <button
                  onClick={() => {
                    setProximityRadius('ALL');
                    setSelectedType('ALL');
                    setSelectedCategory('');
                    setSearchTerm('');
                  }}
                  className="mt-3 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Reset Radar Range
                </button>
              </div>
            ) : (
              sortedItems.map((item) => {
                const isLost = item.type === 'LOST';
                const isSelected = selectedItemOnMap?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectDrawerItem(item)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 shadow-md ring-2 ring-brand-400/20'
                        : 'border-slate-200/80 hover:border-brand-300 bg-slate-50/50 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                        <img
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300'}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute bottom-1 left-1 text-[9px] font-black px-1.5 py-0.5 rounded-md text-white ${
                            isLost ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </h4>
                          {item.distanceMeters !== null && (
                            <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                              {formatDistance(item.distanceMeters)}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          📍 {item.location}
                        </p>

                        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                          <span className="capitalize">{item.category}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(item.id);
                            }}
                            className="text-brand-600 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Campus Landmarks helper */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Radar Landmarks
            </span>
            <div className="flex flex-wrap gap-1">
              {CAMPUS_LANDMARKS.slice(0, 4).map((lm, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([lm.lat, lm.lng], 16, { duration: 1.0 });
                    }
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-600 font-medium transition-colors"
                >
                  📍 {lm.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
