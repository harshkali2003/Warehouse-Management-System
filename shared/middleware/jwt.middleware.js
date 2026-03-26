const jwt = require("jsonwebtoken");
require("dotenv").config();
const AppError = require("../utils/GlobalError")
const redisClient = require("../../config/redis.config")

const secret_key = process.env.JWT_SECRET_KEY;

function generateToken(payload){
    return jwt.sign(payload , secret_key , {expiresIn : "24h"});
}

async function verifyToken(req , resp , next){
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return next(new AppError("Please provide a valid Bearer token", 401));
    }

    const token = authHeader.split(" ")[1];

    const isBlackListed = await redisClient.get(`blacklist_${token}`)
    if(isBlackListed){
        return next(new AppError("Token is no longer valid (logged out)", 401))
    }
    
    try{
        const decoded = jwt.verify(token , secret_key);
        
        req.user = decoded;
        next();
    } catch(err){
        return next(new AppError("Invalid or expired token" , 401))
    }
}

module.exports = {generateToken , verifyToken};