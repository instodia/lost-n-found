import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  calculateDistanceMeters,
  formatDistance,
  formatCoordinates,
  getDirectionsUrl,
  getUserGpsLocation,
  DEFAULT_CAMPUS_CENTER,
} from '../../services/gpsService';
import { Navigation, MapPin, Locate, ExternalLink } from 'lucide-react';

export const ItemMiniMap = ({ item, onOpenFullMap }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [distanceMeters, setDistanceMeters] = useState(null);
  const [locating, setLocating] = useState(false);

  // Fallback coords if item doesn't have explicit coordinates
  const itemCoords = item?.coordinates || {
    lat: DEFAULT_CAMPUS_CENTER.lat,
    lng: DEFAULT_CAMPUS_CENTER.lng,
  };

  // Try to grab user location on mount (silent request if already permitted)
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          getUserGpsLocation()
            .then((loc) => {
              setUserLocation(loc);
              const dist = calculateDistanceMeters(loc.lat, loc.lng, itemCoords.lat, itemCoords.lng);
              setDistanceMeters(dist);
            })
            .catch(() => {});
        }
      });
    }
  }, [itemCoords.lat, itemCoords.lng]);

  const handleLocateMe = async () => {
    setLocating(true);
    try {
      const loc = await getUserGpsLocation();
      setUserLocation(loc);
      const dist = calculateDistanceMeters(loc.lat, loc.lng, itemCoords.lat, itemCoords.lng);
      setDistanceMeters(dist);

      if (mapInstanceRef.current) {
        // Fit bounds to show both user and item
        const bounds = L.latLngBounds([
          [itemCoords.lat, itemCoords.lng],
          [loc.lat, loc.lng],
        ]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    } catch (err) {
      console.warn('Geolocation denied or failed:', err);
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [itemCoords.lat, itemCoords.lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Real Google Maps Streets Tiles (Free, No API key needed, Crisp & Clear)
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps',
    }).addTo(map);

    // Google Maps iconic Teardrop Pin styling
    const isLost = item?.type === 'LOST';
    const markerColor = isLost ? '#ea4335' : '#34a853'; // Official Google Red & Google Green

    const googlePinSvg = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="${markerColor}"/>
          <circle cx="16" cy="15" r="7" fill="white"/>
          <text x="16" y="19" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="11" text-anchor="middle" fill="${markerColor}">${isLost ? '!' : '✓'}</text>
        </svg>
      </div>
    `;

    const customIcon = L.divIcon({
      html: googlePinSvg,
      className: 'google-maps-pin',
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -38],
    });

    const itemMarker = L.marker([itemCoords.lat, itemCoords.lng], { icon: customIcon }).addTo(map);
    itemMarker.bindPopup(`
      <div style="font-family: Roboto, -apple-system, sans-serif; font-size: 12px; line-height: 1.4; padding: 4px;">
        <strong style="color: #202124; display: block; margin-bottom: 2px;">${item?.title || 'Item Location'}</strong>
        <span style="color: #5f6368; font-size: 11px;">📍 ${item?.location || 'Verified Location'}</span>
      </div>
    `);

    // Add user marker if location is known
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 9999px; background-color: #3b82f6; opacity: 0.35; animation: ping 2s infinite;"></div>
            <div style="width: 16px; height: 16px; border-radius: 9999px; background-color: #2563eb; border: 3px solid white; box-shadow: 0 2px 8px rgba(37,99,235,0.5);"></div>
          </div>
        `,
        className: 'custom-user-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>You are here</b>');

      // Draw dashed line connecting user and item
      L.polyline(
        [
          [userLocation.lat, userLocation.lng],
          [itemCoords.lat, itemCoords.lng],
        ],
        {
          color: '#3b82f6',
          weight: 2,
          dashArray: '5, 8',
          opacity: 0.7,
        }
      ).addTo(map);
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [itemCoords.lat, itemCoords.lng, userLocation, item?.type, item?.title, item?.location]);

  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-500" />
          Live GPS Location & Tracking
        </h3>

        {distanceMeters !== null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">
            <Navigation className="w-3 h-3 text-brand-500 animate-pulse" />
            {formatDistance(distanceMeters)}
          </span>
        )}
      </div>

      {/* Map canvas container */}
      <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Locate me quick button overlay */}
        <button
          onClick={handleLocateMe}
          disabled={locating}
          title="Calculate distance from your current location"
          className="absolute top-2.5 right-2.5 z-[400] p-2 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 hover:text-brand-600 hover:bg-slate-50 shadow-md transition-all active:scale-95 text-xs font-semibold flex items-center gap-1.5"
        >
          <Locate className={`w-3.5 h-3.5 ${locating ? 'animate-spin text-brand-600' : 'text-slate-600'}`} />
          <span>{locating ? 'Locating...' : userLocation ? 'Recalculate' : 'My Distance'}</span>
        </button>
      </div>

      {/* Coordinates & Location Bar */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="font-bold text-slate-900 block">{item?.location}</span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>GPS: {formatCoordinates(itemCoords.lat, itemCoords.lng)}</span>
            <span>•</span>
            <span>{item?.city || 'Metro City'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getDirectionsUrl(itemCoords.lat, itemCoords.lng)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5 text-brand-600" />
            <span>Navigate</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {onOpenFullMap && (
            <button
              onClick={onOpenFullMap}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-colors shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>Full GPS Radar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
