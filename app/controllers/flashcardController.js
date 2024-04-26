import { z } from 'zod';
import { Flashcard, Deck } from '../models/index.js';

// schema de validation

const flashcardSchema = z.object({
    deck_id: z.number(),
    title_front: z.string(),
    title_back: z.string(),
});

const flashcardController = {

    // cette méthode est-elle nécessaire du coup?
    async getAll(req, res) {
        const flashcards = await Flashcard.findAll();
        res.json(flashcards);
    },

    // cette méthode est-elle nécessaire du coup?
    async getOne(req, res, next) {
        const flashcard = await Flashcard.findByPk(req.params.flashcardId);
        const deck = await Deck.findByPk(req.params.deckdId);

        if (!flashcard || !deck) {
            // Si deck inexistant, on envoie une erreur et on passe au middleware suivant
            next();
        }
        res.status(200).json(flashcard);
    },

    async create(req, res) {
        const result = flashcardSchema.safeParse(req.body);
        console.log('result', result.error);
        if (!result.success) {
            res.status(400).json({ message: 'données non valides' });
        }
        // console.log(result);
        console.log('result.data', result.data);
        const deckOwner = await Deck.findByPk(result.data.deck_id);
        console.log('deckOwner====>', deckOwner);
        if (req.user.id !== deckOwner.user_id) {
            // Si l'utilisateur n'est pas le propriétaire du deck, retourner une erreur 403 (Forbidden)
            res.status(403).json({ error: 'Vous n\'êtes pas autorisé à ajouter une carte à ce deck.' });
        }
        const flashcard = await Flashcard.create(result.data);

        res.status(200).json(flashcard);
    },

    async update(req, res) {
        // Récupération de la flashcard spécifique à modifier
        const flashcard = await Flashcard.findByPk(req.params.flashcardId);
        if (!flashcard) {
            res.status(404).json({ message: 'La flashcard à modifier est introuvable' });
        }
        // Récupération du user qui a créer le deck
        const deckOwner = await Deck.findByPk(flashcard.dataValues.deck_id);
        // Si l'utilisateur n'est pas le propriétaire de la flashcard, retourner une erreur 403
        if (req.user.id !== deckOwner.user_id) {
            res.status(403).json({ message: 'Vous n\'avez pas les droits pour modifier cette flashcard' });
        }
        // Vérification de la validation des données créées
        const result = flashcardSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: 'données non valides' });
        }
        // Update/modification de la flahcard spécifique dont les données ont été validées
        await flashcard.update(result.data);
        res.status(200).json(flashcard);
    },

    async delete(req, res) {
        const flashcard = await Flashcard.findByPk(req.params.flashcardId);
        if (!flashcard) {
            res.status(404).json({ message: 'La flashcard à supprimer est introuvable' });
        }

        // Si l'utilisateur n'est pas le propriétaire de la flashcard, on supprimer seulement les clés étrangères dans la table d'association (deck_has_user)
        const deck = await Deck.findByPk(flashcard.deck_id);
        if (req.user.id !== deck.user_id) {
            res.status(403).json({ message: 'Vous n\'avez pas les droits pour modifier ce deck' });
        }

        await flashcard.destroy();
        res.status(200).json({ message: 'Flashcard supprimée' });
    },
};

export default flashcardController;
