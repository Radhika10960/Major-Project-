/**
 * GitHub URL parsing and validation utilities.
 * Extracts owner/repo from various GitHub URL formats
 * and restricts to github.com only (SSRF prevention).
 */

// Strict pattern: only github.com, owner and repo segments
const GITHUB_URL_REGEX =
  /^https?:\/\/(www\.)?github\.com\/(?<owner>[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?)\/(?<repo>[a-zA-Z0-9._-]+?)(?:\.git)?(?:\/.*)?$/;

/**
 * Parse a GitHub URL and extract owner + repo name.
 * Returns { owner, repo } or null if the URL is invalid.
 *
 * Accepted formats:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo.git
 *   https://github.com/owner/repo/tree/main
 *   http://www.github.com/owner/repo
 */
export function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();
  const match = trimmed.match(GITHUB_URL_REGEX);

  if (!match?.groups) return null;

  const { owner, repo } = match.groups;

  // Additional safety: reject suspiciously long segments
  if (owner.length > 39 || repo.length > 100) return null;

  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    cloneUrl: `https://github.com/${owner}/${repo}.git`,
    apiUrl: `https://api.github.com/repos/${owner}/${repo}`,
  };
}

/**
 * Normalise a GitHub URL to its canonical form.
 */
export function normalizeGitHubUrl(url) {
  const parsed = parseGitHubUrl(url);
  if (!parsed) return null;
  return `https://github.com/${parsed.owner}/${parsed.repo}`;
}
