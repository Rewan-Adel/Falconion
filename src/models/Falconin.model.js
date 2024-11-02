const db = require('../config/Database');
const {DataTypes} = require('sequelize');

const Falconin = db.define('Falconins',{
    falconinID : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    ownerID : {
        type: DataTypes.INTEGER,
        references:{
            model: 'Users',
            key: 'userID'
        },
        allowNull: false
    },
    name : {
        type: DataTypes.STRING
    },
    description : {
        type: DataTypes.STRING
    },
    category : {
        type: DataTypes.STRING
    },
    price : {
        type: DataTypes.DECIMAL
    },
    state : {
        type: DataTypes.STRING
    },
    city : {
        type: DataTypes.STRING
    },
    color : {
        type: DataTypes.STRING
    },
    images:{
        type: DataTypes.JSON,
        defaultValue: []
    },
    // mediaURL : {
    //     type: DataTypes.STRING //must be ARRAY
    // }, 
    // mediaPublicId : {
    //     type: DataTypes.STRING  //must be ARRAY
    //},
    conditionOfUse : {
        type: DataTypes.ENUM('New', "Used", "Light Used","Like New")
    },
    communicationMethod : {
        type: DataTypes.ENUM("Chat","Mobile phone", "Both")
    },
    status : {
        type: DataTypes.ENUM('Running', 'Expired'),
        defaultValue: 'Running'
    },
    createdAt : {
        type: DataTypes.TIME
    }
},{
    timestamps: false
})

module.exports = Falconin;