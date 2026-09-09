import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { INavItem } from '../interfaces/navigation';

// Master catalog of navigable menu items (the app's real pages). Global/app-wide
// and seeded; admins grant these per role/user rather than inventing free URLs.
const NavItemSchema = new mongoose.Schema(
    {
        key: { type: mongoose.Schema.Types.String, required: true, unique: true },
        label: { type: mongoose.Schema.Types.String, required: true },
        url: { type: mongoose.Schema.Types.String },
        icon: { type: mongoose.Schema.Types.String, default: 'IconCircle' },
        surface: { type: mongoose.Schema.Types.String, required: true },
        parentKey: { type: mongoose.Schema.Types.String, default: null },
        order: { type: mongoose.Schema.Types.Number, default: 0 },
        isSystem: { type: mongoose.Schema.Types.Boolean, default: false }
    },
    {
        collection: 'nav-items',
        toObject: { virtuals: true },
        toJSON: { virtuals: true }
    }
);

NavItemSchema.plugin(uniqueValidator);

const NavItemModel = mongoose.model<INavItem>('NavItemModel', NavItemSchema);

export default NavItemModel;
