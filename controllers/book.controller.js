import Book from '../models/Book.js'
import { CreateError } from '../utils/err.js';
import { CreateSuccess } from '../utils/success.js';

export const getBooks = async (req,res,next)=>{
    try{
        const books = await Book.find();
        return next(CreateSuccess(200, "Book retreived Successfully!", books));
    }catch(err){
        return next(CreateError(500, "Error Book retreive!"));

    }
}