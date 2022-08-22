const { DataTypes } = require('sequelize');
const sequelizeDB = require('../sequelizeDbConnect');

const User = sequelizeDB.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    tableName: 'users'
});

module.exports = User;