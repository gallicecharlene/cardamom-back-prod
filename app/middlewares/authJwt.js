import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
    try {
        // Extraction du jeton d'authentification de l'en-tête Authorization de la requête
        const token = req.headers.authorization.split(' ')[1];

        // Vérification si le token existe
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Vérification et décodage du jeton à l'aide du secret JWT
        const tokendecoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attribution des données décodées du token à la propriété user de l'objet req pour une utilisation ultérieure dans les middleware
        req.user = tokendecoded;

        // Poursuite de l'exécution de la requête en appelant la fonction next() pour passer au middleware suivant
        return next();
    } catch (error) {
        return res.status(401).json({ error: 'Token invalid' });
    }
};
