import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { IProgramminglanguages } from '../interfaces/programminglanguages';

const ProgrammingLanguagesSchema: Schema = new mongoose.Schema({
    languageName: { type: mongoose.Schema.Types.String, required: true, unique: true },
    canonicalKey: { type: mongoose.Schema.Types.String, required: true, unique: true, trim: true },
    wandboxLabel: { type: mongoose.Schema.Types.String, required: true, trim: true },
    isActive: { type: mongoose.Schema.Types.Boolean, required: true, default: true },
    isExecutable: { type: mongoose.Schema.Types.Boolean, required: true, default: true },
    displayOrder: { type: mongoose.Schema.Types.Number, default: 0 },
}, {
    collection: 'programming-languages',
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});

ProgrammingLanguagesSchema.plugin(uniqueValidator);

const ProgrammingLanguages = mongoose.model<IProgramminglanguages>('ProgrammingLanguagesSchema', ProgrammingLanguagesSchema);

export default ProgrammingLanguages;