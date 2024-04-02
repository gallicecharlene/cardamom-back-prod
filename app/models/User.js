// user
import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/client.js';

class User extends Model {}

User.init({
    pseudo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },

}, {
    sequelize,
    tableName: 'user',

});
export default User;
