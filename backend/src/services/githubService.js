import axios from 'axios';
import config from '../config/env.js';
import { getLanguageExtensions } from '../utils/languageExtensions.js';

/**
 * GitHub REST API service.
 * Retrieves repository metadata from the public API.
 * Uses GITHUB_TOKEN when available to raise rate limits.
 */

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 15000,
  headers: {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'PR-Quality-Reporter/1.0',
    ...(config.githubToken && {
      Authorization: `Bearer ${config.githubToken}`,
    }),
  },
});

/**
 * Fetch full repository metadata from GitHub.
 * @param {string} owner - Repository owner
 * @param {string} repo  - Repository name
 * @returns {object} Normalised repository metadata
 */
export async function fetchRepositoryMetadata(owner, repo) {
  try {
    const { data } = await githubApi.get(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description || null,
      owner: {
        login: data.owner?.login,
        avatarUrl: data.owner?.avatar_url || null,
        profileUrl: data.owner?.html_url || null,
      },
      htmlUrl: data.html_url,
      cloneUrl: data.clone_url,
      defaultBranch: data.default_branch,
      language: data.language || null,
      stars: data.stargazers_count ?? 0,
      forks: data.forks_count ?? 0,
      openIssues: data.open_issues_count ?? 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      license: data.license
        ? {
            name: data.license.name,
            spdxId: data.license.spdx_id,
          }
        : null,
      visibility: data.visibility || (data.private ? 'private' : 'public'),
      archived: data.archived ?? false,
      disabled: data.disabled ?? false,
      size: data.size ?? 0, // in KB
      topics: data.topics || [],
    };
  } catch (err) {
    if (err.response) {
      const { status, headers } = err.response;

      if (status === 404) {
        const error = new Error(`Repository '${owner}/${repo}' not found on GitHub`);
        error.statusCode = 404;
        throw error;
      }

      if (status === 403 && headers['x-ratelimit-remaining'] === '0') {
        const resetTime = headers['x-ratelimit-reset'];
        const resetDate = resetTime
          ? new Date(parseInt(resetTime, 10) * 1000).toISOString()
          : 'unknown';

        const error = new Error(
          `GitHub API rate limit exceeded. Resets at ${resetDate}. ` +
          'Consider setting GITHUB_TOKEN in your environment.'
        );
        error.statusCode = 429;
        throw error;
      }

      if (status === 401) {
        const error = new Error('GitHub API authentication failed. Check your GITHUB_TOKEN.');
        error.statusCode = 401;
        throw error;
      }

      const error = new Error(`GitHub API returned ${status}: ${err.response.data?.message || 'Unknown error'}`);
      error.statusCode = status >= 500 ? 502 : status;
      throw error;
    }

    // Network / timeout errors
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      const error = new Error('GitHub API request timed out');
      error.statusCode = 504;
      throw error;
    }

    const error = new Error(`Failed to reach GitHub API: ${err.message}`);
    error.statusCode = 502;
    throw error;
  }
}

/**
 * Fetch contributors from the GitHub API.
 * Returns up to 100 contributors with commit counts.
 * @param {string} owner
 * @param {string} repo
 * @returns {Array}
 */
export async function fetchContributors(owner, repo) {
  try {
    const { data } = await githubApi.get(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors`,
      { params: { per_page: 100 } }
    );

    return (data || []).map((c) => ({
      login: c.login,
      avatarUrl: c.avatar_url || null,
      profileUrl: c.html_url || null,
      contributions: c.contributions ?? 0,
      commits: c.contributions ?? 0,
    }));
  } catch (err) {
    // Non-critical — return empty array and log
    console.warn(`[GitHub] Could not fetch contributors for ${owner}/${repo}:`, err.message);
    return [];
  }
}

/**
 * Fetch language byte breakdown from GitHub API.
 * Calculates byte counts, percentages, and standard extensions.
 * @param {string} owner
 * @param {string} repo
 * @returns {Array<object>}
 */
export async function fetchRepositoryLanguages(owner, repo) {
  try {
    const { data } = await githubApi.get(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`
    );

    if (!data || typeof data !== 'object') return [];

    const totalBytes = Object.values(data).reduce((acc, bytes) => acc + (bytes || 0), 0);

    return Object.entries(data).map(([language, bytes]) => ({
      language,
      totalBytes: bytes,
      totalLines: 0,
      fileCount: 0,
      percentage: totalBytes > 0 ? Number(((bytes / totalBytes) * 100).toFixed(2)) : 0,
      extensions: getLanguageExtensions(language),
    }));
  } catch (err) {
    console.warn(`[GitHub] Could not fetch languages for ${owner}/${repo}:`, err.message);
    return [];
  }
}

/**
 * Fetch raw README content and metadata.
 * Returns null if no README exists or if request fails.
 * @param {string} owner
 * @param {string} repo
 * @returns {object|null}
 */
export async function fetchRepositoryReadme(owner, repo) {
  try {
    const { data } = await githubApi.get(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/readme`
    );

    if (!data?.content) return null;

    const rawContent = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
      filename: data.name || 'README.md',
      rawContent,
      size: data.size || rawContent.length,
      path: data.path || 'README.md',
    };
  } catch (err) {
    if (err.response?.status !== 404) {
      console.warn(`[GitHub] Could not fetch README for ${owner}/${repo}:`, err.message);
    }
    return null;
  }
}

/**
 * Fetch repository contents (directory list or file).
 * Defaults to root directory ('').
 * @param {string} owner
 * @param {string} repo
 * @param {string} [path='']
 * @returns {Array<object>}
 */
export async function fetchRepositoryContents(owner, repo, path = '') {
  try {
    const endpoint = path
      ? `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`
      : `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents`;

    const { data } = await githubApi.get(endpoint);

    if (Array.isArray(data)) {
      return data.map((item) => ({
        name: item.name,
        path: item.path,
        type: item.type, // 'file' | 'dir'
        size: item.size || 0,
      }));
    }

    return [];
  } catch (err) {
    console.warn(`[GitHub] Could not fetch contents for ${owner}/${repo} at '${path}':`, err.message);
    return [];
  }
}

/**
 * Fetch and decode text file content from repository.
 * @param {string} owner
 * @param {string} repo
 * @param {string} filePath
 * @returns {string|null}
 */
export async function fetchFileContent(owner, repo, filePath) {
  try {
    const { data } = await githubApi.get(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(filePath)}`
    );

    if (data?.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch weekly commit activity stats for the repository.
 * @param {string} owner
 * @param {string} repo
 * @returns {Array<{ week: Date, commits: number }>}
 */
export async function fetchCommitActivity(owner, repo) {
  try {
    const { data } = await githubApi.get(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/stats/commit_activity`
    );

    if (Array.isArray(data)) {
      return data.slice(-26).map((item) => ({
        week: new Date(item.week * 1000),
        commits: item.total ?? 0,
      }));
    }

    return [];
  } catch (err) {
    console.warn(`[GitHub] Could not fetch commit activity for ${owner}/${repo}:`, err.message);
    return [];
  }
}

/**
 * Check remaining API rate limit.
 * Useful for diagnostics and the health endpoint.
 */
export async function getRateLimit() {
  try {
    const { data } = await githubApi.get('/rate_limit');
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}
async function fetchRepositoryTree(owner, repo, branch) {
  // Use the same request helper/headers (token, etc.) as your other fetch functions
  const data = await githubGet(
    `/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`
  );
  return {
    entries: data.tree.map(({ path, type, size }) => ({ path, type, size })),
    truncated: data.truncated === true,
  };
}
