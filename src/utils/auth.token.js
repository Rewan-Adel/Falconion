const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { serverErrorMessage,unAuthorizedMessage, notFoundMessage } = require('../middlewares/error.messages.middleware');

const protect = async(req, res, nxt)=>{
    try{
        let token;
        if( 
            req.header('Authorization')  &&
            req.header('Authorization').startsWith('Bearer ')
        ) 
            token = req.header('Authorization').replace('Bearer ', '');
        
        else if(req.cookies.jwt) 
            token = req.cookies.jwt;
        
        if(!token) return unAuthorizedMessage('Please login for get access', res);

        let decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userID);

        if(!user) return notFoundMessage("Invalid token", res);

        if(user.passChangedAt > decoded.iat) return unAuthorizedMessage('User recently changed password. Please login again.', res);

        req.token = token;
        req.user  = user;
        nxt();
    }
    catch(error){
        console.log('Error at token.middleware file: ', error);
        serverErrorMessage(error, res);
    }
};

const generateToken = async(userID, res)=>{
    try{
        const token = jwt.sign({userID}, process.env.JWT_SECRET, {expiresIn: '90d'});
        res.cookie('jwt', token,{
            httpOnly: true,
            sameSite : 'strict', // csrf protection
            secure: process.env.NODE_ENV === 'production' ? true : false, 
            maxAge:  7 * 24 * 60 * 60 * 1000,
        });

        return token;
    }
    catch(error){
        console.log('Error at token.middleware file: ', error);
        serverErrorMessage(error);
    }
};

module.exports = {
    protect, 
    generateToken
};  