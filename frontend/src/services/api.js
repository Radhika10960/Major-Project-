import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Submit repository for analysis.
 * @param {string} url
 */
export async function analyzeRepository(url) {
  const { data } = await apiClient.post('/repositories/analyze', { url });
  return data;
}

/**
 * Fetch full analysis details by ID.
 * @param {string} id
 */
export async function getAnalysis(id) {
  const { data } = await apiClient.get(`/analyses/${id}`);
  return data;
}

/**
 * Fetch paginated analysis history.
 * @param {number} [page=1]
 * @param {number} [limit=10]
 */
export async function getAnalyses(page = 1, limit = 10) {
  const { data } = await apiClient.get('/analyses', {
    params: { page, limit },
  });
  return data;
}

/**
 * Fetch language breakdown for an analysis.
 * @param {string} id
 */
export async function getAnalysisLanguages(id) {
  const { data } = await apiClient.get(`/analyses/${id}/languages`);
  return data;
}

/**
 * Fetch contributor statistics for an analysis.
 * @param {string} id
 */
export async function getAnalysisContributors(id) {
  const { data } = await apiClient.get(`/analyses/${id}/contributors`);
  return data;
}

/**
 * Fetch README summary for an analysis.
 * @param {string} id
 */
export async function getAnalysisReadme(id) {
  const { data } = await apiClient.get(`/analyses/${id}/readme`);
  return data;
}

/**
 * Check backend health.
 */
export async function checkHealth() {
  try {
    const { data } = await apiClient.get('/health');
    return data;
  } catch {
    return { success: false, data: { api: { status: 'offline' } } };
  }
}
