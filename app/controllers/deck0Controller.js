import { z } from 'zod';
import { Deck } from '../models/index.js';

// schema de validation

const deckSchema = z.object({
    title: z.string().min(1),
});

const deckController = {

    async getAll(req, res) {
        try {
            const decks = await Deck.findAll();
            res.json(decks);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    },

    async getOne(req, res, next) {
        try {
            // Récupération d'un deck en associant les flashcards liées à son Id
            const deckId = req.params.deckId;
            const deck = await Deck.findOne({
                where: {
                    id: deckId,
                },
                include: 'flashcards',
            });

            // OU appeler toutes les flashcards lesquelles sont alors filtrées par deckId récupéré dans le params.

            /*    const deckId = req.params.deckId;

            const flashcards = await Flashcard.findAll({
                where: {
                    deck_id: deckId,
                },
                include: 'deck',
            }); */

            if (!deck) {
                // Si deck inexistant, on envoie une erreur et on passe au middleware suivant
                next();
                return;
            }
            // res status 200

            res.json(deck);
            // res.status(200).send('deck spécifique récupéré');  --> provoque erreur ERR_HTTP_HEADERS_SENT

            // res.json(flashcards);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    },

    /*  async create(req, res) {
        try {
            // Vérification de la validation des données créées
            const result = deckSchema.safeParse(req.body);
            // Si elles ne correspondent pas au schema de validation, retourne erreur
            if (!result.success) {
                res.status(400).json(result.error);
                return;
            }
            // Sinon création d'un nouveau deck dont les données sont validées
            const deck = await Deck.create(result.data);

            // deck créé renvoyé au client
            res.json(deck);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    }, */

    async create(req, res) {
        try {
            const newDeck = req.body;
            const deck = await Deck.create(newDeck);
            res.json(deck);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    },

    async update(req, res) {
        try {
            // Récupération du deck spécifique à modifier
            const deck = await Deck.findByPk(req.params.id);
            if (!deck) {
                res.status(404).send('Le deck à modifier est introuvable');
                return;
            }
            // Vérification de la validation des données créées
            const result = deckSchema.safeParse(req.body);
            if (!result.success) {
                res.status(400).send('');
            }
            // Update/modification du deck spécifique dont les données ont été validées
            await deck.update(result.data);
            res.json(deck);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    async delete(req, res) {
        try {
            const deck = await Deck.findByPk(req.params.id);
            if (!deck) {
                res.status(404).send('Le deck à supprimer est introuvable');
                return;
            }
            await deck.destroy();
            res.send('Deck supprimé');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

};

export default deckController;
