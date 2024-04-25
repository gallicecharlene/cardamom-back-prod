// client sequelize

import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.PG_URL, {
    define: {
        underscored: true,
    },
});

export default sequelize;
