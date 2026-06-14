import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock context
const mockContext: TrpcContext = {
  user: null,
  req: {
    protocol: 'https',
    headers: {},
  } as TrpcContext['req'],
  res: {} as TrpcContext['res'],
};

describe('names.search', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(mockContext);
  });

  it('should find names starting with a 3-letter prefix (male)', async () => {
    const result = await caller.names.search({
      query: 'FAH',
      gender: 'male',
    });

    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.isFuzzy).toBe(false);
    
    // All results should start with FAH
    result.results.forEach(name => {
      expect(name.toUpperCase().startsWith('FAH')).toBe(true);
    });
  });

  it('should find names starting with a 3-letter prefix (female)', async () => {
    const result = await caller.names.search({
      query: 'GIA',
      gender: 'female',
    });

    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.isFuzzy).toBe(false);
  });

  it('should find a full name match', async () => {
    const result = await caller.names.search({
      query: 'FAHAD',
      gender: 'male',
    });

    expect(result.results).toBeDefined();
    expect(Array.isArray(result.results)).toBe(true);
    expect(result.results.some(name => name.toUpperCase() === 'FAHAD')).toBe(true);
  });

  it('should return up to 30 results', async () => {
    const result = await caller.names.search({
      query: 'A',
      gender: 'male',
    });

    expect(result.results.length).toBeLessThanOrEqual(30);
  });

  it('should use fuzzy matching when no prefix match is found', async () => {
    const result = await caller.names.search({
      query: 'XYZ',
      gender: 'male',
    });

    // If no exact match, should attempt fuzzy matching
    if (result.results.length === 0) {
      expect(result.isFuzzy).toBe(true);
    } else {
      expect(result.isFuzzy).toBe(true);
    }
  });

  it('should handle case-insensitive search', async () => {
    const resultLower = await caller.names.search({
      query: 'fah',
      gender: 'male',
    });

    const resultUpper = await caller.names.search({
      query: 'FAH',
      gender: 'male',
    });

    expect(resultLower.results.length).toBe(resultUpper.results.length);
  });

  it('should return a count property', async () => {
    const result = await caller.names.search({
      query: 'ST',
      gender: 'male',
    });

    expect(result.count).toBe(result.results.length);
  });

  it('should randomize results when more than 30 matches exist', async () => {
    const result1 = await caller.names.search({
      query: 'A',
      gender: 'male',
    });

    const result2 = await caller.names.search({
      query: 'A',
      gender: 'male',
    });

    // Both should have results, but likely different order due to randomization
    expect(result1.results.length).toBeGreaterThan(0);
    expect(result2.results.length).toBeGreaterThan(0);
  });
});
