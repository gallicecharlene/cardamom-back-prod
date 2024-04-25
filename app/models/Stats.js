// Stats
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/client.js';

class Stats extends Model {}

Stats.init({
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    nb_card_consulted: {
        type: DataTypes.INTEGER,
    },
    nb_card_success: {
        type: DataTypes.INTEGER,
    },

}, {
    sequelize,
    tableName: 'stats',

});
export default Stats;
