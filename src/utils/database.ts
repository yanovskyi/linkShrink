import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('linkstrinkdb', 'linkshrinkuser', 'sprpswlnkshrnk', { 
    dialect:'postgres',
    host: 'localhost',
    port: 5433
 });

export default sequelize;