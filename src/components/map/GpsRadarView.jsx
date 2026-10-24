import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CATEGORIES } from '../../types';
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
  ChevronRight,
  Layers,
  Plus,
  Minus,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Share2,
} from 'lucide-react';

const MAP_LAYERS = {
  streets: {
    name: 'Google Map',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    preview: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=120&auto=format&fit=crop&q=80',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
  satellite: {
    name: 'Satellite',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    preview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=120&auto=format&fit=crop&q=80',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
  terrain: {
    name: 'Terrain',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    preview: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&auto=format&fit=crop&q=80',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
  },
};

export const GpsRadarView = ({ items = [], onViewDetails, onReportClick }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userCircleRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mapType, setMapType] = useState('streets'); // 'streets' | 'satellite' | 'terrain'
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [proximityRadius, setProximityRadius] = useState('ALL'); // 'ALL' | 500 | 1000 | 3000
  const [selectedItemOnMap, setSelectedItemOnMap] = useState(null);

  // Auto-acquire user location on mount
  useEffect(() => {
    getUserGpsLocation()
      .then((loc) => setUserLocation(loc))
      .catch(() => {});
  }, []);

  // Pre-process items with coordinates & distance calculation
  const mappedItems = useMemo(() => {
    return items.map((item, index) => {
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

  // Filtered items
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

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (a.distanceMeters !== null && b.distanceMeters !== null) {
        return a.distanceMeters - b.distanceMeters;
      }
      return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
    });
  }, [filteredItems]);

  // Initialize Map with Google Maps Tiles
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
        attributionControl: false,
      });

      // Default Google Maps Streets Tiles
      tileLayerRef.current = L.tileLayer(MAP_LAYERS.streets.url, {
        maxZoom: 20,
        subdomains: MAP_LAYERS.streets.subdomains,
      }).addTo(map);

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

  // Handle Layer Switching (Google Maps Streets, Satellite, Terrain)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const layer = MAP_LAYERS[mapType];
    tileLayerRef.current = L.tileLayer(layer.url, {
      maxZoom: layer.maxZoom,
      subdomains: layer.subdomains,
    }).addTo(mapInstanceRef.current);
  }, [mapType]);

  // Update Markers & Location Elements
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Google Maps style User Location Blip
    if (userLocation) {
      const userHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: #4285f4; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; background-color: #1a73e8; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        html: userHtml,
        className: 'google-user-blip',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`
          <div style="font-family: Roboto, -apple-system, sans-serif; font-size: 12px; padding: 4px; text-align: center;">
            <strong style="color: #202124; display: block; font-weight: 700;">📍 Your Current Location</strong>
            <span style="color: #5f6368; font-size: 11px;">GPS Accuracy: ±${userLocation.accuracy || 15}m</span>
          </div>
        `);

      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }

      if (proximityRadius !== 'ALL') {
        const radiusNum = Number(proximityRadius);
        userCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusNum,
          color: '#1a73e8',
          fillColor: '#1a73e8',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 6',
        }).addTo(map);
      }
    }

    // 2. Google Maps iconic Teardrop Markers
    const markerBounds = [];

    filteredItems.forEach((item) => {
      const isLost = item.type === 'LOST';
      const pinColor = isLost ? '#ea4335' : '#34a853'; // Official Google Red & Google Green

      const googlePinHtml = `
        <div class="google-pin-container group" style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); transition: transform 0.15s ease;">
          <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${pinColor}"/>
            <circle cx="17" cy="16" r="7.5" fill="white"/>
            <text x="17" y="20.5" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="11" text-anchor="middle" fill="${pinColor}">${isLost ? '!' : '✓'}</text>
          </svg>
          <div style="background-color: white; border-radius: 6px; padding: 2px 6px; margin-top: -3px; box-shadow: 0 1px 4px rgba(0,0,0,0.25); border: 1px solid #dadce0; font-family: Roboto, -apple-system, sans-serif; font-size: 11px; font-weight: 700; color: #202124; white-space: nowrap; max-width: 140px; overflow: hidden; text-overflow: ellipsis; pointer-events: none;">
            ${item.title}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: googlePinHtml,
        className: 'custom-google-marker',
        iconSize: [34, 42],
        iconAnchor: [17, 42],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], { icon })
        .addTo(markersLayerRef.current);

      markerBounds.push([item.coordinates.lat, item.coordinates.lng]);

      // Google Maps Place Card style Popup
      const popupHtml = `
        <div style="font-family: Roboto, -apple-system, sans-serif; width: 240px; padding: 2px;">
          <div style="position: relative; height: 115px; border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <img src="${item.images?.[0] || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400'}" style="width: 100%; height: 100%; object-fit: cover;" />
            <span style="position: absolute; top: 6px; left: 6px; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 9999px; color: white; background-color: ${isLost ? '#ea4335' : '#34a853'}; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ${item.type}
            </span>
            ${item.distanceMeters !== null ? `<span style="position: absolute; bottom: 6px; right: 6px; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 6px; background-color: rgba(32,33,36,0.9); color: white;">📍 ${formatDistance(item.distanceMeters)}</span>` : ''}
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #202124; margin: 0 0 3px 0; line-height: 1.3;">${item.title}</h4>
          <p style="font-size: 11px; color: #5f6368; margin: 0 0 10px 0;">📍 ${item.location}</p>
          <div style="display: flex; gap: 8px;">
            <button id="view-details-${item.id}" style="flex: 1; padding: 8px 12px; font-size: 11px; font-weight: 700; background-color: #1a73e8; color: white; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
              View Details
            </button>
            <a href="${getDirectionsUrl(item.coordinates.lat, item.coordinates.lng)}" target="_blank" rel="noopener noreferrer" style="padding: 8px 12px; font-size: 11px; font-weight: 700; background-color: #f1f3f4; color: #1a73e8; text-decoration: none; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 1px solid #dadce0;">
              🧭 Directions
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('popupopen', () => {
        setSelectedItemOnMap(item);
        const btn = document.getElementById(`view-details-${item.id}`);
        if (btn) {
          btn.onclick = () => onViewDetails(item.id);
        }
      });
    });

    if (markerBounds.length > 0 && !selectedItemOnMap) {
      if (userLocation) {
        markerBounds.push([userLocation.lat, userLocation.lng]);
      }
      map.fitBounds(markerBounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [filteredItems, userLocation, proximityRadius, mapType]);

  const handleLocateMe = async () => {
    setLocating(true);
    try {
      const loc = await getUserGpsLocation();
      setUserLocation(loc);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, { duration: 1.2 });
      }
    } catch (err) {
      console.warn('Geolocation error:', err);
    } finally {
      setLocating(false);
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleSelectDrawerItem = (item) => {
    setSelectedItemOnMap(item);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([item.coordinates.lat, item.coordinates.lng], 17, {
        duration: 1.0,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in font-sans">
      {/* Google Maps Style Search & Top Control Bar */}
      <div className="mb-4 bg-white rounded-2xl border border-slate-200/90 shadow-md p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Google Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Google Map for lost items, campus landmarks, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['ALL', 'LOST', 'FOUND'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedType === type
                    ? type === 'LOST'
                      ? 'bg-red-500 text-white shadow-sm'
                      : type === 'FOUND'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'ALL' ? 'All Items' : type === 'LOST' ? '🔴 Lost' : '🟢 Found'}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Radar Proximity Dropdown */}
          <select
            value={proximityRadius}
            onChange={(e) => setProximityRadius(e.target.value)}
            disabled={!userLocation}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="ALL">Entire Campus Radius</option>
            <option value="500">Within 500m (Walking)</option>
            <option value="1000">Within 1 km</option>
            <option value="3000">Within 3 km</option>
          </select>

          {/* Report Item Quick Trigger */}
          {onReportClick && (
            <button
              onClick={() => onReportClick()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex-shrink-0"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Report Item Here</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container: Full Google Map (8 cols) + Side Stream (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Google Map Canvas */}
        <div className="lg:col-span-8 rounded-3xl overflow-hidden bg-white border border-slate-200 shadow-lg relative min-h-[580px] flex flex-col">
          {/* Leaflet Canvas */}
          <div ref={mapContainerRef} className="w-full flex-1 z-0 min-h-[580px]" />

          {/* Google Maps Layer Switcher (Bottom-Left) */}
          <div className="absolute bottom-5 left-5 z-[400]">
            <div className="relative">
              <button
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="flex items-center gap-2 p-2 pr-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xl transition-all active:scale-95 group"
                title="Switch Map Layers"
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-300">
                  <img
                    src={MAP_LAYERS[mapType].preview}
                    alt={MAP_LAYERS[mapType].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left text-xs">
                  <span className="block font-bold text-slate-800">Layers</span>
                  <span className="block text-[10px] text-slate-500 capitalize">{MAP_LAYERS[mapType].name}</span>
                </div>
              </button>

              {/* Popup Layer Menu */}
              {showLayerMenu && (
                <div className="absolute bottom-14 left-0 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 flex gap-2 animate-fade-in">
                  {Object.entries(MAP_LAYERS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setMapType(key);
                        setShowLayerMenu(false);
                      }}
                      className={`flex flex-col items-center p-1.5 rounded-xl transition-all ${
                        mapType === key ? 'ring-2 ring-blue-600 bg-blue-50/50' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-14 h-12 rounded-lg overflow-hidden border border-slate-200 mb-1">
                        <img src={config.preview} alt={config.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">{config.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Google Maps Floating Controls (Bottom-Right) */}
          <div className="absolute bottom-5 right-5 z-[400] flex flex-col gap-2.5">
            {/* Locate Me Target Button */}
            <button
              onClick={handleLocateMe}
              disabled={locating}
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-xl flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all active:scale-95"
              title="Show Your Location"
            >
              <Locate className={`w-5 h-5 ${locating ? 'animate-spin text-blue-600' : 'text-slate-700'}`} />
            </button>

            {/* Zoom In & Out Stack */}
            <div className="flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                title="Zoom in"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
                title="Zoom out"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Google Attribution & Watermark */}
          <div className="absolute bottom-1 right-24 z-[400] text-[10px] text-slate-600/80 font-medium select-none pointer-events-none bg-white/70 px-2 py-0.5 rounded backdrop-blur-sm">
            Google Maps &copy; {new Date().getFullYear()}
          </div>
        </div>

        {/* Nearby Stream Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-[580px] bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Nearby Radar Stream</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {userLocation ? 'Sorted by proximity to your GPS' : 'All campus active listings'}
              </span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {sortedItems.length}
            </span>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
            {sortedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <MapPin className="w-10 h-10 mb-2 opacity-40 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No items in this radius</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Try expanding the radar radius or resetting filters.
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
                  Reset Range
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
                        ? 'border-blue-500 bg-blue-50/50 shadow-md ring-2 ring-blue-400/20'
                        : 'border-slate-200/80 hover:border-blue-300 bg-slate-50/50 hover:bg-white hover:shadow-sm'
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
                            isLost ? 'bg-red-500' : 'bg-emerald-600'
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
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
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
                            className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
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

          {/* Quick Landmarks Jump */}
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
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors"
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
