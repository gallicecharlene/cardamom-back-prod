import express from 'express';

// eslint-disable-next-line import/no-extraneous-dependencies
import cors from 'cors';
import router from './router.js';

const app = express();

app.use(express.json());
app.use(cors({
    // origin: '*',
}));
app.use(router);

export default app;
