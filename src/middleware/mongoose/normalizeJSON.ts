import { Schema } from 'mongoose';

export interface NormalizeJSONOptions {
  rename?: {
    [key: string]: string;
  };
  remove?: string[];
  virtuals?: boolean;
}

/**
 * @param {Mongoose.Schema} schema
 * @param {object} rename
 * @param string[] remove
 */
export default (
  schema: Schema,
  { rename = {}, remove = ['__v'], virtuals = true }: NormalizeJSONOptions = {},
): void => {
  schema.set('toJSON', {
    virtuals,
    transform: (_, json) => {
      // handle renames
      for (const [from, to] of Object.entries(rename)) {
        const parts = from.split('.');
        let value = json;
        for (const part of parts) {
          value = value[part];
        }
        delete json[from];
        json[to] = value;
      }

      // handle removals
      for (const prop of remove) {
        const parts = prop.split('.');
        let sources = [json];
        for (const part of parts.slice(0, -1)) {
          if (part === '*') {
            sources = sources.flat();
          } else {
            sources = sources.map((s) => s[part]);
          }
        }
        const sourceProp = parts.slice(-1)[0];
        for (const source of sources) {
          if (typeof source[sourceProp] !== 'undefined') {
            delete source[sourceProp];
          }
        }
      }

      return json;
    },
  });
};
