import { Router } from 'express';
// import jwt from 'jsonwebtoken';
import authController from './controllers/authController.js';

const router = Router();

router.post('/api/login', authController.login);

export default router;
