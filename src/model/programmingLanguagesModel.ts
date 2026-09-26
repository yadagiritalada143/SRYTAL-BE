import mongoose, { Schema } from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import { IProgramminglanguages } from '../interfaces/programminglanguages';

const ProgrammingLanguagesSchema: Schema = new mongoose.Schema({
    languageName: { type: mongoose.Schema.Types.String, required: true, unique: true },
}, {
    collection: 'programming-languages',
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});

ProgrammingLanguagesSchema.plugin(uniqueValidator);

const ProgrammingLanguages = mongoose.model<IProgramminglanguages>('ProgrammingLanguagesSchema', ProgrammingLanguagesSchema);

export default ProgrammingLanguages;
