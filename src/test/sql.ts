import {Sequelize} from "sequelize";

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'data/db.sqlite'
});


sequelize.authenticate()