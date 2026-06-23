import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY!;

/**
 * JWT validation for media/content endpoints that are opened directly in a new
 * browser tab. A new tab opened via window.open cannot send custom headers, so
 * this variant also accepts the token from the `auth_token` query parameter
 * (in addition to the usual header). Use only for GET endpoints that stream or
 * redirect to content.
 */
const validateJWTForMedia = (req: Request, res: Response, next: NextFunction) => {
    const authToken: any =
        req.headers['auth_token'] ||
        req.headers['authorization']?.split(' ')[1] ||
        req.query.auth_token;

    if (!authToken) {
        return res.status(401).json({ message: 'No token provided !' });
    }

    jwt.verify(authToken, SECRET_KEY, (error: any, decoded: any) => {
        if (error) {
            return res.status(403).json({ message: 'Invalid token !' });
        }
        req.user = {
            userId: decoded.userId || '',
            organizationId: decoded.organizationId || '',
        };
        next();
    });
};

export default validateJWTForMedia;
