import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export default async (req, res, next) => {
    try {
        const { headers } = req;
        // Vérification si le headers.authorization est présent dans la requête
        if (!headers || !headers.authorization) {
            return res.status(401).json({ error: 'Missint authorization headers' });
        }
        // On vérifie que le headers authorization contient le token
        const [scheme, token] = headers.authorization.split(' ');

        if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) { // rappel=> || veut dire "ou"
            return res.status(401).json({ error: 'Invalid Authorization headers format' });
        }

        // Vérification et décodage du token à l'aide du secret (JWT_SECRET)
        const tokendecoded = jwt.verify(token, process.env.JWT_SECRET);

        // Vérification de l'existance de l'utilisateur en BDD
        const userId = tokendecoded.id;
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: `User ${userId} not exist` });
        }

        // On passe l'utilisateur dans la requête pour pouvoir l'utiliser dans les middlewares suivants
        req.user = user;

        // Poursuite de l'exécution de la requête en appelant la fonction next() pour passer au middleware suivant
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalid' });
    }
};
