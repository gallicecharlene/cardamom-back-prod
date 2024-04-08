import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'email-validator';
import User from '../models/User.js';

export default {

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
            const {
                pseudo, email, password,
            } = req.body;

            if (!pseudo || !email || !password) {
                return res.status(400).json({ error: 'Veuillez renseigner tous les champs' });
            }
            // check if email is valid
            if (!validator.validate(email)) {
                return res.status(400).json({ error: "L'adresse email n'est pas valide" }); // (/!\affiche le mess d'erreur que si '@' manquant)
            }
            // verify if user exist in BDD
            const userExists = await User.findOne({ where: { email } });
            if (userExists) {
                return res.status(400).json({ error: 'Cet email est déjà enregistré' });
            }
            const passwordHash = await bcrypt.hash(password, parseInt(process.env.NB_OF_SALT_ROUNDS));

            const user = await User.create({
                pseudo,
                email,
                password: passwordHash,
            });
            const token = jwt.sign({
                id: user.id, // L'identifiant de l'utilisateur
                pseudo: user.pseudo, // Le pseudo
                email: user.email, // L'email
            }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TIME_EXPIRE }); // La clé secrête et le temps d'expiration du token

            return res.status(201).json({ user, token });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getOne(req, res) {
        try {
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
            const { id } = req.user;
            if (!id) {
                return res.status(400).json({ error: 'Invalid parameter id' });
            }

            // hash password, if a new password
            if (req.body.password) {
                req.body.password = await bcrypt.hash(req.body.password, parseInt(process.env.NB_OF_SALT_ROUNDS));
            }

            const [nbUpdated, dataUpdated] = await User.update(req.body, {
                where: { id },
                returning: true,
            });

            if (nbUpdated === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.status(200).json({ user: dataUpdated[0] });
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
