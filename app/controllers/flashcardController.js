import { z } from 'zod';
import { Flashcard, Deck } from '../models/index.js';
import ApiError from '../errors/apiError.js';

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
    async getOne(req, res) {
        const flashcard = await Flashcard.findByPk(req.params.flashcardId);
        const deck = await Deck.findByPk(req.params.deckdId);

        if (!flashcard || !deck) {
            throw new ApiError(404, { message: 'Flashcard not found' });
        }
        res.status(200).json(flashcard);
    },

    async create(req, res) {
        const result = flashcardSchema.safeParse(req.body);
        console.log('result', result.error);
        if (!result.success) {
            throw new ApiError(400, { message: 'invalid data' });
        }

        const deckOwner = await Deck.findByPk(result.data.deck_id);
        if (req.user.id !== deckOwner.user_id) {
            // Si l'utilisateur n'est pas le propriétaire du deck, retourner une erreur 403 (Forbidden)
            throw new ApiError(403, { message: 'You are not allowed to add a card to this deck' });
        }
        const flashcard = await Flashcard.create(result.data);

        res.status(200).json(flashcard);
    },

    async update(req, res) {
        // Récupération de la flashcard spécifique à modifier
        const flashcard = await Flashcard.findByPk(req.params.flashcardId);
        if (!flashcard) {
            throw new ApiError(404, { message: 'Flashcard not found' });
        }
        // Récupération du user qui a créer le deck
        const deckOwner = await Deck.findByPk(flashcard.dataValues.deck_id);
        // Si l'utilisateur n'est pas le propriétaire de la flashcard, retourner une erreur 403
        if (req.user.id !== deckOwner.user_id) {
            throw new ApiError(403, { message: 'You do not have the rights to modify this flashcard' });
        }
        // Vérification de la validation des données créées
        const result = flashcardSchema.safeParse(req.body);
        if (!result.success) {
            throw new ApiError(400, { message: 'invalid data' });
        }
        // Update/modification de la flahcard spécifique dont les données ont été validées
        await flashcard.update(result.data);
        res.status(200).json(flashcard);
    },

    async delete(req, res) {
        const flashcard = await Flashcard.findByPk(req.params.flashcardId);
        if (!flashcard) {
            throw new ApiError(404, { message: 'Flashcard not found' });
        }

        // Si l'utilisateur n'est pas le propriétaire de la flashcard, on supprimer seulement les clés étrangères dans la table d'association (deck_has_user)
        const deck = await Deck.findByPk(flashcard.deck_id);
        if (req.user.id !== deck.user_id) {
            throw new ApiError(403, { message: 'You do not have the rights to modify this deck' });
        }

        await flashcard.destroy();
        res.status(200).json({ message: 'Flashcard supprimée' });
    },
};

export default flashcardController;
