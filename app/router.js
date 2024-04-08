import { Router } from 'express';
// import jwt from 'jsonwebtoken';
import authController from './controllers/authController.js';
// import userController from './controllers/userController.js';
import authJwt from './middlewares/authJwt.js';

const router = Router();

// route login et génération du token
router.post('/api/auth/login', authController.login);

// route pour créer un user et générer le token
router.post('/api/auth/signup', authController.create);

// route profile avec vérification du token
router.get('/api/profile', authJwt, authController.getOne);
router.patch('/api/profile', authJwt, authController.update);
router.delete('/api/profile', authJwt, authController.delete);

export default router;
