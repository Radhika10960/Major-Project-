import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// --------------- Global Middleware ---------------

// CORS — allow requests from the frontend dev server
app.use(cors({
  origin: config.frontendUrl,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Rate limiting
app.use('/api', apiLimiter);

// --------------- Routes ---------------

app.use('/api', routes);

// --------------- Error Handling ---------------

// Catch-all for unmatched routes (must come after routes)
app.use(notFoundHandler);

// Centralised error handler (must be last)
app.use(errorHandler);

export default app;
