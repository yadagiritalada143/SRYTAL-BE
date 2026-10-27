"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getAllOrganizationsBySuperadminService_1 = __importDefault(require("../../services/superadmin/getAllOrganizationsBySuperadminService"));
const getAllOrganizationsBySuperadmin = (req, res) => {
    getAllOrganizationsBySuperadminService_1.default
        .getAllOrganizationsBySuperadmin()
        .then((organizations) => {
        return res.status(200).json({ organizations });
    })
        .catch(() => {
        return res.status(500).json({ message: 'Error in fetching get organisations by super admin !' });
    });
};
exports.default = { getAllOrganizationsBySuperadmin };
