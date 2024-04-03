import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/', (req, res) => {
    res.send('Hello World');
});
router.get('/jwt', (req, res) => {
    const createToken = (jsonData = {}) => {
        try {
            const secretKey = 'test';
            const token = jwt.sign(jsonData, secretKey);
            return token;
        } catch (error) {
            console.log('error', error.message);
            return null;
        }
    };

    const jsonData = { email: 'test@test.fr', password: 'test1234' }; // req.body
    const token = createToken(jsonData);

    if (token) {
        res.json({ status: true, token });
    }
    res.json({ status: false });
});

export default router;
