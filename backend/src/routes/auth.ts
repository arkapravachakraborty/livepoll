import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { userTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { verifyToken } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;


// --- REGISTER ---
// router.post('/register', async (req, res) => {
//     const { name, email, password } = req.body;
//     try {
//         // Check if user exists
//         const existingUser = await db.select().from(userTable).where(eq(userTable.email, email));
//         if (existingUser.length > 0) {
//             return res.status(400).json({ error: "Email already in use" });
//         }

//         // Hash password
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         // Insert User
//         const [newUser] = await db.insert(userTable).values({
//             name,
//             email,
//             password: hashedPassword,
//             salt: salt, // Storing salt as per your schema
//         }).returning({ id: userTable.id, name: userTable.name });

//         if (!newUser) throw new Error("Failed to create user");
//         // Generate VIP Wristband (JWT)
//         const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

//         res.status(201).json({ message: "User created", token, user: newUser });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: "Server error during registration" });
//     }
// });

// --- LOGIN ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const users = await db.select().from(userTable).where(eq(userTable.email, email));
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        const user = users[0];
        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.isDeleted) {
            return res.status(403).json({ error: "This account has been deleted." });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: "Invalid password" });

        // Generate VIP Wristband (JWT)
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Login successful", token, user: { id: user.id, name: user.name } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error during login" });
    }
});

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    const { token } = req.body; // The token sent from the React frontend

    try {
        // 1. Verify the token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID as string,
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
            return res.status(400).json({ error: "Invalid Google token" });
        }

        const { email, name } = payload;

        // 2. Check if user already exists in our DB
        let users = await db.select().from(userTable).where(eq(userTable.email, email));
        let user = users[0];

        // 3. If they don't exist, create an account for them automatically!
        if (!user) {
            // Hackathon trick: Since your schema requires a password, generate a random impossible one
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            const [newUser] = await db.insert(userTable).values({
                name: name || "Google User",
                email: email,
                password: hashedPassword,
                salt: salt,
                emailVerified: true // We know it's verified because Google said so!
            }).returning();

            user = newUser;
        }

        if (!user) throw new Error("Failed to process user authentication");

        // 4. Generate your standard VIP Wristband (JWT)
        const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Google Login successful", token: jwtToken, user: { id: user.id, name: user.name } });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ error: "Google authentication failed" });
    }
});



// --- EMAIL TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- UPDATED REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await db.select().from(userTable).where(eq(userTable.email, email));
        if (existingUser.length > 0) return res.status(400).json({ error: "Email already in use" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 1. Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // 2. Save user WITH the OTP
        await db.insert(userTable).values({
            name,
            email,
            password: hashedPassword,
            salt: salt,
            emailVerified: false,
            otp: otp,
            otpExpiry: otpExpiry
        });

        // 3. Send the Email
        await transporter.sendMail({
            from: `"PollMaker Team" <${process.env.EMAIL_USER}>`, // Adds a professional name
            to: email,
            subject: "Your PollMaker Verification Code",
            text: `Your verification code is: ${otp}`, // Fallback for old email clients
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px;">
                    <h2 style="color: #1f2937; text-align: center;">Welcome to PollMaker!</h2>
                    <p style="color: #4b5563; text-align: center; font-size: 16px;">Please use the following 6-digit code to verify your account:</p>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                        <h1 style="margin: 0; font-size: 40px; letter-spacing: 8px; color: #2563eb;">${otp}</h1>
                    </div>
                    <p style="color: #6b7280; text-align: center; font-size: 14px;">This code will expire in 10 minutes.</p>
                </div>
            `
        });

        // 4. Do NOT send the JWT yet! Just tell the frontend to move to the next step.
        res.status(201).json({ message: "OTP sent to email", requiresVerification: true, email: email });
    } catch (error) {
        res.status(500).json({ error: "Server error during registration" });
    }
});

// --- NEW VERIFY OTP ROUTE ---
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const users = await db.select().from(userTable).where(eq(userTable.email, email));
        const user = users[0];

        if (!user) return res.status(404).json({ error: "User not found" });
        if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
        if (new Date() > user.otpExpiry!) return res.status(400).json({ error: "OTP expired" });

        // OTP is correct! Clear the OTP from the database and verify them
        await db.update(userTable)
            .set({ emailVerified: true, otp: null, otpExpiry: null })
            .where(eq(userTable.id, user.id));

        // NOW give them the VIP Wristband (JWT)
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Email verified", token, user: { id: user.id, name: user.name } });
    } catch (error) {
        res.status(500).json({ error: "Server error during verification" });
    }
});


router.delete('/delete-account', verifyToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        // 1. Fetch the user so we know what their current email is
        const users = await db.select().from(userTable).where(eq(userTable.id, userId));
        const user = users[0];

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 2. Create a scrambled "ghost" email using the current timestamp
        // E.g., "deleted_1715600000_john@gmail.com"
        const scrambledEmail = `deleted_${Date.now()}_${user.email}`;

        // 3. Update the database: Flip the switch AND scramble the email!
        await db.update(userTable)
            .set({
                isDeleted: true,
                email: scrambledEmail // This frees up their original email for re-registration!
            })
            .where(eq(userTable.id, userId));

        res.status(200).json({ message: "Account successfully deleted" });
    } catch (error) {
        console.error("Delete Account Error:", error);
        res.status(500).json({ error: "Failed to delete account" });
    }
});


export default router;