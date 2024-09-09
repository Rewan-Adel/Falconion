const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const {
    serverErrorMessage,
    badRequestMessage
} = require('../middlewares/error.messages.middleware');
const { 
    uploadImgToCloud,
    deleteImgFromCloud 
} = require('../utils/cloudHandler');
const {
    profileValidation,
    passwordValidation
} = require('../validation/profile.validation');
const {sendVerifyEmail} = require('../utils/sendCodeToEmail');
const {emailValidation} = require('../validation/signup.validation');

const getProfile = async(req, res)=>{
    try{
        const {userID} = req.user;
        const user = await User.findByPk(userID);
        
        if(!user) return badRequestMessage('User not found!', res);
        if(!user.isVerified) return badRequestMessage('User not verified.', res);
        
        return res.status(200).json({
            status: 'success',
            code: 200,
            message: "User founded.",
            user
        })

    }catch(error){
        console.log('Error at get profile: ', error);
        await serverErrorMessage(error, res);
    }
};

const updateProfile = async(req, res)=>{
    try{
        const {userID} = req.user;
        const user = await User.findByPk(userID);
        if(!user) return badRequestMessage('User not found!', res);
        if(!user.isVerified) return badRequestMessage('User not verified.', res);
        
        let {value,error} = profileValidation(req.body);
        if(error) return badRequestMessage(error.message, res);

        await User.update(value, {where : { userID: userID}});
        let updatedUser = await User.findByPk(userID);

        return res.status(200).json({
            status: 'success',
            code: 200,
            message: "User info updated.",
            updatedUser
            
        })

    }catch(error){
        console.log('Error at update profile: ', error);
        await serverErrorMessage(error, res);
    }
};

const updateProfileImage = async(req, res)=>{
    try{
        const {userID} = req.user;
        const user = await User.findByPk(userID);
        if(!user) return badRequestMessage('User not found!', res);
        if(!user.isVerified) return badRequestMessage('User not verified.', res);
        
        if(req.file){
            const image = await uploadImgToCloud(req.file.path);
            await User.update({avatarURL: image.url, avatarPublicId: image.public_id}, {where : { userID: userID}});
            let updatedUser = await User.findByPk(userID);
            return res.status(200).json({
                status: 'success',
                code: 200,
                message: "User image updated.",
                URL: updatedUser.avatarURL
            })
        }else{
            return badRequestMessage('Image not found!', res);
        }

    }catch(error){
        console.log('Error at update profile image: ', error);
        await serverErrorMessage(error, res);
    }
};  

const deleteProfileImage = async(req, res)=>{
    try{
        const {userID} = req.user;
        const user = await User.findByPk(userID);
        if(!user) return badRequestMessage('User not found!', res);
        if(!user.isVerified) return badRequestMessage('User not verified.', res);
        
        if(user.avatarPublicId === 'default_j5ftby_jspjve') 
            return badRequestMessage('Image already deleted.', res);

        const image = await deleteImgFromCloud(user.avatarPublicId);
        await User.update({
            avatarURL: 'https://res.cloudinary.com/dt6idcgyw/image/upload/v1725752451/default_j5ftby_jspjve.jpg',
            avatarPublicId: 'default_j5ftby_jspjve'
        }, {where : { userID: userID}});

        let updatedUser = await User.findByPk(userID);
        return res.status(200).json({
            status: 'success',
            code: 200,
            message: "User image updated.",
            URL: updatedUser.avatarURL
        })
    }catch(error){
        console.log('Error at update profile image: ', error);
        await serverErrorMessage(error, res);
    }
};  

const changePassword = async(req, res)=>{
    try{
        const {userID} = req.user;
        const user = await User.findByPk(userID);
        if(!user) return badRequestMessage('User not found!', res);
        if(!user.isVerified) return badRequestMessage('User not verified.', res);
        
        let {value,error} = passwordValidation(req.body);
        if(error) return badRequestMessage(error.message, res);
        
        const checkPass = await bcrypt.compare(value.oldPassword, user.password);
        if(!checkPass) return badRequestMessage('Old password is incorrect.', res);
        
        if(value.oldPassword === value.newPassword) return badRequestMessage('New password must be different from old password', res);
        value.newPassword = await bcrypt.hash(value.newPassword, 10);
        
        await User.update(value, {where : { userID: userID}});
        
        return res.status(200).json({
            status: 'success',
            code: 200,
            message: "Password is changed.",
      });
    }catch(error){
        console.log('Error at change password: ', error);
        await serverErrorMessage(error, res);
    }
};

const changeEmail = async(req, res)=>{
    try{
        const {userID} = req.user;
        const user = await User.findByPk(userID);
        if(!user.isVerified) return badRequestMessage('User not verified.', res);
        
        let {error,value} = emailValidation(req.body);
        if(error) return badRequestMessage(error.message, res);
        
        const checkEmail = await User.findOne({
            where: {
                email : value.email
            }
        });
        if(checkEmail) return badRequestMessage('Email already exists.', res);

        let sendMil = await sendVerifyEmail(user);
    
        if(!sendMil) {
            await user.destroy();
            return "Couldn't send verification email";
        }
        req.email = value;
        return res.status(200).json({
            status: 'success',
            code: 200,
            message: 'Verification code is sent.',
    });
    }catch(error){
        console.log('Error at change email: ', error);
        await serverErrorMessage(error, res);
    }
};

const verifyCodeToChange = async(req, res, next)=>{
    try{
        let {otp} = req.body;
        let {user} = req;

        if(!otp) return badRequestMessage('Verification code is required.', res);

        otp = otp.toString();
        const isMatch = await bcrypt.compare(otp, user.otp);
        if(!isMatch) return badRequestMessage('Invalid verification code', res);
        
        if(user.otpExpires < Date.now()) return badRequestMessage('Verification code has expired.', res);
        
        await user.update({email: req.email, otp: null, otpCount: 0, otpExpires: null});

        return res.status(200).json({
            status: 'success',
            code: 200,
            isVerified: true,
            message: 'Valid code.'
        });
    }catch(error){
        console.log('Error in auth.controller.js: ',error);
        next(serverErrorMessage(error, res));
    }
}; 

module.exports = {
    getProfile,
    updateProfile,
    updateProfileImage,
    deleteProfileImage,
    changePassword,
    changeEmail,
    verifyCodeToChange
}