import { z } from 'zod';
import { Stats } from '../models/index.js';

const statsSchema = z.object({
    nb_card_consulted: z.number(),
    nb_card_success: z.number(),
    user_id: z.number(),
    deck_id: z.number(),
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
            res.status(500).send('Internal Server Error');
        }
    },
    // récupérer les stats d'un deck d'un user
    async getOne(req, res, next) {
        try {
            // Récupération des stats d'un deck grace au deck_id
            const userId = req.user.id;
            const deckId = req.params.deckId;
            const stats = await Stats.findOne({
                where: {
                    deck_id: deckId,
                    user_id: userId,
                },
            });

            if (!stats) {
                // Si stats inexistant, on envoie une erreur et on passe au middleware suivant
                next();
                res.status(404).json({ error: 'Stat not found' });
                return;
            }

            res.status(200).json(stats);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    },

    async create(req, res) {
        try {
            // on vérifie que le body respecte le schéma de validation de stats définit plus haut
            const result = statsSchema.safeParse(req.body); // body contenant nb_card_success , nb_card_consulted, deck_id, user_id
            if (!result.success) {
                res.status(400).json(result.error);
                return;
            }
            // si données validées, alors on peut générer un objet stats tel que prévu par les models Stats
            const stats = await Stats.create(result.data);

            res.json(stats);
        } catch (error) {
            console.trace(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // Mise à jour des valeurs à incrémenter dans le MemoTest, accompagnées d'un deck_id et d'un user_id
    async update(req, res) {
        try {
            // Récupération des stats spécifiques au deck à modifier
            const userId = req.user.id;
            const deckId = req.params.deckId;
            const stats = await Stats.findOne({
                where: {
                    deck_id: deckId,
                    user_id: userId,
                },
            });
            // Si stats inexistant, erreur
            if (!stats) {
                res.status(404).json({ error: 'stats not found' });
                return;
            }

            const result = statsSchema.safeParse(req.body);
            if (!result.success) {
                res.status(400).send('');
            }

            // incrémentation des statistiques du deck en cas de succès --> gestion côté front
            // stats.nb_card_consulted += 1;
            // stats.nb_card_success += 1;
            // si données validées, alors on peut modifier l'objet stats tel que prévu par les models Stats
            await stats.update(result.data);
            res.status(200).json(stats);
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

    // méthode non utile pour l'instant
    async delete(req, res) {
        try {
            const userId = req.user.id;
            const deckId = req.params.deckId;
            const stats = await Stats.findOne({
                where: {
                    deck_id: deckId,
                    user_id: userId,
                },
            });
            if (!stats) {
                res.status(404).send('Les stats à supprimer sont introuvables');
                return;
            }
            await stats.destroy();
            res.send('Stats supprimées');
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    },

};

export default statsController;
