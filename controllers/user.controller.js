import User from "../models/User.js"
import { CreateError } from "../utils/err.js"
import { CreateSuccess } from "../utils/success.js";

export const getAllUsers = async (req,res,next)=>{
    try{
        const users = await User.find();
        return next(CreateSuccess(200,"All Users",users));

    }catch(err){
        return next(CreateError(500,"Internal Server Error!"))
    }
}

export const getUserById = async (req,res,next)=>{
    try{
        const user = await User.findById(req.params.id);
        console.log(user);
        return next(user?CreateSuccess(200,"User Found",user):CreateError(404,"User Not Found"))
    }catch(err){
        return next(CreateError(500,"Internal Server Error!"))
    }
}