import { Router } from 'express';
// import jwt from 'jsonwebtoken';
import authController from './controllers/authController.js';
import userController from './controllers/userController.js';
import authJwt from './middlewares/authJwt.js';

const router = Router();

// route login et génération du token
router.post('/api/auth/login', authController.login);

// route pour créer un user
router.post('/api/profile', userController.create);

// route profile avec vérification du token
router.get('/api/profile/:userId', authJwt, userController.getOne);
router.patch('/api/profile/:userId', authJwt, userController.update);
router.delete('/api/profile/:userId', authJwt, userController.delete);

export default router;
