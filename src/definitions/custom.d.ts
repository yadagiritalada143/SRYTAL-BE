declare namespace Express {
    export interface Request {
        file?: Multer.File;
        user?: {
            userId: string;
            organizationId: string;
        };
    }
}
