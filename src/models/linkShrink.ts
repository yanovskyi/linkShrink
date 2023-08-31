import { Model, DataTypes } from 'sequelize';
import sequelize from '../utils/database';

export class LinkShrink extends Model {}

LinkShrink.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: DataTypes.STRING,
    user: DataTypes.STRING,
    url: DataTypes.STRING,
    hash: DataTypes.STRING
}, {
    sequelize,
    modelName: 'LinkShrink'
}
);