import sequelize from '../dbConfig.js';
import { Model, DataTypes } from "sequelize";

class User extends Model { }

User.init({
   user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
   },

   // Model attributes are defined here
   firstName: {
      type: DataTypes.STRING,
      allowNull: false
   },
   lastName: {
      type: DataTypes.STRING
   },
   userEmail: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
   },
   userPassword: {
      type: DataTypes.STRING
   },
   userType: {
      type: DataTypes.STRING,
      defaultValue: "user",
   },
}, {
   // Other model options go here
   sequelize, // We need to pass the connection instance
   modelName: 'User', // We need to choose the model name
   tableName: 'User',
   timestamps: true,
});


export default User;

