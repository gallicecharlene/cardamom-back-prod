import { z } from 'zod';
import { Deck, Stats } from '../models/index.js';
import ApiError from '../errors/apiError.js';

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
            include: { association: 'stats_deck' },
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
            next(new ApiError(404, { message: 'Deck not found' }));
        }

        res.status(200).json(deck);
    },

    async create(req, res) {
        // Récupération de l'utilisateur actuel (token)
        const userId = req.user.id;
        // Vérification de la validation des données créées
        const result = deckSchema.safeParse(req.body);
        // Si elles ne correspondent pas au schema de validation, retourne erreur
        if (!result.success) {
            throw new ApiError(400, { message: 'Please fill in all fields' });
        }

        const codeDate = Date.now();
        const codeShareId = `${codeDate}${userId}`;
        // codeShareId.concat(...codeShareId);

        // Sinon création d'un nouveau deck dont les données sont validées
        const deck = await Deck.create({
            title: result.data.title,
            user_id: userId,
            share_id: codeShareId,
        });

        res.status(201).json(deck);
    },

    async update(req, res) {
        const userId = req.user.id;
        // Récupération du deck spécifique à modifier
        const deck = await Deck.findByPk(req.params.deckId);
        if (!deck) {
            throw new ApiError(404, { message: 'Deck not found' });
        }

        // Si l'utilisateur n'est pas le propriétaire du deck, retourner une erreur 403
        if (req.user.id !== deck.user_id) {
            throw new ApiError(400, { message: 'You do not have the rights to modify this deck' });
        }

        // Vérification de la validation des données créées
        const result = deckSchema.safeParse(req.body);
        if (!result.success) {
            throw new ApiError(400, { message: 'invalid data' });
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
            throw new ApiError(404, { message: 'Deck not found' });
        }
        // Si l'utilisateur n'est pas le propriétaire du deck, on supprimer seulement les clés étrangères dans la table d'association (deck_has_user)
        if (req.user.id !== deck.user_id) {
            const user = req.user;
            await user.removeImportedDeck(deck);
            res.status(200).json({ message: 'Deck supprimé' });
        }
        if (req.user.id === deck.user_id) {
            await deck.destroy();
            res.status(200).json({ message: 'Deck supprimé' });
        }
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
            throw new ApiError(404, { message: 'The shared deck cannot be found' });
        }

        // Récupération de l'utilisateur actuel qui récupère le deck
        const newUser = req.user;

        // Ajout de l'association entre le nouvel utilisateur et le deck partagé
        await newUser.addImportedDeck(deckShared);

        res.status(200).json(deckShared);
    },
};

export default deckController;
