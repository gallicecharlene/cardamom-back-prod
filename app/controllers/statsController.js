import { z } from 'zod';
import { Stats } from '../models/index.js';

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

const statsController = {

    // récupérer toutes les stats de tous les decks d'un seul user
    async getAll(req, res) {
        try {
            const userId = req.user.id;
            const stats = await Stats.findAll({
                where: {
                    user_id: userId,
                },
            });
            res.json(stats);
        } catch (error) {
            console.trace(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    // récupérer les stats d'un deck d'un user
    async getByDeck(req, res) {
        try {
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
                res.status(404).json({ error: 'Stat not found' });
                return;
            }

            res.status(200).json(stats);
        } catch (error) {
            console.trace(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async getOne(req, res) {
        try {
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
                res.status(404).json({ error: 'Stat not found' });
                return;
            }

            res.status(200).json(stats);
        } catch (error) {
            console.trace(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async create(req, res) {
        try {
            const userId = req.user.id;
            const deckId = req.params.deckId;
            // on vérifie que le body respecte le schéma de validation de stats définit plus haut
            const result = statsSchema.safeParse(req.body); // body contenant nb_card_success , nb_card_consulted, deck_id, user_id
            if (!result.success) {
                res.status(400).json({ message: 'données non valides' }); // ou json(result.error);
            }
            // si données validées, alors on peut générer un objet stats tel que prévu par les models Stats
            const stats = await Stats.create({
                nb_card_consulted: result.data.nb_card_consulted,
                nb_card_success: result.data.nb_card_success,
                user_id: userId,
                deck_id: deckId,
            });

            res.json(stats);
        } catch (error) {
            console.trace(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // Mise à jour des valeurs à incrémenter dans le MemoTest, accompagnées d'un deck_id et d'un user_id
    async update(req, res) {
        try {
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
                res.status(404).json({ message: 'les stats demandées sont introuvables' });
                return;
            }

            const result = statsUpdateSchema.safeParse(req.body);
            if (!result.success) {
                res.status(400).json({ message: 'données non valides' });
            }

            // incrémentation des statistiques du deck en cas de succès --> gestion côté front
            // stats.nb_card_consulted += 1;
            // stats.nb_card_success += 1;
            // si données validées, alors on peut modifier l'objet stats tel que prévu par les models Stats
            await stats.update({
                nb_card_consulted: result.data.nb_card_consulted,
                nb_card_success: result.data.nb_card_success,
            });

            res.status(200).json(stats);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    // méthode non utile pour l'instant
    async delete(req, res) {
        try {
            const userId = req.user.id;
            const statsId = req.params.statsId;
            const stats = await Stats.findOne({
                where: {
                    id: statsId,
                    user_id: userId,
                },
            });
            if (!stats) {
                res.status(404).json({ message: 'Les stats à supprimer sont introuvables' });
                return;
            }
            await stats.destroy();
            res.json({ message: 'Stats supprimées' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

};

export default statsController;
