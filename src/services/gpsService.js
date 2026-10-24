// GPS Utility functions for distance calculation, geocoding, and campus landmarks

// Default Campus Center (e.g., Central University Quad)
export const DEFAULT_CAMPUS_CENTER = {
  lat: 28.6139,
  lng: 77.2090,
  name: 'Central University Quad',
};

// Known Campus & City Anchor Landmarks with coordinates
export const CAMPUS_LANDMARKS = [
  { name: 'Central University Library', lat: 28.6142, lng: 77.2088, zone: 'Academic Block' },
  { name: 'Science Complex & Lecture Halls', lat: 28.6162, lng: 77.2065, zone: 'North Campus' },
  { name: 'Student Center & Cafeteria', lat: 28.6130, lng: 77.2105, zone: 'Student Hub' },
  { name: 'Metro Downtown Central Station', lat: 28.6205, lng: 77.2150, zone: 'Transit Hub' },
  { name: 'City Green Park & Fountain', lat: 28.6110, lng: 77.2140, zone: 'Recreation' },
  { name: 'Westside Community Sports Complex', lat: 28.6080, lng: 77.2050, zone: 'Athletics' },
  { name: 'Riverside Walk & Dog Park', lat: 28.6250, lng: 77.2020, zone: 'Riverfront' },
  { name: 'Postal Annex & Admin Plaza', lat: 28.6150, lng: 77.2110, zone: 'Admin Quad' },
  { name: 'Artisan Roasters Coffee House', lat: 28.6180, lng: 77.2120, zone: 'Commercial Ave' },
];

/**
 * Get user's current GPS location via Browser Geolocation API
 */
export const getUserGpsLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: position.timestamp,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

/**
 * Calculate distance in meters between two lat/lng pairs using the Haversine formula
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

/**
 * Format distance into human-readable string (e.g. "120 m" or "2.4 km")
 */
export const formatDistance = (meters) => {
  if (meters === null || meters === undefined) return '';
  if (meters < 1000) {
    return `${meters} m away`;
  }
  const km = (meters / 1000).toFixed(1);
  return `${km} km away`;
};

/**
 * Format coordinates nicely (e.g., "28.6139° N, 77.2090° E")
 */
export const formatCoordinates = (lat, lng) => {
  if (!lat || !lng) return '';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
};

/**
 * Find nearest known landmark from given coordinates
 */
export const getNearestLandmark = (lat, lng) => {
  let nearest = null;
  let minDistance = Infinity;

  for (const landmark of CAMPUS_LANDMARKS) {
    const dist = calculateDistanceMeters(lat, lng, landmark.lat, landmark.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = { ...landmark, distance: dist };
    }
  }

  return nearest;
};

/**
 * Generate Google Maps navigation URL
 */
export const getDirectionsUrl = (lat, lng) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
};
