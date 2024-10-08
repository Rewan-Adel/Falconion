const {DataTypes} = require('sequelize');
const db = require('../config/Database');
const bcrypt = require('bcrypt');

const User = db.define('User',{
    userID:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName:{
        type: DataTypes.STRING,
        defaultValue: 'Anonymous',
        allowNull: true,
        validate: {
            isAlpha: {
                msg: 'firstName should only contain alphabetic characters.',
            },
            len: {
                args: [3, 25],
                msg: 'firstName should be between 3 and 25 characters.',
            }
        }
    },
    lastName:{
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'User',
        validate: {
            isAlpha: {
                msg: 'lastName should only contain alphabetic characters.'
            },
            len: {
                args: [3, 25],
                msg: 'lastName should be between 3 and 25 characters.'
            }
        }
    },
    phone:{
        type: DataTypes.STRING,
        unique: true,
    
    },
    email:{
        type: DataTypes.STRING,
        unique: true,
        validate:{
            isEmail: { msg: 'Invalid email format.' } 
        }
    },
    password:{
        type: DataTypes.STRING,
        validate:{
            len    : {
                args: [6],
                msg: 'Password must be at least 6 characters long.' }
        }
    },
    confirmPassword:{  
        type: DataTypes.STRING,
        validate:{
            len    : {
                args: [6],
                msg: 'Password must be at least 6 characters long.' }
        }
    },
    username:{
        type: DataTypes.STRING,
        unique: true,
        validate:{
            len: {
                args: [3, 25],
                msg: 'Username should be between 3 and 25 characters.'
            }
    },
    },
    avatarURL:{
        type: DataTypes.JSON,
        defaultValue:'https://res.cloudinary.com/dt6idcgyw/image/upload/v1725752451/default_j5ftby_jspjve.jpg'
    },
    avatarPublicId: {
        type: DataTypes.JSON,
        defaultValue:'default_j5ftby_jspjve'
    },
    country:{
        type: DataTypes.STRING,
    },
    state:{
        type: DataTypes.STRING,
    },
    city:{
        type: DataTypes.STRING,
    },
    birthday:{
        type: DataTypes.DATE
    },
    description:{
        type: DataTypes.TEXT
    },
    gender: {
        type: DataTypes.ENUM('female', 'male'),
    },
    auctionBid       :{type: DataTypes.DECIMAL},
    
    role             :{type: DataTypes.STRING, defaultValue: 'user', enum: ['user', 'admin']},
    isVerified       :{type: DataTypes.BOOLEAN, defaultValue: false },
    signupWay        :{type: DataTypes.STRING, enum: ['email', 'phone', 'apple', 'twitter']},
    googleToken      :{type: DataTypes.STRING},
    otp              :{type: DataTypes.STRING},
    otpCount         :{type: DataTypes.INTEGER, defaultValue: 0},
    otpExpires       :{type: DataTypes.DATE},
    passChangedAt    :{type: DataTypes.DATE} ,
    passResetToken   :{type: DataTypes.STRING},
    passResetExpires :{type: DataTypes.DATE},
},{
    timestamps: false
});
const EXCLUDED_FIELDS = [
    'avatarPublicId',
    'password',
    'confirmPassword',
    'passChangedAt',
    'passResetToken',
    'passResetExpires',
    'otp',
    'otpCount',
    'otpExpires',
    "googleToken"
];

User.prototype.toJSON = function(){
    let user = this.dataValues;
    EXCLUDED_FIELDS.forEach(field => delete user[field]);
    return user;
}

// User.beforeSave(async(user) => {
//     if(user.changed('password')){
//         user.password = await bcrypt.hashSync(user.password, 10);
//         user.confirmPassword = undefined;    
//         console.log(user.password)
//     };
// });

module.exports = User;