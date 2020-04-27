import { Document, model, Schema, Types } from 'mongoose';

import timestamps, { IWithCreated, IWithUpdated } from '../middleware/mongoose/timestamps';

import { Rating } from './common/constants';

export interface IImportationUrl extends Document, IWithCreated {
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

export interface IGifFile extends Document, IWithCreated, IWithUpdated {
  md5checksum: string;
  width: number;
  height: number;
  color: string;
  fileSize: number;
  frameFileSize: number;
  importationUrls: Types.DocumentArray<IImportationUrl>;
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
      validate: [(v) => v.match(/^#[\da-f]{6}$/i), 'Invalid color'],
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

export default model<IGifFile>('GifFile', GifFileSchema);
