import { Document, Schema, model } from 'mongoose';

import timestamps, { WithCreated, WithUpdated } from '../middleware/mongoose/timestamps';

export interface Tag extends Document, WithCreated, WithUpdated {
  name: string;
}

const TagSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      index: 'text',
    },
  },
  { collection: 'tags' },
).plugin(timestamps);

module.exports = model<Tag>('Tag', TagSchema);
