// Client-side name search utility

function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];
  
  for (let i = 0; i <= len2; i++) matrix[i] = [i];
  for (let j = 0; j <= len1; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      const cost = str2[i - 1] === str1[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i][j - 1] + 1,
        matrix[i - 1][j] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len2][len1];
  return 1 - distance / Math.max(len1, len2);
}

function fuzzyMatch(query: string, names: string[], limit: number = 30): string[] {
  const normalized = query.toLowerCase();
  const scored = names.map(name => ({
    name,
    score: calculateSimilarity(normalized, name.toLowerCase())
  }));
  
  return scored
    .filter(item => item.score > 0.4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.name);
}

let cachedMaleNames: string[] = [];
let cachedFemaleNames: string[] = [];

export async function loadNames(gender: 'male' | 'female'): Promise<string[]> {
  if (gender === 'male' && cachedMaleNames.length > 0) return cachedMaleNames;
  if (gender === 'female' && cachedFemaleNames.length > 0) return cachedFemaleNames;

  const filename = gender === 'male' ? 'male_names_200k.json' : 'female_names_200k.json';
  const response = await fetch(`/data/${filename}`);
  const data = await response.json();
  const names = gender === 'male' ? data.male_names : data.female_names;

  if (gender === 'male') cachedMaleNames = names;
  else cachedFemaleNames = names;

  return names;
}

export async function searchNames(query: string, gender: 'male' | 'female') {
  const names = await loadNames(gender);
  const normalizedQuery = query.trim().toUpperCase();
  
  // Try prefix match first
  let results = names.filter((n: string) => n.toUpperCase().startsWith(normalizedQuery));
  let isFuzzy = false;
  
  // If no prefix match, try fuzzy matching
  if (results.length === 0) {
    results = fuzzyMatch(normalizedQuery, names, 30);
    isFuzzy = true;
  } else if (results.length > 30) {
    // Randomize if more than 30 matches
    results = results.sort(() => Math.random() - 0.5).slice(0, 30);
  }
  
  return {
    results,
    isFuzzy,
    count: results.length,
  };
}
