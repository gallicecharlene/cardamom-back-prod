import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import router from './routers/router.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

const app = express();

// Définir trust proxy à true
app.set('trust proxy', true);

// Add rate limit policy
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000, // Limit each IP to 100K requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use(errorMiddleware);

export default app;
