import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY!;

const validateJWT = (req: Request, res: Response, next: NextFunction) => {
    const authToken: any = req.headers['auth_token'] || req.headers['authorization']?.split(' ')[1];
    if (authToken) {
        jwt.verify(authToken, SECRET_KEY, (error: any, decoded: any) => {
            if (error) {
                return res.status(403).json({ message: "Invalid token !" });
            }
            req.body.userId = decoded.userId || '';
            req.body.organizationId = decoded.organizationId || '';
            next();
        });
    } else {
        res.status(401).json({ message: "No token provided !" });
    }
}

export default validateJWT;