import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import repositoryRoutes from './repositoryRoutes.js';

const router = Router();

// Mount sub-routers
router.use('/health', healthRoutes);
router.use('/', repositoryRoutes);

export default router;
