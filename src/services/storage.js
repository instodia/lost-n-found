import { INITIAL_ITEMS, INITIAL_CLAIMS, INITIAL_ACTIVITY_LOGS } from './mockData';

const API_BASE = '/api';

const STORAGE_KEYS = {
  ITEMS: 'findit_items_v1',
  CLAIMS: 'findit_claims_v1',
  LOGS: 'findit_activity_v1',
};

// Initialize default storage data
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLAIMS)) {
    localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  }
};

initializeStorage();

// Safe fetch with 8s timeout to handle cloud/cold starts reliably
const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
};

// Storage helper functions
export const getStoredItems = async () => {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/items`, {}, 8000);
    if (res.ok) {
      const dbItems = await res.json();
      if (Array.isArray(dbItems) && dbItems.length > 0) {
        // Map _id to id for seamless UI compatibility
        const mapped = dbItems.map((item) => ({ ...item, id: item._id || item.id }));
        try {
          localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(mapped));
        } catch (e) {}
        return mapped;
      }
    }
  } catch (e) {
    console.warn('Backend API unavailable or timed out, fallback to local storage', e);
  }

  const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return raw ? JSON.parse(raw) : INITIAL_ITEMS;
};

export const getStoredItemById = async (id, currentUser = null) => {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/items/${id}`, {}, 8000);
    if (res.ok) {
      const item = await res.json();
      const mapped = { ...item, id: item._id || item.id };
      const isReporter = currentUser && currentUser.id === mapped.reporterId;
      const isAdmin = currentUser && currentUser.role === 'admin';
      if (!isReporter && !isAdmin) {
        return {
          ...mapped,
          secretDetails: undefined,
          hasSecretVerification: Boolean(mapped.secretDetails),
        };
      }
      return mapped;
    }
  } catch (e) {
    // fallback
  }

  const items = await getStoredItems();
  const item = items.find((i) => (i._id || i.id) === id);
  if (!item) return null;

  const isReporter = currentUser && currentUser.id === item.reporterId;
  const isAdmin = currentUser && currentUser.role === 'admin';

  if (!isReporter && !isAdmin) {
    return {
      ...item,
      secretDetails: undefined,
      hasSecretVerification: Boolean(item.secretDetails),
    };
  }

  return item;
};

export const saveItem = async (itemData, currentUser) => {
  const payload = {
    ...itemData,
    status: 'ACTIVE',
    reporterId: currentUser?.id || 'guest',
    reporterName: currentUser?.name || 'Anonymous User',
    reporterEmail: currentUser?.email || 'user@findit.com',
    reporterPhone: currentUser?.phone || '',
    viewsCount: 1,
    flagged: false,
    date: itemData.date || new Date().toISOString().split('T')[0],
  };

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/items`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      15000
    );
    if (res.ok) {
      const saved = await res.json();
      const mappedSaved = { ...saved, id: saved._id || saved.id };

      // Update local storage cache
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
        const existing = raw ? JSON.parse(raw) : [];
        const updated = [mappedSaved, ...existing.filter((i) => (i._id || i.id) !== mappedSaved.id)];
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updated));
      } catch (cacheErr) {}

      await addActivityLog({
        text: `${currentUser?.name || 'User'} reported ${saved.type?.toLowerCase() || 'item'}: "${saved.title}" (Saved to Cloud MongoDB)`,
        type: 'report',
      });
      return mappedSaved;
    } else {
      const errText = await res.text();
      console.warn('API save returned non-200:', res.status, errText);
    }
  } catch (e) {
    console.warn('Backend API unavailable, saving locally', e);
  }

  // Fallback to localStorage
  const items = await getStoredItems();
  const newItem = {
    ...payload,
    id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
  };

  const updatedItems = [newItem, ...items];
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));

  await addActivityLog({
    text: `${currentUser?.name || 'User'} reported ${newItem.type.toLowerCase()} item: "${newItem.title}"`,
    type: 'report',
  });

  return newItem;
};

export const updateItem = async (itemId, patchData, currentUser) => {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/items/${itemId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      },
      3000
    );
    if (res.ok) {
      const updated = await res.json();
      return { ...updated, id: updated._id || updated.id };
    }
  } catch (e) {
    // fallback
  }

  const items = await getStoredItems();
  const index = items.findIndex((i) => (i._id || i.id) === itemId);
  if (index === -1) throw new Error('Item not found');

  const existing = items[index];
  const updatedItem = { ...existing, ...patchData };
  items[index] = updatedItem;
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return updatedItem;
};

export const deleteItem = async (itemId, currentUser) => {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/items/${itemId}`, { method: 'DELETE' }, 3000);
    if (res.ok) return true;
  } catch (e) {
    // fallback
  }

  const items = await getStoredItems();
  const remaining = items.filter((i) => (i._id || i.id) !== itemId);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(remaining));
  return true;
};

// Claims
export const getStoredClaims = async () => {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/claims`, {}, 2500);
    if (res.ok) {
      const dbClaims = await res.json();
      if (dbClaims && dbClaims.length > 0) {
        return dbClaims.map((c) => ({ ...c, id: c._id || c.id }));
      }
    }
  } catch (e) {
    // fallback
  }

  const raw = localStorage.getItem(STORAGE_KEYS.CLAIMS);
  return raw ? JSON.parse(raw) : INITIAL_CLAIMS;
};

export const createClaim = async (claimData, currentUser) => {
  const payload = {
    ...claimData,
    claimantId: currentUser?.id || 'guest',
    claimantName: currentUser?.name || 'Anonymous Claimant',
    claimantEmail: currentUser?.email || 'claimant@findit.com',
    claimantPhone: currentUser?.phone || '',
    status: 'PENDING',
  };

  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/claims`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      4000
    );
    if (res.ok) {
      const saved = await res.json();
      await addActivityLog({
        text: `${currentUser?.name || 'User'} submitted an ownership claim for "${claimData.itemTitle}" (MongoDB)`,
        type: 'claim',
      });
      return { ...saved, id: saved._id || saved.id };
    }
  } catch (e) {
    console.warn('Backend unavailable, saving claim locally', e);
  }

  const claims = await getStoredClaims();
  const newClaim = {
    ...payload,
    id: `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    submittedAt: new Date().toISOString(),
  };

  const updatedClaims = [newClaim, ...claims];
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updatedClaims));

  await addActivityLog({
    text: `${currentUser?.name || 'User'} submitted an ownership claim for "${claimData.itemTitle}"`,
    type: 'claim',
  });

  return newClaim;
};

export const updateClaimStatus = async (claimId, newStatus, reporterNotes = '', currentUser) => {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/claims/${claimId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reporterNotes }),
      },
      3000
    );
    if (res.ok) {
      const updated = await res.json();
      return { ...updated, id: updated._id || updated.id };
    }
  } catch (e) {
    // fallback
  }

  const claims = await getStoredClaims();
  const index = claims.findIndex((c) => (c._id || c.id) === claimId);
  if (index === -1) throw new Error('Claim not found');

  const claim = claims[index];
  claim.status = newStatus;
  claim.reporterNotes = reporterNotes;
  claims[index] = claim;
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));

  return claim;
};

// Activity Logs
export const getActivityLogs = async () => {
  const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
  return raw ? JSON.parse(raw) : INITIAL_ACTIVITY_LOGS;
};

export const addActivityLog = async ({ text, type = 'info' }) => {
  const logs = await getActivityLogs();
  const newLog = {
    id: `act-${Date.now()}`,
    text,
    type,
    timestamp: 'Just now',
  };
  const updatedLogs = [newLog, ...logs.slice(0, 19)];
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
  return updatedLogs;
};

export const resetToDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  window.location.reload();
};
