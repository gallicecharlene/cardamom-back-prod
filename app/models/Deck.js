// deck

import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/client.js';

class Deck extends Model {}

Deck.init({
    title: {
        type: DataTypes.STRING(128),
        allowNull: false,
    },
    share_id: {
        type: DataTypes.STRING(64),
        allowNull: false,
    },

}, {
    sequelize,
    tableName: 'deck',

});
export default Deck;
