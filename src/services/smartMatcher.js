const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'from',
  'is', 'it', 'was', 'are', 'this', 'that', 'near', 'some', 'has', 'have', 'lost', 'found',
  'item', 'items', 'please', 'help', 'contact', 'yesterday', 'today'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function calculateMatchScore(targetItem, candidateItem) {
  // Only compare LOST with FOUND (or vice versa)
  if (targetItem.type === candidateItem.type) return null;
  if (candidateItem.id === targetItem.id) return null;
  if (candidateItem.status === 'RESOLVED') return null; // Already returned

  let score = 0;
  const factors = [];

  // 1. Category comparison (35 pts)
  if (targetItem.category && candidateItem.category && targetItem.category === candidateItem.category) {
    score += 35;
    factors.push(`Matching category: ${targetItem.category}`);
  }

  // 2. Keyword overlap in Title and Description (35 pts)
  const targetTokens = new Set([
    ...tokenize(targetItem.title),
    ...tokenize(targetItem.description),
  ]);
  const candidateTokens = new Set([
    ...tokenize(candidateItem.title),
    ...tokenize(candidateItem.description),
  ]);

  const commonKeywords = [];
  targetTokens.forEach((token) => {
    if (candidateTokens.has(token)) {
      commonKeywords.push(token);
    }
  });

  if (commonKeywords.length > 0) {
    // 10 pts per matching keyword, up to 35 pts
    const keywordScore = Math.min(35, commonKeywords.length * 10);
    score += keywordScore;
    factors.push(`Shared keywords: ${commonKeywords.slice(0, 4).join(', ')}`);
  }

  // 3. Location Overlap (18 pts)
  const targetLocTokens = new Set(tokenize(targetItem.location + ' ' + (targetItem.city || '')));
  const candidateLocTokens = new Set(tokenize(candidateItem.location + ' ' + (candidateItem.city || '')));
  
  const locOverlap = [];
  targetLocTokens.forEach((loc) => {
    if (candidateLocTokens.has(loc)) locOverlap.push(loc);
  });

  if (locOverlap.length > 0) {
    score += 18;
    factors.push(`Location proximity match: "${locOverlap.join(', ')}"`);
  }

  // 4. Date Proximity (12 pts)
  if (targetItem.date && candidateItem.date) {
    const tDate = new Date(targetItem.date);
    const cDate = new Date(candidateItem.date);
    const diffDays = Math.abs((tDate - cDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 2) {
      score += 12;
      factors.push(`Reported within 48 hours of each other`);
    } else if (diffDays <= 5) {
      score += 8;
      factors.push(`Reported within 5 days of each other`);
    } else if (diffDays <= 14) {
      score += 4;
      factors.push(`Reported within 2 weeks`);
    }
  }

  // Threshold: at least 40% match
  if (score >= 40) {
    let confidence = 'potential';
    if (score >= 75) confidence = 'high';
    else if (score >= 55) confidence = 'medium';

    return {
      candidate: candidateItem,
      score: Math.min(98, score), // Never claim 100% since human verification is required
      confidence,
      factors,
    };
  }

  return null;
}

export function findSmartMatches(targetItem, allItems) {
  if (!targetItem || !allItems || allItems.length === 0) return [];

  const matches = [];
  for (const item of allItems) {
    const match = calculateMatchScore(targetItem, item);
    if (match) {
      matches.push(match);
    }
  }

  // Sort by highest score first
  return matches.sort((a, b) => b.score - a.score);
}

export function findMatchesForUserReports(userItems, allItems) {
  if (!userItems || userItems.length === 0) return [];
  const results = [];

  for (const myItem of userItems) {
    if (myItem.status === 'RESOLVED') continue;
    const matches = findSmartMatches(myItem, allItems);
    if (matches.length > 0) {
      results.push({
        myItem,
        matches,
      });
    }
  }

  return results;
}
