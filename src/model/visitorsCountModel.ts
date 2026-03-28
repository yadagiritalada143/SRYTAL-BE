import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import IVisitorscount from '../interfaces/visitorscount';

const VisitorsCountSchema = new mongoose.Schema(
  {
    visitorCount: { type: mongoose.Schema.Types.Number },
    lastUpdatedAt: { type: mongoose.Schema.Types.Date },
  },
  {
    collection: 'visitors-count',
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

VisitorsCountSchema.plugin(uniqueValidator);

VisitorsCountSchema.virtual('id').get(function () {
  return String(this._id);
});

const VisitorsCountModel = mongoose.model<IVisitorscount>(
  'VisitorsCountSchema',
  VisitorsCountSchema
);
export default VisitorsCountModel;
