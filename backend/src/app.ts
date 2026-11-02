import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import healthRouter from './routes/health.routes';
import expertRouter from './routes/expert.routes';
import candidateRouter from './routes/candidate.routes';
import interviewBoardRouter from './routes/interviewBoard.routes';
import resumeRouter from './routes/resume.routes';
import matchingRouter from './routes/matching.routes';

const app: Application = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded resume files securely
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Health Check Endpoint
app.use('/health', healthRouter);

// Domain API Routes
app.use('/api/experts', expertRouter);
app.use('/api/candidates', candidateRouter);
app.use('/api/interview-boards', interviewBoardRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/matching', matchingRouter);

// Root Endpoint
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    name: 'DRDO RAC Expert Relevance System API',
    version: '0.1.0',
    documentation:
      'GET /health for system health status, /api/experts for expert endpoints, /api/candidates for candidate endpoints, /api/interview-boards for interview board endpoints, /api/resumes for resume upload, /api/matching for matching engine'
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested route does not exist'
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

export default app;
