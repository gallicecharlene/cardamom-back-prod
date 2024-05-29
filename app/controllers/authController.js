import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'email-validator';
import { z } from 'zod';
import User from '../models/User.js';
import ApiError from '../errors/apiError.js';

// schema de validation pour la creation d'un utilisateur
const userSchema = z.object({
    pseudo: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
});

// schema de validation pour la mise à jour d'un utilisateur
const userUpdateSchema = z.object({
    pseudo: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
});

const authController = {

    async login(req, res, next) {
        // try {
        const { email, password } = req.body;
        if (!email || !password) {
            next(new ApiError(401, { message: 'User or password incorrect' }));
        }
        // Récupérer l'utilisateur par son email
        const user = await User.findOne({
            where: {
                email,
            },
            include: { association: 'decks', include: 'stats_deck' },
        });

        if (!user) {
            next(new ApiError(401, { message: 'User or password incorrect' }));
        }
        // Comparer le password avec le password (enregistrer en BDD (hashé))
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            next(new ApiError(401, { message: 'User or password incorrect' }));
        }
        // Créer un objet utilisateur sans le mot de passe
        const userWithoutPassword = {
            id: user.id,
            pseudo: user.pseudo,
            email: user.email,
        };

        // Si tout est ok, signature du token (on génère un token)
        const token = jwt.sign({
            id: user.id, // L'identifiant de l'utilisateur
            pseudo: user.pseudo, // Le pseudo
            email: user.email, // L'email
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TIME_EXPIRE }); // La clé secrête et le temps d'expiration du token

        // Renvoyer le token et l'utilisateur sans le mot de passe
        res.status(200).json({
            token,
            user: {
                id: userWithoutPassword.id,
                pseudo: userWithoutPassword.pseudo,
                email: userWithoutPassword.email,
                decks: user.decks,
                stats: user.stats_user,
            },
        });
    },

    async create(req, res) {
        const result = userSchema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(400, { message: 'Please fill in all fields and/or check that the information is valid.' });
        }
        // check if email is valid
        if (!validator.validate(result.data.email)) {
            throw new ApiError(400, { message: 'The email address provided is invalide' });
        }
        // verify if user exist in BDD
        const userExists = await User.findOne({ where: { email: result.data.email } });
        if (userExists) {
            throw new ApiError(400, { message: 'The email address is already in use' });
        }
        const passwordHash = await bcrypt.hash(result.data.password, parseInt(process.env.NB_OF_SALT_ROUNDS, process.env.NB_OF_SALT_ROUNDS));

        await User.create({
            pseudo: result.data.pseudo,
            email: result.data.email,
            password: passwordHash,
        });

        res.status(201).json({ message: 'User created' });
    },

    async getOne(req, res) {
        res.status(200).json({
            user: {
                id: req.user.id,
                pseudo: req.user.pseudo,
                email: req.user.email,
                stats: req.user.stats_user,
                deck: req.user.decks,
            },
        });
    },

    async update(req, res) {
        // Récupérer l'utilisateur connecté
        const user = req.user;
        // Récupération et validation des données modifiées
        const result = userUpdateSchema.safeParse(req.body);

        if (!result.success) {
            throw new ApiError(400, { message: 'Please fill in all fields and/or check that the information is valid' });
        }

        // Si le password est modifié, on le hash
        if (result.data.password) {
            result.data.password = await bcrypt.hash(result.data.password, parseInt(process.env.NB_OF_SALT_ROUNDS, process.env.NB_OF_SALT_ROUNDS));
        }

        // Mise à jour de l'utilisateur en BDD
        const updatedUser = await user.update(result.data);

        res.status(200).json({
            updatedUser: {
                id: updatedUser.id,
                pseudo: updatedUser.pseudo,
                email: updatedUser.email,
            },
        });
    },

    async delete(req, res) {
        const user = req.user;

        await user.destroy({
            where: { id: user.id },
        });
        res.status(200).json({ message: 'User deleted' });
    },

};

export default authController;
