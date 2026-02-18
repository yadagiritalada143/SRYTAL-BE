"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const manageCommonService_1 = __importDefault(require("../../services/common/manageCommonService"));
const commonErrorMessages_1 = require("../../constants/commonErrorMessages");
const manageCommonService_2 = __importDefault(require("../../services/common/manageCommonService"));
const login = (req, res) => {
    const { email, password } = req.body;
    manageCommonService_2.default
        .authenticateAccount({ email, password })
        .then((authResponse) => {
        if (authResponse.success) {
            return manageCommonService_2.default.createCSRFToken().then((token) => {
                res.set('X-CSRF-Token', token);
                res.cookie('jwt', authResponse.token);
                res.json({
                    success: true,
                    id: authResponse.id,
                    userRole: authResponse.userRole,
                    passwordResetRequired: authResponse.passwordResetRequired,
                    applicationWalkThrough: authResponse.applicationWalkThrough,
                    token: authResponse.token,
                    refreshToken: authResponse.refreshToken,
                    firstName: authResponse.firstName,
                    lastName: authResponse.lastName,
                });
            });
        }
        else {
            res.status(401).json({
                success: false,
                message: commonErrorMessages_1.LOGIN_ERROR_MESSAGE.INVALID_EMAIL_PASSWORD,
            });
        }
    })
        .catch((error) => {
        console.error(error);
        res.status(500).json({
            success: false,
            message: commonErrorMessages_1.LOGIN_ERROR_MESSAGE.INTERNAL_SERVER_ERROR,
        });
    });
};
const updateVisitorCount = (req, res) => {
    manageCommonService_1.default
        .updateVisitorCount()
        .then((visitorsCountResponse) => {
        res.status(200).json({ visitorCount: visitorsCountResponse });
    })
        .catch((error) => {
        console.error(`Error in updating visitors count: ${error}`);
        res.status(500).json({
            success: false,
            message: commonErrorMessages_1.COMMON_ERRORS.VISITORS_COUNT_UPDATING_ERROR,
        });
    });
};
const refreshToken = (req, res) => {
    const refreshToken = req.headers['refresh_token'];
    if (!refreshToken)
        return res
            .status(401)
            .json({ message: 'No refresh token. Please log in again.' });
    manageCommonService_1.default
        .refreshToken(refreshToken)
        .then((token) => res.status(200).json({ token }))
        .catch((error) => {
        if (error === 'Invalid user token')
            console.error(`Failed to refresh the token: ${error}`);
        res.status(403).json({
            success: false,
            message: 'Invalid user token',
        });
    });
};
const logout = (req, res) => {
    const userId = req.body.userId;
    manageCommonService_1.default.logout(userId).then(() => {
        res.status(200).json({ success: true, message: 'Successfully logged out' });
    });
};
exports.default = { login, updateVisitorCount, refreshToken, logout };
