import { Router, Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database';

const router: Router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'DRDO RAC Expert Relevance System Backend',
    environment: process.env.NODE_ENV || 'development',
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
