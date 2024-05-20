import { z } from 'zod';
import { Stats } from '../models/index.js';
import ApiError from '../errors/apiError.js';

const statsSchema = z.object({
    nb_card_consulted: z.number(),
    nb_card_success: z.number(),
});

const statsUpdateSchema = z.object({
    nb_card_consulted: z.number(),
    nb_card_success: z.number(),
    deck_id: z.number(),
    stats_id: z.number(),
});

// ! A REVOIR SI BESOIN DE TOUTES CES METHODES

const statsController = {

    // récupérer toutes les stats de tous les decks d'un seul user
    async getAll(req, res) {
        const userId = req.user.id;
        const stats = await Stats.findAll({
            where: {
                user_id: userId,
            },
        });
        res.status(200).json(stats);
    },
    // récupérer les stats d'un deck d'un user
    async getByDeck(req, res) {
        // Récupération des stats d'un deck grace au deck_id
        const userId = req.user.id;
        const deckId = req.params.deckId;
        const stats = await Stats.findAll({
            where: {
                deck_id: deckId,
                user_id: userId,
            },
        });

        if (!stats) {
            throw new ApiError(404, { message: 'Stat not found' });
        }

        res.status(200).json(stats);
    },

    async getOne(req, res) {
        // Récupération des stats d'un deck grace au deck_id
        const userId = req.user.id;
        const statsId = req.params.statsId;
        const stats = await Stats.findOne({
            where: {
                id: statsId,
                user_id: userId,
            },
        });

        if (!stats) {
            throw new ApiError(404, { message: 'Stats not found' });
        }

        res.status(200).json(stats);
    },

    async create(req, res) {
        const userId = req.user.id;
        const deckId = req.params.deckId;
        // on vérifie que le body respecte le schéma de validation de stats définit plus haut
        const result = statsSchema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(400, { message: 'invalid data' });
        }

        const stats = await Stats.create({
            nb_card_consulted: result.data.nb_card_consulted,
            nb_card_success: result.data.nb_card_success,
            user_id: userId,
            deck_id: deckId,
        });

        res.status(200).json(stats);
    },

    async update(req, res) {
        // Récupération des stats spécifiques au deck à modifier
        const userId = req.user.id;
        const statsId = req.params.statsId;
        const stats = await Stats.findOne({
            where: {
                user_id: userId,
                id: statsId,
            },
        });
            // Si stats inexistant, erreur
        if (!stats) {
            throw new ApiError(404, { message: 'the requested stats cannot be found' });
        }

        const result = statsUpdateSchema.safeParse(req.body);
        if (!result.success) {
            throw new ApiError(400, { message: 'invalid data' });
        }

        await stats.update({
            nb_card_consulted: result.data.nb_card_consulted,
            nb_card_success: result.data.nb_card_success,
        });

        res.status(200).json(stats);
    },

    // méthode non utile pour l'instant
    async delete(req, res) {
        const userId = req.user.id;
        const statsId = req.params.statsId;
        const stats = await Stats.findOne({
            where: {
                id: statsId,
                user_id: userId,
            },
        });
        if (!stats) {
            throw new ApiError(404, { message: 'Stats to be deleted cannot be found' });
        }
        // // Si l'utilisateur n'est pas le propriétaire
        // const deck = await Deck.findByPk(stats.deck_id);
        // if (req.user.id !== deck.user_id) {
        //     throw new ApiError(403, { message: 'You do not have the rights to modify this deck' });
        // }

        await stats.destroy();
        res.status(200).json({ message: 'Stats supprimées' });
    },

};

export default statsController;
