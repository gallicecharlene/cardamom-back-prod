import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'email-validator';
import { z } from 'zod';
import User from '../models/User.js';

// ! A revoir pour la gestion des erreurs zod (faire des messages personalisés? ou laisser comme ça?)
const userSchema = z.object({
    pseudo: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

const authController = {

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email) {
                return res.status(401).json({ error: 'Missing email or password' });
            }
            // Récupérer l'utilisateur par son email
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ error: 'User or password incorrect' });
            }
            // Comparer le password avec le password (enregistrer en BDD (hashé))
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'User or password incorrect' });
            }
            // Si tout est ok, signature du token (on génère un token)
            const token = jwt.sign({
                id: user.id, // L'identifiant de l'utilisateur
                pseudo: user.pseudo, // Le pseudo
                email: user.email, // L'email
            }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TIME_EXPIRE }); // La clé secrête et le temps d'expiration du token

            return res.status(200).json({ token });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    async create(req, res) {
        try {
            const result = userSchema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({ error: 'Veuillez renseigner tous les champs' });
            }
            // check if email is valid
            if (!validator.validate(result.data.email)) {
                return res.status(400).json({ error: "L'adresse email n'est pas valide" }); // (/!\affiche le mess d'erreur que si '@' manquant)
            }
            // verify if user exist in BDD
            const userExists = await User.findOne({ where: { email: result.data.email } });
            if (userExists) {
                return res.status(400).json({ error: 'Cet email est déjà enregistré' });
            }
            const passwordHash = await bcrypt.hash(result.data.password, parseInt(process.env.NB_OF_SALT_ROUNDS));
            console.log('password', passwordHash);

            const user = await User.create({
                pseudo: result.data.pseudo,
                email: result.data.email,
                password: passwordHash,
            });

            console.log('ici', user);

            const token = jwt.sign({
                id: user.id, // L'identifiant de l'utilisateur
                pseudo: user.pseudo, // Le pseudo
                email: user.email, // L'email
            }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TIME_EXPIRE }); // La clé secrête et le temps d'expiration du token

            // console.log(user, token);
            return res.status(201).json({ user, token });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getOne(req, res) {
        try {
            // Récupération de l'id de l'utilisateur via le token
            const { id } = req.user;
            if (!id) {
                return res.status(400).json({ error: 'Invalid parameter id' });
            }
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async update(req, res) {
        try {
            // Récupération de l'id de l'utilisateur via le token
            const { id } = req.user;

            // Vérification de l'existance de l'utilisateur
            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json('L utilisateur est introuvable');
            }

            // Récupération et validation des données modifiées
            const result = userSchema.safeParse(req.body);

            if (!result.success) {
                res.status(400).json({ error: 'Veuillez renseigner tous les champs' });
            }

            // Si le password est modifié, on le hash
            if (result.data.password) {
                result.data.password = await bcrypt.hash(result.data.password, parseInt(process.env.NB_OF_SALT_ROUNDS));
            }

            // Mise à jour de l'utilisateur en BDD
            const updatedUser = await user.update(result.data);

            return res.status(200).json(updatedUser);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.user;
            if (!id) {
                return res.status(400).json({ error: 'Invalid parameter id' });
            }
            const user = await User.findOne({ where: { id } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            await user.destroy();
            return res.status(200).json({ message: 'User deleted' });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

};

export default authController;