import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    pool: {
        max: 5, // 5 connexion maximum à la fois
        min: 0, // 0 connexion à la fois
        acquire: 30000, // delai d'attente (30 sec)
        idle: 10000, // delai d'inactivité (10 sec)
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
    define: {
        underscored: true,
    },
});
// Tester la connexion à la base de données
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch((error) => {
        console.error('Unable to connect to the database:', error);
    });

export default sequelize;
