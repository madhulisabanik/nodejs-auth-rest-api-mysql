const { DataTypes } = require('sequelize');
const sequelizeDB = require('../sequelizeDbConnect');
const Unit = require('../model/Unit');

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

// Adding Foreign key constrain to join units table, as one User can have multiple Units
User.hasMany(Unit, {
    foreignKey: 'userId'
});

module.exports = User;