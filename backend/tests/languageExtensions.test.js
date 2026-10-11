import { describe, it, expect } from '@jest/globals';
import { getLanguageExtensions } from '../src/utils/languageExtensions.js';

describe('Language Extensions Utility', () => {
  it('returns standard extensions for JavaScript', () => {
    const ext = getLanguageExtensions('JavaScript');
    expect(ext).toContain('.js');
    expect(ext).toContain('.jsx');
  });

  it('returns standard extensions for Python', () => {
    const ext = getLanguageExtensions('Python');
    expect(ext).toContain('.py');
  });

  it('returns standard extensions for TypeScript', () => {
    const ext = getLanguageExtensions('TypeScript');
    expect(ext).toContain('.ts');
    expect(ext).toContain('.tsx');
  });

  it('returns fallback extension for unknown languages', () => {
    const ext = getLanguageExtensions('Zig');
    expect(ext).toEqual(['.zig']);
  });

  it('handles null/empty gracefully', () => {
    expect(getLanguageExtensions('')).toEqual([]);
    expect(getLanguageExtensions(null)).toEqual([]);
  });
});
