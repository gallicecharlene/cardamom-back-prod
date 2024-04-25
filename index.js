import { createServer } from 'node:http';

import 'dotenv/config';

import app from './app/index.app.js';

const { PORT } = process.env;

const httpServer = createServer(app);

httpServer.listen(PORT, () => {
    console.log(`Server launches at http://localhost:${PORT}`);
});
