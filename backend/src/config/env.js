import dotenv from 'dotenv';

// Load .env file (no-op in production where vars are injected)
dotenv.config();

/**
 * Centralized environment configuration.
 * All env access goes through this module so missing/invalid
 * values are caught at startup rather than at runtime.
 */
const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pr-quality-reporter',

  githubToken: process.env.GITHUB_TOKEN || '',

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  cloneTimeoutMs: parseInt(process.env.CLONE_TIMEOUT_MS, 10) || 120000,
  maxConcurrentAnalyses: parseInt(process.env.MAX_CONCURRENT_ANALYSES, 10) || 2,
  maxRepoSizeMb: parseInt(process.env.MAX_REPO_SIZE_MB, 10) || 500,
  maxFileCount: parseInt(process.env.MAX_FILE_COUNT, 10) || 10000,
};

export default config;
