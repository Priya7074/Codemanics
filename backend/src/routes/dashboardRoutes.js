import express from 'express';
import {
  getOverview,
  getRiskDistribution,
  getTrends,
  getHighRiskCases,
  getRecentAssessments,
} from '../controllers/dashboardController.js';
import { rbacMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require officer or admin role
router.use(rbacMiddleware(['authorized_officer', 'admin']));

router.get('/overview', getOverview);
router.get('/risk-distribution', getRiskDistribution);
router.get('/trends', getTrends);
router.get('/high-risk', getHighRiskCases);
router.get('/recent-assessments', getRecentAssessments);

export default router;
