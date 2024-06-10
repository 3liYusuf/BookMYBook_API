import Role from "../models/Role.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { CreateError } from "../utils/err.js";
import { CreateSuccess } from "../utils/success.js";
import jwt from "jsonwebtoken";
import UserToken from "../models/UserToken.js";
import nodemailer from "nodemailer";

export const register = async (req, res, next) => {
  try {
    const role = await Role.find({ role: "User" });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      password: hashPassword,
      roles: role,
    });
    await newUser.save();
    const savedUser = await User.findById(newUser._id);

    return next(CreateSuccess(200, "User Registered SuccessFully!", savedUser));
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const registerAdmin = async (req, res, next) => {
  try {
    const role = await Role.find({});
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
      email: req.body.email,
      password: hashPassword,
      isAdmin: true,
      roles: role,
    });
    await newUser.save();
    const savedUser = await User.findById(newUser._id);

    return next(
      CreateSuccess(200, "Admin Registered SuccessFully!", savedUser)
    );
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).populate(
      "roles",
      "role"
    ); //(varname, its Ref)
    if (!user) {
      return next(CreateError(404, "User Not Found!"));
    }
    const { roles } = user;

    const isPassCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPassCorrect) {
      return next(CreateError(400, "Pass not correct!"));
    }
    const token = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
        roles: roles,
      },
      process.env.JWT_SECRET
    );
    res.cookie("access_token", token, { httpOnly: true }).status(200).json({
      status: 200,
      message: "Login Success",
      data: user,
      token:token
    });

    // const savedUser = await User.findById(user._id);
    // return next(CreateSuccess(200,"Login SuccessFully!", savedUser))
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const sendEmail = async (req, res, next) => {
  const email = req.body.email;
  console.log("email:", email);
  const user = await User.findOne({
    email: new RegExp("^" + email + "$", "i"),
  });
  console.log("user:", user);

  if (!user) {
    return next(CreateError(404, "User not found to reset"));
  }
  const payload = {
    email: user.email,
  };
  console.log("payload:", payload);

  const expiryTime = 300;
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiryTime,
  });
  const newToken = new UserToken({
    userId: user._id,
    token: token,
  });
  console.log("newToken:", newToken);
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "alcndb@gmail.com", pass: "pbsmdpzvotfrddlw" },
  });
  console.log("mailTransporter:", mailTransporter);

  let mailDetails = {
    from: "alcndb@gmail.com",
    to: email,
    subject: "Reset Password!",
    html: `
    <html>
    <head>
      <title>Password Reset Request</title>
    </head>
    <body>
      <h1>Password Reset Request</h1>
      <p>Dear ${user.firstName}.</p>
      <p>He have received a request to reset your password for your account with BookMYBook. To complete the password reset process, please click on the button below:</p>
      <a href=${process.env.LIVE_URL}/reset/${token}><button style="background-color: #4CAF50; color: white; padding: 14px 20px; border: none; cursor: pointer; border-radius: 4px;">Reset Password</button></a>
      <p>Please note that this link is only valid for a Slins. If you did not request a password reset, please disregard this nessage.</p>
      <p>Thank you,</p>
      <p>Let's Program Team</p>
    </body>
  </html>
    `,
  };
  console.log("mailDetails:", mailDetails);
  mailTransporter.sendMail(mailDetails, async (err, data) => {
    if (err) {
      console.log("This is the error:", err);
      return next(
        CreateError(500, "Something went wrong while sending the email!")
      );
    } else {
      await newToken.save();
      return next(CreateSuccess(200, "Email Sent Successfully!"));
    }
  });
};

export const resetPassword = async (req, res, next) => {
  const token = req.body.token;
  const newPassword = req.body.password;

  jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
    if (err) {
      console.log('err:', err);
      return next(CreateError(500, "Reset Link is Expired!"));
    } else {
      try {
        const user = await User.findOne({ email: new RegExp("^" + data.email + "$", "i") });
        if (!user) {
          return next(CreateError(404, "User not found!"));
        }

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(newPassword, salt);
        user.password = encryptedPassword;

        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: { password: user.password } },
          { new: true }
        );

        if (!updatedUser) {
          return next(CreateError(500, "Failed to update password!"));
        }

        return next(CreateSuccess(200, "Password Reset Successfully!"));
      } catch (error) {
        console.error(error);
        return next(CreateError(500, "Internal Server Error"));
      }
    }
  });
};
