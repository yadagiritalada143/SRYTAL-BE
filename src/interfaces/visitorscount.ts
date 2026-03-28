import { Document } from 'mongoose';

interface IVisitorscount extends Document {
  visitorCount: number;
  lastUpdatedAt: Date;
}

export default IVisitorscount;
