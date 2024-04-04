import { z } from 'zod';
import { Flashcard } from '../models/index.js';

// schema de validation

const flashcardSchema = z.object({
    title: z.string().min(1),
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

    async getOne(req, res, next) {
        try {
            const flashcard = await Flashcard.findByPk(req.params.flashcardId);

            if (!flashcard) {
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
            const result = flashcardSchema.safeParse(req.body);
            if (!result.success) {
                res.status(400).json(result.error);
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
            // Récupération du deck spécifique à modifier
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
            // Update/modification du deck spécifique dont les données ont été validées
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
