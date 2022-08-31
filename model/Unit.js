const { DataTypes } = require('sequelize');
const sequelizeDB = require('../sequelizeDbConnect');
const User = require('../model/User');

const Unit = sequelizeDB.define('Unit', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitName: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    tableName: 'units'
});

// // Joining users table, as one Unit can belongs to only one User
Unit.belongsTo(User, {
    foreignKey: 'userId'
});

module.exports = Unit;