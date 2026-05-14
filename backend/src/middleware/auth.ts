import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Unauthorized. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // FIX: Attach it to req.user!
        req.user = decoded;

        next();
    } catch (error) {
        // PRO TIP: Log the actual error so you can see if it's a JWT issue or a code crash!
        console.log("Bouncer Error:", error);
        return res.status(403).json({ error: "Invalid or expired token." });
    }
};