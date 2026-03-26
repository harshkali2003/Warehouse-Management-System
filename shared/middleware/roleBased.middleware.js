const AppError = require("../utils/GlobalError")

function RBC(...allowedRoles){
    return (req , resp , next) => {
        const userRole = req.user?.role;
        if(!userRole){
            return next(new AppError("User role not found. Please log in again.",401))
        }


        if(!allowedRoles.includes(userRole)){
            return next(new AppError("You are not authorized" , 403))
        }

        next();
    }
}

module.exports = RBC;