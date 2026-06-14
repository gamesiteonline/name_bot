import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// Load names data
let maleNames: string[] = [];
let femaleNames: string[] = [];

function loadNamesData() {
  try {
    const maleFile = path.join(process.cwd(), 'server', 'male_names_200k.json');
    const femaleFile = path.join(process.cwd(), 'server', 'female_names_200k.json');
    
    if (fs.existsSync(maleFile)) {
      const maleData = JSON.parse(fs.readFileSync(maleFile, 'utf-8'));
      maleNames = maleData.male_names || [];
    }
    
    if (fs.existsSync(femaleFile)) {
      const femaleData = JSON.parse(fs.readFileSync(femaleFile, 'utf-8'));
      femaleNames = femaleData.female_names || [];
    }
    
    console.log(`✅ Loaded ${maleNames.length} male names and ${femaleNames.length} female names`);
  } catch (error) {
    console.error('❌ Error loading names data:', error);
  }
}

// Load names on startup
loadNamesData();

// Fuzzy matching helper
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

// Levenshtein distance for fuzzy matching
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

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  names: router({
    search: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        gender: z.enum(['male', 'female']),
      }))
      .query(({ input }) => {
        const names = input.gender === 'male' ? maleNames : femaleNames;
        const query = input.query.trim().toUpperCase();
        
        // Try prefix match first
        let results = names.filter(n => n.toUpperCase().startsWith(query));
        let isFuzzy = false;
        
        // If no prefix match, try fuzzy matching
        if (results.length === 0) {
          results = fuzzyMatch(query, names, 30);
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
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
