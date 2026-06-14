// Client-side name search utility
1
2	function calculateSimilarity(str1: string, str2: string): number {
3	  const len1 = str1.length;
4	  const len2 = str2.length;
5	  const matrix: number[][] = [];
6	  
7	  for (let i = 0; i <= len2; i++) matrix[i] = [i];
8	  for (let j = 0; j <= len1; j++) matrix[0][j] = j;
9	  
10	  for (let i = 1; i <= len2; i++) {
11	    for (let j = 1; j <= len1; j++) {
12	      const cost = str2[i - 1] === str1[j - 1] ? 0 : 1;
13	      matrix[i][j] = Math.min(
14	        matrix[i][j - 1] + 1,
15	        matrix[i - 1][j] + 1,
16	        matrix[i - 1][j - 1] + cost
17	      );
18	    }
19	  }
20	  
21	  const distance = matrix[len2][len1];
22	  return 1 - distance / Math.max(len1, len2);
23	}
24	
25	function fuzzyMatch(query: string, names: string[], limit: number = 30): string[] {
26	  const normalized = query.toLowerCase();
27	  const scored = names.map(name => ({
28	    name,
29	    score: calculateSimilarity(normalized, name.toLowerCase())
30	  }));
31	  
32	  return scored
33	    .filter(item => item.score > 0.4)
34	    .sort((a, b) => b.score - a.score)
35	    .slice(0, limit)
36	    .map(item => item.name);
37	}
38	
39	let cachedMaleNames: string[] = [];
40	let cachedFemaleNames: string[] = [];
41	
42	export async function loadNames(gender: 'male' | 'female'): Promise<string[]> {
43	  if (gender === 'male' && cachedMaleNames.length > 0) return cachedMaleNames;
44	  if (gender === 'female' && cachedFemaleNames.length > 0) return cachedFemaleNames;
45	
46	  const filename = gender === 'male' ? 'male_names_200k.json' : 'female_names_200k.json';
47	  const response = await fetch(`/data/${filename}`);
48	  const data = await response.json();
49	  const names = gender === 'male' ? data.male_names : data.female_names;
50	
51	  if (gender === 'male') cachedMaleNames = names;
52	  else cachedFemaleNames = names;
53	
54	  return names;
55	}
56	
57	export async function searchNames(query: string, gender: 'male' | 'female') {
58	  const names = await loadNames(gender);
59	  const normalizedQuery = query.trim().toUpperCase();
60	  
61	  // Try prefix match first
62	  let results = names.filter((n: string) => n.toUpperCase().startsWith(normalizedQuery));
63	  let isFuzzy = false;
64	  
65	  // If no prefix match, try fuzzy matching
66	  if (results.length === 0) {
67	    results = fuzzyMatch(normalizedQuery, names, 30);
68	    isFuzzy = true;
69	  } else if (results.length > 30) {
70	    // Randomize if more than 30 matches
71	    results = results.sort(() => Math.random() - 0.5).slice(0, 30);
72	  }
73	  
74	  return {
75	    results,
76	    isFuzzy,
77	    count: results.length,
78	  };
79	}
