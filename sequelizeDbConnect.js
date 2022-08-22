// instantiate Sequelize
const { Sequelize } = require('sequelize')

// connect db
const sequelize = new Sequelize("nodeApp", "root", "password", {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;