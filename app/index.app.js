import express from 'express';
import cors from 'cors';

import rateLimit from 'express-rate-limit';
import router from './routers/router.js';
import errorMiddleware from './middlewares/errorMiddleware.js';



const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use(errorMiddleware);

export default app;
