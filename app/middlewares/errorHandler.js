const errorHandler = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    } catch (error) {
        next(error); // Passez l'erreur au middleware de gestion des erreurs
    }
};

export default errorHandler;
