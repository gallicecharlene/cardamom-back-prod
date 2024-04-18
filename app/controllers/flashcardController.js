import { z } from 'zod';
import { Flashcard, Deck } from '../models/index.js';

// schema de validation

const flashcardSchema = z.object({
    deck_id: z.number(),
    title_front: z.string().min(1),
    title_back: z.string().min(1),
});

const flashcardController = {

    // cette méthode est-elle nécessaire du coup?
    async getAll(req, res) {
        try {
            const flashcards = await Flashcard.findAll();
            res.json(flashcards);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // cette méthode est-elle nécessaire du coup?
    async getOne(req, res, next) {
        try {
            const flashcard = await Flashcard.findByPk(req.params.flashcardId);
            const deck = await Deck.findByPk(req.params.deckdId);

            if (!flashcard || !deck) {
                // Si deck inexistant, on envoie une erreur et on passe au middleware suivant
                next();
                return;
            }
            res.json(flashcard);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    },

    async create(req, res) {
        try {
            const result = flashcardSchema.safeParse(req.body); // le body doit au moins contenir title_front title_back et le deck_id
            if (!result.success) {
                res.status(400).json(result.error);
                return;
            }
            const deckOwner = await Deck.findByPk(result.data.deck_id);
            console.log('deckOwner====>', deckOwner);
            if (req.user.id !== deckOwner.user_id) {
                // Si l'utilisateur n'est pas le propriétaire du deck, retourner une erreur 403 (Forbidden)
                res.status(403).json({ error: 'Vous n\'êtes pas autorisé à ajouter une carte à ce deck.' });
                return;
            }
            const flashcard = await Flashcard.create(result.data);

            res.json(flashcard);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    },

    async update(req, res) {
        try {
            // Récupération de la flashcard spécifique à modifier
            const flashcard = await Flashcard.findByPk(req.params.flashcardId);
            if (!flashcard) {
                res.status(404).send('La flashcard à modifier est introuvable');
                return;
            }
            // Vérification de la validation des données créées
            const result = flashcardSchema.safeParse(req.body);
            if (!result.success) {
                res.status(400).send('');
            }
            // Update/modification de la flahcard spécifique dont les données ont été validées
            await flashcard.update(result.data);
            res.json(flashcard);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    async delete(req, res) {
        try {
            const flashcard = await Flashcard.findByPk(req.params.flashcardId);
            if (!flashcard) {
                res.status(404).send('La flashcard à supprimer est introuvable');
                return;
            }
            await flashcard.destroy();
            res.send('Flashcard supprimée');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },
};

export default flashcardController;
