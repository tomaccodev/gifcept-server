import { Document, model, Schema } from 'mongoose';

import timestamps, { IWithCreated, IWithUpdated } from '../middleware/mongoose/timestamps';

export interface ITag extends Document, IWithCreated, IWithUpdated {
  name: string;
}

const TagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
  },
  { collection: 'tags' },
).plugin(timestamps);

module.exports = model<ITag>('Tag', TagSchema);
