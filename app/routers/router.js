import { Router } from 'express';
import deckController from '../controllers/deckController.js';
import flashcardController from '../controllers/flashcardController.js';
import authController from '../controllers/authController.js';
import authJwt from '../middlewares/authJwt.js';
import statsController from '../controllers/statsController.js';
import errorHandler from '../middlewares/errorHandler.js';

const router = Router();

router.get('/api/decks/test'); // Récupération du deck d'essai (deck de test)
router.get('/api/decks', authJwt, errorHandler(deckController.getAll)); // Récupérer tous les decks du User
router.get('/api/decks/:deckId', authJwt, errorHandler(deckController.getOne)); // Récupérer un deck spécifique via son ID + récup toutes ses flashcards
router.post('/api/decks', authJwt, errorHandler(deckController.create)); // Créer un deck
router.patch('/api/decks/:deckId', authJwt, errorHandler(deckController.update)); // Mettre à jour un deck
router.delete('/api/decks/:deckId', authJwt, errorHandler(deckController.delete)); // Supprimer un deck spécifique
router.get('/api/decks/share/:shareId', authJwt, errorHandler(deckController.getOneShared)); // Récupérer un deck spécifique via son share_id

router.post('/api/flashcards', authJwt, errorHandler(flashcardController.create)); // Créer une flashcard
router.patch('/api/flashcards/:flashcardId', authJwt, errorHandler(flashcardController.update)); // Modifier une flashcard depuis son ID (DECK ID OBLIGATOIRE)
router.delete('/api/flashcards/:flashcardId', authJwt, errorHandler(flashcardController.delete)); // Supprimer une flashcard spécifique

//! a voir avec front, si besoin d'autant de routes!!
router.get('/api/stats', authJwt, errorHandler(statsController.getAll)); // Récupérer les stats de tous les decks confondus pour l'utilisateur
router.get('/api/decks/:deckId/stats', authJwt, errorHandler(statsController.getByDeck)); // Récupérer les stats d'un deck
// router.get('/api/stats/:statsId', authJwt, errorHandler(statsController.getOne)); // Récupérer la stats par son Id de la stat (par utilisateur)
router.post('/api/decks/:deckId/stats', authJwt, errorHandler(statsController.create)); // initialiser un MemoTest (on associe une nouvelle stat à un deck)
router.patch('/api/stats/:statsId', authJwt, errorHandler(statsController.update)); // route d'incrémentation depuis la page MemoTest  // ! a voir si besoin update
router.delete('/api/stats/:statsId', authJwt, errorHandler(statsController.delete)); // supprimer une stats par son Id (par utilisateur)  // ! certainement pas besoin

// route login et génération du token
router.post('/api/auth/login', errorHandler(authController.login));

// route pour créer un user et générer le token
router.post('/api/auth/signup', errorHandler(authController.create));

router.get('/api/profile', authJwt, errorHandler(authController.getOne));
router.patch('/api/profile', authJwt, errorHandler(authController.update));
router.delete('/api/profile', authJwt, errorHandler(authController.delete));

export default router;
