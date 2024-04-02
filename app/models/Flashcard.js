// flashcard

import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/client.js';

class Flashcard extends Model {}

Flashcard.init({
    title_front: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    title_back: {
        type: DataTypes.STRING,
        allowNull: false,
    },

}, {
    sequelize,
    tableName: 'flashcard',

});
export default Flashcard;
