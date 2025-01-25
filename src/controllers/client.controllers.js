import User from "../models/client.models.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Nodemailer configuration
const mailTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: "elmer.strosin5@ethereal.email",
        pass: "tBwAuJqpe3wV5kJrY1",
    },
});

// Function to generate a random password
function createRandomPassword(len) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let randomPass = "";
    for (let i = 0; i < len; i++) {
        const randIndex = Math.floor(Math.random() * chars.length);
        randomPass += chars[randIndex];
    }
    return randomPass;
}

// Register User Function
const createNewUser = async (req, res) => {
    try {
        const { cnic, email, fullName } = req.body;

        // Input validation
        if (!cnic) return res.status(400).json({ message: "CNIC number is required!" });
        if (!fullName) return res.status(400).json({ message: "Name is required!" });
        if (!email) return res.status(400).json({ message: "Email is required!" });

        // Check if user already exists
        const isUserExists = await User.findOne({ email });
        if (isUserExists) {
            return res.status(400).json({ message: "User already registered!" });
        }

        // Generate a random password
        const tempPassword = createRandomPassword(10);

        // Save user data to the database
        await User.create({ cnic, name: fullName, email, password: tempPassword });

        // Send email with login details
        await mailTransporter.sendMail({
            from: '"Support Team 👻" <support@yourapp.com>',
            to: email,
            subject: "Welcome to Our Service ✔",
            text: `Your temporary password is: ${tempPassword}`,
            html: `<b>Welcome to our app!</b><br>Your temporary password is: <strong>${tempPassword}</strong>`,
        });

        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("Error in createNewUser:", err.message);
        res.status(500).json({ message: "Internal server error!" });
    }
};

// Client Login Function
const userLogin = async (req, res) => {
    const { cnic, password } = req.body;

    // Input validation
    if (!cnic) return res.status(400).json({ message: "CNIC is required!" });
    if (!password) return res.status(400).json({ message: "Password is required!" });

    try {
        // Find user by CNIC
        const existingUser = await User.findOne({ cnic });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found!" });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password!" });
        }

        res.status(200).json({ message: "Login successful!" });
    } catch (err) {
        console.error("Error in userLogin:", err.message);
        res.status(500).json({ message: "Internal server error!" });
    }
};

export { createNewUser, userLogin };
