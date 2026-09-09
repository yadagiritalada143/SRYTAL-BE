import { Document, Types } from 'mongoose';

export type NavSurface = 'Employee' | 'admin';

export interface INavItem extends Document {
    key: string;
    label: string;
    url?: string;
    icon: string;
    surface: NavSurface;
    parentKey?: string | null;
    order: number;
    isSystem: boolean;
}

export interface INavRoleAccess extends Document {
    organization: Types.ObjectId;
    role: string;
    navKeys: string[];
}

export interface INavUserAccess extends Document {
    organization: Types.ObjectId;
    userId: Types.ObjectId;
    addedKeys: string[];
    removedKeys: string[];
}

// Shape of a resolved menu node returned to the client.
export interface NavMenuNode {
    key: string;
    label: string;
    url?: string;
    icon: string;
    order: number;
    isSystem: boolean;
    children?: NavMenuNode[];
}

export interface GetMyNavMenuResponse {
    success: boolean;
    surface?: NavSurface;
    menu?: NavMenuNode[];
    allowedUrls?: string[];
    managedUrls?: string[];
    message?: string;
}
