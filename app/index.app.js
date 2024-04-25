import express from 'express';
import cors from 'cors';
import router from './router.js';

const app = express();

app.use(cors());

app.use(express.static('dist'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.set('env', process.env.NODE_ENV || 'development');

export default app;
