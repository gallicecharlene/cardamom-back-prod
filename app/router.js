import { Router } from 'express';
import jwt from 'jsonwebtoken';
import deckController from './controllers/deckController.js';
import flashcardController from './controllers/flashcardController.js';

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});
router.get('/jwt', (req, res) => {
    const createToken = (jsonData = {}) => {
        try {
            const secretKey = 'test';
            const token = jwt.sign(jsonData, secretKey);
            return token;
        } catch (error) {
            console.log('error', error.message);
            return null;
        }
    };

    const jsonData = { email: 'test@test.fr', password: 'test1234' }; // req.body
    const token = createToken(jsonData);

    if (token) {
        res.json({ status: true, token });
    }
    res.json({ status: false });
});

router.get('/api/decks/test'); // Récupération du deck d'essai (deck de test)  -------- Comment gérer la récup d'un deck sans user?
router.get('/api/decks', deckController.getAll); // Récupérer tous les decks du User
router.get('/api/decks/:deckId', deckController.getOne); // Récupérer un deck spécifique via son ID + récup toutes ses flashcards
router.post('/api/decks', deckController.create); // Créer un deck
router.patch('/api/decks/:deckId', deckController.update); // Mettre à jour un deck
router.delete('/api/decks/:deckId', deckController.delete); // Supprimer un deck spécifique

router.post('/api/flashcards', flashcardController.create); // Créer une flashcard
router.patch('/api/flashcards/:flashcardsId', flashcardController.update); // Modifier une flashcard depuis son ID (DECK ID OBLIGATOIRE)
router.delete('/api/flashcards/:flashcardsId', flashcardController.delete); // Supprimer une flashcard spécifique

router.get('/api/stats'); // Récupérer les stats de tous les decks confondus
router.get('/api/decks/:deckId/stats'); // Récupérer les stats d'un deck

router.post('/api/auth/login'); // Se connecter
router.post('/api/auth/signup'); // S'inscrire

router.get('/api/profil'); // Récupérer sa page de profil
router.patch('/api/profil'); // Modifier son profil
router.delete('/api/profil'); // Supprimer son profil

// + la route modifier les stats (au vu de l'appel API depuis l'UserFlow)
// + la route récupérer une flashcard
// + la route récupérer toutes les flashcard d'un deck? ou bien pareil que récupérer le deck. <-- simplification des reqûetes en utilisant le deck.

export default router;
