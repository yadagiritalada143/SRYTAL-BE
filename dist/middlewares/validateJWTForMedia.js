"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET_KEY = process.env.SECRET_KEY;
/**
 * JWT validation for media/content endpoints that are opened directly in a new
 * browser tab. A new tab opened via window.open cannot send custom headers, so
 * this variant also accepts the token from the `auth_token` query parameter
 * (in addition to the usual header). Use only for GET endpoints that stream or
 * redirect to content.
 */
const validateJWTForMedia = (req, res, next) => {
    var _a;
    const authToken = req.headers['auth_token'] ||
        ((_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]) ||
        req.query.auth_token;
    if (!authToken) {
        return res.status(401).json({ message: 'No token provided !' });
    }
    jsonwebtoken_1.default.verify(authToken, SECRET_KEY, (error, decoded) => {
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
exports.default = validateJWTForMedia;
