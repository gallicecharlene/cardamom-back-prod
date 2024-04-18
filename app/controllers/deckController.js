import { z } from 'zod';
import { Deck } from '../models/index.js';

// schema de validation

const deckSchema = z.object({
    title: z.string().min(1),
});

const deckController = {

    async getAll(req, res) {
        try {
            const userId = req.user.id;
            const decks = await Deck.findAll({
                where: {
                    user_id: userId,
                },
            });
            // Récupérez tous les decks importés par l'utilisateur
            const importedDecks = await req.user.getImportedDecks();

            // Fusionnez les decks récupérés avec les decks importés
            const allDecks = [...decks, ...importedDecks];

            res.json(allDecks);
            // res.json(decks);
        } catch (error) {
            console.trace(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async getOne(req, res, next) {
        try {
            // Récupération d'un deck en associant les flashcards liées à son Id
            const userId = req.user.id;
            const deckId = req.params.deckId;
            const deck = await Deck.findOne({
                where: {
                    id: deckId,
                },
                include: ['flashcards', 'users'],
            });

            if (!deck || (deck.user_id !== req.user.id && !deck.users.find((user) => req.user.id === user.id))) {
                // Si deck inexistant, on envoie une erreur et on passe au middleware suivant
                next();
                return;
            }

            res.status(200).json(deck);
        } catch (error) {
            console.trace(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async create(req, res) {
        try {
            // Vérification de la validation des données créées
            const userId = req.user.id;
            const result = deckSchema.safeParse(req.body);
            // Si elles ne correspondent pas au schema de validation, retourne erreur
            if (!result.success) {
                res.status(400).json({ message: 'données non valides' }); // ou json(result.error);
                return;
            }

            const codeDate = Date.now();
            const codeShareId = `${codeDate}${userId}`;
            codeShareId.concat(...codeShareId);

            // Sinon création d'un nouveau deck dont les données sont validées
            const deck = await Deck.create({
                title: result.data.title,
                user_id: userId,
                share_id: codeShareId,
            });

            // deck créé renvoyé au client
            res.json(deck);
        } catch (error) {
            console.trace(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async update(req, res) {
        try {
            const userId = req.user.id;
            // Récupération du deck spécifique à modifier
            const deck = await Deck.findByPk(req.params.deckId);
            if (!deck) {
                res.status(404).json({ message: 'Le deck à modifier est introuvable' });
                return;
            }

            // ! a tester avec front pour être sur que ça marche!!
            if (req.user.id !== deck.user_id) {
                res.status(403).json({ message: 'Vous n\'avez pas les droits pour modifier ce deck' });
                return;
            }
            // Vérification de la validation des données créées
            const result = deckSchema.safeParse(req.body);
            if (!result.success) {
                res.status(400).json({ message: 'données non valides' });
            }
            // Update/modification du deck spécifique dont les données ont été validées
            await deck.update({
                title: result.data.title,
                user_id: userId,
            });
            res.json(deck);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async delete(req, res) {
        try {
            const deck = await Deck.findByPk(req.params.deckId);
            if (!deck) {
                res.status(404).json({ message: 'Le deck à supprimer est introuvable' });
                return;
            }
            // Si l'utilisateur n'est pas le propriétaire du deck, on envoie une erreur et on passe au middleware suivant
            if (req.user.id !== deck.user_id) {
                const user = req.user;
                await user.removeImportedDeck(deck);
                res.status(200).json({ message: 'Deck supprimé' });
                return;
            }
            await deck.destroy();
            res.status(200).json({ message: 'Deck supprimé' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async getOneShared(req, res, next) {
        try {
            // Récupération du deck partagé associé au share_id
            const shareId = req.params.shareId;
            const deckShared = await Deck.findOne({
                where: {
                    share_id: shareId,
                },
                include: 'flashcards',
            });

            if (!deckShared) {
                // Si le deck n'existe pas, passez au middleware suivant
                next();
                return;
            }

            // Récupération de l'utilisateur actuel qui récupère le deck
            const newUser = req.user;

            // Ajout de l'association entre le nouvel utilisateur et le deck partagé
            await newUser.addImportedDeck(deckShared);

            res.status(200).json(deckShared);
        } catch (error) {
            console.trace(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

export default deckController;
