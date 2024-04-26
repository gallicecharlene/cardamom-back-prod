import { z } from 'zod';
import { Deck } from '../models/index.js';

// schema de validation

const deckSchema = z.object({
    title: z.string().min(1),
});

const deckController = {

    async getAll(req, res) {
        // try {
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

        res.status(200).json(allDecks);
    },

    async getOne(req, res, next) {
        // Récupération d'un deck en associant les flashcards liées à son Id
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
        }

        res.status(200).json(deck);
    },

    async create(req, res) {
        // Vérification de la validation des données créées
        const userId = req.user.id;
        const result = deckSchema.safeParse(req.body);
        // Si elles ne correspondent pas au schema de validation, retourne erreur
        if (!result.success) {
            res.status(400).json({ message: 'données non valides' }); // ou json(result.error);
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

        res.status(200).json(deck);
    },

    async update(req, res) {
        const userId = req.user.id;
        // Récupération du deck spécifique à modifier
        const deck = await Deck.findByPk(req.params.deckId);
        if (!deck) {
            res.status(404).json({ message: 'Le deck à modifier est introuvable' });
        }

        // Si l'utilisateur n'est pas le propriétaire du deck, retourner une erreur 403
        if (req.user.id !== deck.user_id) {
            res.status(403).json({ message: 'Vous n\'avez pas les droits pour modifier ce deck' });
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
        res.status(200).json(deck);
    },

    async delete(req, res) {
        const deck = await Deck.findByPk(req.params.deckId);
        if (!deck) {
            res.status(404).json({ message: 'Le deck à supprimer est introuvable' });
        }
        // Si l'utilisateur n'est pas le propriétaire du deck, on supprimer seulement les clés étrangères dans la table d'association (deck_has_user)
        if (req.user.id !== deck.user_id) {
            const user = req.user;
            await user.removeImportedDeck(deck);
            res.status(200).json({ message: 'Deck supprimé' });
        }
        await deck.destroy();
        res.status(200).json({ message: 'Deck supprimé' });
    },

    async getOneShared(req, res) {
        // Récupération du deck partagé associé au share_id
        const shareId = req.params.shareId;
        const deckShared = await Deck.findOne({
            where: {
                share_id: shareId,
            },
            include: 'flashcards',
        });

        if (!deckShared) {
            res.status(404).json({ message: 'Le deck partagé est introuvable' });
        }

        // Récupération de l'utilisateur actuel qui récupère le deck
        const newUser = req.user;

        // Ajout de l'association entre le nouvel utilisateur et le deck partagé
        await newUser.addImportedDeck(deckShared);

        res.status(200).json(deckShared);
    },
};

export default deckController;
