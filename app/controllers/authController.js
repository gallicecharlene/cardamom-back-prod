import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import User from '../models/User.js';

export default {

    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email) {
                return res.status(401).json({ error: 'Missing email or password' });
            }
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({ error: 'User or password incorrect' });
            }

            // const isPasswordValid = await bcrypt.compare(password, user.password);
            // if (!isPasswordValid) {
            //     return res.status(401).json({ error: 'User or password incorrect' });
            // }

            if (email !== user.email || password !== user.password) {
                return res.status(401).json({ error: 'User or password incorrect' });
            }
            const token = jwt.sign({
                id: user.id,
                pseudo: user.pseudo,
                email: user.email,
            }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TIME_EXPIRE });

            return res.status(200).json({ token });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
