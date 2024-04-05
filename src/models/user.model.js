const {DataTypes} = require('sequelize');
const db = require('../config/Database');

const {badRequestMessage} = require('../middlewares/error.messages.middleware');
const bcrypt = require('bcrypt');

const User = db.define('User',{
    user:{
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
           // notNull: { msg: 'lastName is required.' },
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
        defaultValue: `example@gmail.com`,
        unique: true,
        validate:{
            //notNull: {msg: 'Email is required.'},
            isEmail: { msg: 'Invalid email format.' } 
        }
    },
    password:{
        type: DataTypes.STRING,
     //   defaultValue: '0000000',
        validate:{
            len    : {
                args: [6],
                msg: 'Password must be at least 6 characters long.' }
        }
    },
    confirmPassword:{  
        type: DataTypes.STRING,
     //   defaultValue: '0000000',
        validate:{
            len    : {
                args: [6],
                msg: 'Password must be at least 6 characters long.' }
        }
    },
    username:{
        type: DataTypes.STRING,
    //    defaultValue: 'username',
        validate:{
            len: {
                args: [3, 25],
                msg: 'Username should be between 3 and 25 characters.'
            }
    },
    },
    avatarURL:{
        type: DataTypes.JSON,
        defaultValue:{ 
            url:'https://www.nicepng.com/png/detail/933-9332131_profile-picture-default-png.png',
            public_id: 'avatar'
        },
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
    auctionBid       :{type: DataTypes.DECIMAL},
    isVerified       :{type: DataTypes.BOOLEAN, defaultValue: false },
    otp              :{type: DataTypes.STRING},
    passChangedAt    :{type: DataTypes.DATE} ,
    passResetToken   :{type: DataTypes.STRING},
    passResetExpires :{type: DataTypes.DATE},
},{
    timestamps: false
});
const EXCLUDED_FIELDS = ['password', 'confirmPassword', 'verifyCode', 'passChangedAt', 'passResetToken', 'passResetExpires'];

User.prototype.toJSON = function(){
    let user = this.values;
    EXCLUDED_FIELDS.forEach(field => delete user[field]);
    return user;
}

User.beforeSave(async(user) => {
    if(user.changed('password')){
        if(user.password != user.confirmPassword)
            return badRequestMessage('Passwords do not match.');

        user.password = await bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        user.confirmPassword = undefined;    
    };
});

module.exports = User;