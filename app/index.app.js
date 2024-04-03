import express from 'express';
import router from './router.js';

const app = express();

app.use(router);

export default app;
