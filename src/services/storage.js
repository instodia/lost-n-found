import { INITIAL_ITEMS, INITIAL_CLAIMS, INITIAL_ACTIVITY_LOGS } from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

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

// Storage helper functions
export const getStoredItems = async () => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('items').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to local storage', e);
    }
  }

  const raw = localStorage.getItem(STORAGE_KEYS.ITEMS);
  return raw ? JSON.parse(raw) : INITIAL_ITEMS;
};

export const getStoredItemById = async (id, currentUser = null) => {
  const items = await getStoredItems();
  const item = items.find((i) => i.id === id);
  if (!item) return null;

  // Sanitize secret details if viewer is not the reporter or admin
  const isReporter = currentUser && currentUser.id === item.reporterId;
  const isAdmin = currentUser && currentUser.role === 'admin';

  if (!isReporter && !isAdmin) {
    return {
      ...item,
      secretDetails: undefined, // Hidden for anti-fraud security!
      hasSecretVerification: Boolean(item.secretDetails),
    };
  }

  return item;
};

export const saveItem = async (itemData, currentUser) => {
  const items = await getStoredItems();
  const newItem = {
    ...itemData,
    id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: 'ACTIVE',
    reporterId: currentUser.id,
    reporterName: currentUser.name,
    reporterEmail: currentUser.email,
    reporterPhone: currentUser.phone || '',
    viewsCount: 1,
    flagged: false,
    createdAt: new Date().toISOString(),
  };

  const updatedItems = [newItem, ...items];
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));

  // Add activity log
  await addActivityLog({
    text: `${currentUser.name} reported ${newItem.type.toLowerCase()} item: "${newItem.title}"`,
    type: 'report',
  });

  return newItem;
};

export const updateItem = async (itemId, patchData, currentUser) => {
  const items = await getStoredItems();
  const index = items.findIndex((i) => i.id === itemId);
  if (index === -1) throw new Error('Item not found');

  const existing = items[index];
  const isReporter = currentUser && currentUser.id === existing.reporterId;
  const isAdmin = currentUser && currentUser.role === 'admin';

  if (!isReporter && !isAdmin) {
    throw new Error('Unauthorized to edit this item');
  }

  const updatedItem = { ...existing, ...patchData };
  items[index] = updatedItem;
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  return updatedItem;
};

export const deleteItem = async (itemId, currentUser) => {
  const items = await getStoredItems();
  const existing = items.find((i) => i.id === itemId);
  if (!existing) throw new Error('Item not found');

  const isReporter = currentUser && currentUser.id === existing.reporterId;
  const isAdmin = currentUser && currentUser.role === 'admin';

  if (!isReporter && !isAdmin) {
    throw new Error('Unauthorized to delete this item');
  }

  const remaining = items.filter((i) => i.id !== itemId);
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(remaining));
  return true;
};

// Claims
export const getStoredClaims = async () => {
  const raw = localStorage.getItem(STORAGE_KEYS.CLAIMS);
  return raw ? JSON.parse(raw) : INITIAL_CLAIMS;
};

export const createClaim = async (claimData, currentUser) => {
  const claims = await getStoredClaims();
  const newClaim = {
    ...claimData,
    id: `claim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    claimantId: currentUser.id,
    claimantName: currentUser.name,
    claimantEmail: currentUser.email,
    claimantPhone: currentUser.phone || '',
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
  };

  const updatedClaims = [newClaim, ...claims];
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(updatedClaims));

  // Update item status to PENDING_CLAIM
  try {
    await updateItem(claimData.itemId, { status: 'PENDING_CLAIM' }, currentUser);
  } catch (e) {
    // If not reporter, update status anyway via direct save
    const items = await getStoredItems();
    const itemIndex = items.findIndex((i) => i.id === claimData.itemId);
    if (itemIndex !== -1) {
      items[itemIndex].status = 'PENDING_CLAIM';
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    }
  }

  await addActivityLog({
    text: `${currentUser.name} submitted an ownership claim for "${claimData.itemTitle}"`,
    type: 'claim',
  });

  return newClaim;
};

export const updateClaimStatus = async (claimId, newStatus, reporterNotes = '', currentUser) => {
  const claims = await getStoredClaims();
  const index = claims.findIndex((c) => c.id === claimId);
  if (index === -1) throw new Error('Claim not found');

  const claim = claims[index];
  const items = await getStoredItems();
  const item = items.find((i) => i.id === claim.itemId);

  const isReporter = currentUser && (currentUser.id === claim.reporterId || (item && currentUser.id === item.reporterId));
  const isAdmin = currentUser && currentUser.role === 'admin';

  if (!isReporter && !isAdmin) {
    throw new Error('Unauthorized to review this claim');
  }

  claim.status = newStatus;
  claim.reporterNotes = reporterNotes;
  claims[index] = claim;
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(claims));

  // If approved, update item status to RESOLVED
  if (newStatus === 'APPROVED' && item) {
    const itemIndex = items.findIndex((i) => i.id === item.id);
    if (itemIndex !== -1) {
      items[itemIndex].status = 'RESOLVED';
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    }
  } else if (newStatus === 'REJECTED' && item) {
    // Check if other pending claims exist
    const otherPending = claims.filter((c) => c.itemId === item.id && c.id !== claimId && c.status === 'PENDING');
    if (otherPending.length === 0) {
      const itemIndex = items.findIndex((i) => i.id === item.id);
      if (itemIndex !== -1) {
        items[itemIndex].status = 'ACTIVE';
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
      }
    }
  }

  await addActivityLog({
    text: `Claim for "${claim.itemTitle}" was ${newStatus.toLowerCase()} by ${currentUser.name}`,
    type: 'claim',
  });

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

// Reset to initial mock data (helpful for testing & demo)
export const resetToDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEYS.CLAIMS, JSON.stringify(INITIAL_CLAIMS));
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  window.location.reload();
};
