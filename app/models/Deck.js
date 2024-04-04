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
        allowNull: true, // obligation de le passer en true car sinon test de création de deck échoue si on a pas alloué un share_id non nul
        unique: true,
    },

}, {
    sequelize,
    tableName: 'deck',

});
export default Deck;
