import { Document, Schema, Types, model } from 'mongoose';

import timestamps, { WithCreated, WithUpdated } from '../middleware/mongoose/timestamps';

import { Rating } from './common/constants';

export interface ImportationUrl extends Document, WithCreated {
  url: string;
  created: Date;
}

const ImportationUrlSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
  },
  { _id: false },
).plugin(timestamps, { update: false });

export interface GifFile extends Document, WithCreated, WithUpdated {
  md5checksum: string;
  width: number;
  height: number;
  color: string;
  fileSize: number;
  frameFileSize: number;
  importationUrls: Types.DocumentArray<ImportationUrl>;
  moderatedRating: Rating;
}

const GifFileSchema = new Schema(
  {
    md5checksum: {
      type: String,
      required: true,
      index: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      required: true,
      validate: [(v): boolean => v.match(/^#[\da-f]{6}$/i), 'Invalid color'],
    },
    fileSize: {
      type: Number,
      required: true,
    },
    frameFileSize: {
      type: Number,
      required: true,
    },
    importationUrls: {
      type: [ImportationUrlSchema],
      default: [],
    },
    moderatedRating: {
      type: String,
      enum: Object.values(Rating),
    },
  },
  { collection: 'gifFiles' },
).plugin(timestamps);

export default model<GifFile>('GifFile', GifFileSchema);
