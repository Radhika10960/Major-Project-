import { describe, it, expect } from '@jest/globals';
import { parseGitHubUrl, normalizeGitHubUrl } from '../src/utils/urlParser.js';

describe('GitHub URL Parser', () => {
  it('parses standard https repository URL', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react');
    expect(result).toEqual({
      owner: 'facebook',
      repo: 'react',
      fullName: 'facebook/react',
      cloneUrl: 'https://github.com/facebook/react.git',
      apiUrl: 'https://api.github.com/repos/facebook/react',
    });
  });

  it('parses URL with .git extension', () => {
    const result = parseGitHubUrl('https://github.com/expressjs/express.git');
    expect(result).toEqual({
      owner: 'expressjs',
      repo: 'express',
      fullName: 'expressjs/express',
      cloneUrl: 'https://github.com/expressjs/express.git',
      apiUrl: 'https://api.github.com/repos/expressjs/express',
    });
  });

  it('parses URL with sub-path such as /tree/main', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo/tree/main');
    expect(result).toEqual({
      owner: 'owner',
      repo: 'repo',
      fullName: 'owner/repo',
      cloneUrl: 'https://github.com/owner/repo.git',
      apiUrl: 'https://api.github.com/repos/owner/repo',
    });
  });

  it('normalizes GitHub URL to canonical format', () => {
    expect(normalizeGitHubUrl('https://github.com/owner/repo.git/')).toBe('https://github.com/owner/repo');
    expect(normalizeGitHubUrl('https://github.com/owner/repo/tree/main')).toBe('https://github.com/owner/repo');
  });

  it('rejects invalid or malicious URLs', () => {
    expect(parseGitHubUrl('https://gitlab.com/owner/repo')).toBeNull();
    expect(parseGitHubUrl('https://malicious.site/github.com/owner/repo')).toBeNull();
    expect(parseGitHubUrl('not-a-url')).toBeNull();
    expect(parseGitHubUrl('')).toBeNull();
    expect(parseGitHubUrl(null)).toBeNull();
  });
});
