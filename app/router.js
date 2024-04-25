import { Router } from 'express';
import deckController from './controllers/deckController.js';
import flashcardController from './controllers/flashcardController.js';
import authController from './controllers/authController.js';
import authJwt from './middlewares/authJwt.js';
import statsController from './controllers/statsController.js';

const router = Router();

// route profile avec vérification du token

router.get('/api/decks/test'); // Récupération du deck d'essai (deck de test)
router.get('/api/decks', authJwt, deckController.getAll); // Récupérer tous les decks du User
router.get('/api/decks/:deckId', authJwt, deckController.getOne); // Récupérer un deck spécifique via son ID + récup toutes ses flashcards
router.post('/api/decks', authJwt, deckController.create); // Créer un deck
router.patch('/api/decks/:deckId', authJwt, deckController.update); // Mettre à jour un deck
router.delete('/api/decks/:deckId', authJwt, deckController.delete); // Supprimer un deck spécifique
router.get('/api/decks/share/:shareId', authJwt, deckController.getOneShared); // Récupérer un deck spécifique via son share_id

router.post('/api/flashcards', authJwt, flashcardController.create); // Créer une flashcard
router.patch('/api/flashcards/:flashcardId', authJwt, flashcardController.update); // Modifier une flashcard depuis son ID (DECK ID OBLIGATOIRE)
router.delete('/api/flashcards/:flashcardId', authJwt, flashcardController.delete); // Supprimer une flashcard spécifique

router.get('/api/stats', authJwt, statsController.getAll); // Récupérer les stats de tous les decks confondus pour l'utilisateur
router.get('/api/stats/:statsId', authJwt, statsController.getOne); // Récupérer la stats par son Id (par utilisateur)
router.patch('/api/stats/:statsId', authJwt, statsController.update); // route d'incrémentation depuis la page MemoTest
router.delete('/api/stats/:statsId', authJwt, statsController.delete); // supprimer une stats par son Id (par utilisateur)
router.get('/api/decks/:deckId/stats', authJwt, statsController.getByDeck); // Récupérer les stats d'un deck
router.post('/api/decks/:deckId/stats', authJwt, statsController.create); // initialiser un MemoTest (on associe une nouvelle stat à un deck)

// route login et génération du token
router.post('/api/auth/login', authController.login);

// route pour créer un user et générer le token
router.post('/api/auth/signup', authController.create);

router.get('/api/profile', authJwt, authController.getOne);
router.patch('/api/profile', authJwt, authController.update);
router.delete('/api/profile', authJwt, authController.delete);

// + la route modifier les stats (au vu de l'appel API depuis l'UserFlow)
// + la route récupérer une flashcard
// + la route récupérer toutes les flashcard d'un deck? ou bien pareil que récupérer le deck. <-- simplification des reqûetes en utilisant le deck.

export default router;
