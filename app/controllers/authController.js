import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'email-validator';
import { z } from 'zod';
import User from '../models/User.js';

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

    async login(req, res) {
        // try {
        const { email, password } = req.body;
        if (!email) {
            res.status(401).json({ error: 'Missing email or password' });
        }
        // Récupérer l'utilisateur par son email
        const user = await User.findOne({ where: { email } });

        if (!user) {
            res.status(401).json({ error: 'User or password incorrect' });
        }
        // Comparer le password avec le password (enregistrer en BDD (hashé))
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'User or password incorrect' });
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
        res.status(200).json({ token, user: userWithoutPassword });
    },
    async create(req, res) {
        const result = userSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ error: 'Veuillez renseigner tous les champs' });
        }
        // check if email is valid
        if (!validator.validate(result.data.email)) {
            res.status(400).json({ error: "L'adresse email n'est pas valide" }); // (/!\affiche le mess d'erreur que si '@' manquant)
        }
        // verify if user exist in BDD
        const userExists = await User.findOne({ where: { email: result.data.email } });
        if (userExists) {
            res.status(400).json({ error: 'Cet email est déjà enregistré' });
        }
        const passwordHash = await bcrypt.hash(result.data.password, parseInt(process.env.NB_OF_SALT_ROUNDS, process.env.NB_OF_SALT_ROUNDS));
        console.log('password', passwordHash);

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
            },
        });
    },

    async update(req, res) {
        // Récupérer l'utilisateur connecté
        const user = req.user;
        // Récupération et validation des données modifiées
        const result = userUpdateSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ error: 'Veuillez renseigner tous les champs' });
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
