import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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
};
