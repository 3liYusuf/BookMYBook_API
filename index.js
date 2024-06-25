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
import { verifyToken } from "./utils/tokenMiddleware.js"; // Importing token verification middleware
import jwt from "jsonwebtoken";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());
const corsOptions = {
  origin: [
    "http://localhost:4200",
    "http://3liYusuf.com",
    "https://3liYusuf.com",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use("/BookAPI/api/auth", authRoute);
app.use("/BookAPI/api/role", roleRoute);
app.use("/BookAPI/api/user", userRoute);
app.use("/BookAPI/api/book", bookRoute);
// app.use("/api/role", verifyToken, roleRoute);
// app.use("/api/user", verifyToken, userRoute);
// app.use("/api/book", verifyToken, bookRoute);

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
    if (process.argv.includes("--seed")) {
      await seedBooksData();
    }
    console.log("Connected to DataBase!");
  } catch (err) {
    // return next(CreateError(500, "Err DB Connection"));
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
};

app.listen(8800, () => {
  connectMongoDB();
  console.log("Connected to Backend!");
});
