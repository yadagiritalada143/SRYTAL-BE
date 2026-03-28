import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';

const OrganizationThemesSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId },
    organization_name: {
      type: mongoose.Schema.Types.String,
      required: true,
      unique: true,
    },
    organization_theme: {
      organization: { type: mongoose.Schema.Types.String },
      logo: { type: mongoose.Schema.Types.String },
      theme: {
        primaryColor: { type: mongoose.Schema.Types.String },
        colorScheme: { type: mongoose.Schema.Types.String },
        fontFamily: { type: mongoose.Schema.Types.String },
        button: {
          color: { type: mongoose.Schema.Types.String },
          textColor: { type: mongoose.Schema.Types.String },
        },
        colors: {
          primary: [{ type: mongoose.Schema.Types.String }],
          secondary: [{ type: mongoose.Schema.Types.String }],
        },
        color: { type: mongoose.Schema.Types.String },
        backgroundColor: { type: mongoose.Schema.Types.String },
        borderColor: { type: mongoose.Schema.Types.String },
        linkColor: { type: mongoose.Schema.Types.String },
        headerBackgroundColor: { type: mongoose.Schema.Types.String },
      },
    },
  },
  {
    collection: 'organization-themes',
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

OrganizationThemesSchema.plugin(uniqueValidator);

const OrganizationThemesModel = mongoose.model(
  'OrganizationThemesSchema',
  OrganizationThemesSchema
);
export default OrganizationThemesModel;
