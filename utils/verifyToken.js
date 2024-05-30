import jwt from "jsonwebtoken";
import { CreateError } from "./err.js";
import { CreateSuccess } from "./success.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  return (
    token
      ? jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
          if (err) {
              return next(CreateError(403, "token is not valid!"));
          } else {
              req.user = user;
              return next();
          }
        })
      : next(CreateError(401, "You are not Authenticated!"))
);

};

export const verifyUser = (req,res,next)=>{
    verifyToken(req,res, ()=>{
        if(req.user.id == req.params.id || req.user.isAdmin){
            next();
        }else{
            return next(CreateError(403,"You are not Authorized!"))
        }
    })
}

export const verifyAdmin = (req,res,next)=>{
    verifyToken(req,res, ()=>{
        if(req.user.isAdmin){
            next();
        }else{
            return next(CreateError(403,"You are not Authorized!"))
        }
    })
}