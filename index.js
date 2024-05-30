import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import roleRoute from "./routes/role.js";
import authRoute from "./routes/auth.js";
import userRoute from "./routes/user.js";
import bookRoute from "./routes/book.js";
import { CreateError } from "./utils/err.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { seedBooksData } from "./seed.js";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:4200", credentials: true }));
app.use("/api/role", roleRoute);
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/book", bookRoute)

//Err handler
app.use((obj, req, res, next) => {
  const statusCode = obj.status;
  const msg = obj.message || "Something Went Wrong!";
  return res.status(statusCode).json({
    success: [200, 201, 204].some((a) => a === obj.status) ? true : false,
    status: statusCode,
    message: msg,
    data: obj.data,
  });
});

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    if(process.argv.includes("--seed")){
      await seedBooksData();
    }
    console.log("Connected to DataBase!");
  } catch (err) {
    return next(CreateError(500, "Err DB Connection"));
  }
};

app.listen(8800, () => {
  connectMongoDB();
  console.log("Connected to Backend!");
});
