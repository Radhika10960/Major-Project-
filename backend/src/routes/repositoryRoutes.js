import { Router } from 'express';
import { validateAnalyzeRequest } from '../validators/repositoryValidator.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';
import {
  analyzeRepository,
  getAnalysis,
  getAnalyses,
  getAnalysisLanguages,
  getAnalysisContributors,
} from '../controllers/repositoryController.js';

const router = Router();

// POST /api/repositories/analyze — start a new analysis
router.post(
  '/repositories/analyze',
  analysisLimiter,
  validateAnalyzeRequest,
  analyzeRepository
);

// GET /api/analyses — list paginated analysis history
router.get('/analyses', getAnalyses);

// GET /api/analyses/:id — full analysis detail
router.get('/analyses/:id', getAnalysis);

// GET /api/analyses/:id/languages — language stats only
router.get('/analyses/:id/languages', getAnalysisLanguages);

// GET /api/analyses/:id/contributors — contributor stats only
router.get('/analyses/:id/contributors', getAnalysisContributors);

export default router;
