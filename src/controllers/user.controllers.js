import usersModels from "../models/user.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Helper functions for token generation
const createAccessToken = (user) => {
    return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
        expiresIn: "6h",
    });
};
const createRefreshToken = (user) => {
    return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
        expiresIn: "7d",
    });
};

// Nodemailer Setup (currently commented out)
// import nodemailer from "nodemailer";

// const emailTransporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.SMTP_SECRET,
//     },
// });

// Sign-Up API
// emailTransporter.sendMail({
//     from: '"Umar Farooq 👻"',
//     to: `${email}, ${process.env.EMAIL}`,
//     subject: `Registration`,
//     text: `Hello ${fullname}, you have successfully registered to our E-commerce Store.`,
//     html: `<br>Welcome ${fullname} <br/>We're thrilled to have you here. Explore, connect, and enjoy a seamless experience tailored just for you. If you need assistance, our team is here to help. Let's make great things happen together!</b>`,
// });

export const registerUser = async (req, res) => {
    const { fullname, email, password } = req.body;

    if (!fullname) return res.status(400).json({ message: "Full name is required!" });
    if (!email) return res.status(400).json({ message: "Email is required!" });
    if (!password) return res.status(400).json({ message: "Password is required!" });

    try {
        const existingUser = await usersModels.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists!" });

        // Save new user to the database
        await usersModels.create({ fullname, email, password });

        res.status(200).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(400).json({ message: "An error occurred during registration." });
        console.error("Error in registerUser:", error);
    }
};

// Login API
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required!" });
        if (!password) return res.status(400).json({ message: "Password is required!" });

        // Find user in the database
        const userRecord = await usersModels.findOne({ email });
        if (!userRecord) return res.status(404).json({ message: "No user found with this email!" });

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, userRecord.password);
        if (!isPasswordValid) return res.status(400).json({ message: "Invalid password!" });

        // Generate access and refresh tokens
        const accessToken = createAccessToken(userRecord);
        const refreshToken = createRefreshToken(userRecord);

        // Set refresh token as a cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // Use secure cookies
            sameSite: "None",
        });

        res.status(200).json({
            message: "User logged in successfully!",
            accessToken,
            user: userRecord,
        });
    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ message: "An error occurred during login." });
    }
};
