import { describe, it, expect } from '@jest/globals';
import { analyzeRepositorySchema } from '../src/validators/repositoryValidator.js';

describe('Repository Request Validator', () => {
  it('accepts valid GitHub repository URLs', () => {
    const validUrls = [
      'https://github.com/facebook/react',
      'https://www.github.com/expressjs/express',
      'https://github.com/owner/repo.git',
      'https://github.com/owner/repo/tree/main',
    ];

    for (const url of validUrls) {
      const result = analyzeRepositorySchema.safeParse({ url });
      expect(result.success).toBe(true);
    }
  });

  it('rejects non-GitHub or invalid URLs', () => {
    const invalidInputs = [
      { url: 'https://gitlab.com/owner/repo' },
      { url: 'https://bitbucket.org/owner/repo' },
      { url: 'not-a-valid-url' },
      { url: '' },
      {},
    ];

    for (const input of invalidInputs) {
      const result = analyzeRepositorySchema.safeParse(input);
      expect(result.success).toBe(false);
    }
  });
});
