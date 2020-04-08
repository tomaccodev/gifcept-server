import { Schema } from 'mongoose';

export interface INormalizeJSONOptions {
  rename?: {
    [key: string]: string;
  };
  remove?: string[];
}

/**
 * @param {Mongoose.Schema} schema
 * @param {object} rename
 * @param string[] remove
 */
export default (
  schema: Schema,
  {
    rename = {
      _id: 'id',
    },
    remove = ['__v'],
  }: INormalizeJSONOptions = {},
) => {
  schema.set('toJSON', {
    transform: (doc, json) => {
      for (const [from, to] of Object.entries(rename)) {
        const parts = from.split('.');
        let value = json[parts[0]];
        for (const part of parts.slice(1)) {
          value = value[part];
        }
        delete json[from];
        json[to] = value;
      }

      for (const prop of remove) {
        if (typeof json[prop] !== 'undefined') {
          delete json[prop];
        }
      }

      return json;
    },
  });
};
