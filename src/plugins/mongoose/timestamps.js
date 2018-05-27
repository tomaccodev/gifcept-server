/**
 * @param {Mongoose.Schema} schema
 * @param {boolean} creation
 * @param {boolean} update
 * @param {string} creationField
 * @param {string} updateField
 * @param {boolean|int} indexCreation
 * @param {boolean|int} indexUpdate
 * @param {boolean} updateTimestampOnCreation
 */
module.exports = (
  schema,
  {
    creation = true,
    update = true,
    creationField = 'created',
    updateField = 'updated',
    indexCreation = false,
    indexUpdate = false,
    updateTimestampOnCreation = false,
  } = {},
) => {
  if (creation) {
    schema.add({ [creationField]: Date });
  }

  if (update) {
    schema.add({ [updateField]: Date });
  }

  // Bind pre save hook for schema
  schema.pre('save', function schemaWithTimestampsPreSave(next) {
    try {
      const now = new Date();
      if (creation && !this[creationField]) {
        this[creationField] = now;
      }
      if (update) {
        this[updateField] = updateTimestampOnCreation || !this.isNew ? now : null;
      }
      next();
    } catch (err) {
      next(err);
    }
  });

  if (update) {
    // Bind pre update hook for schema http://mongoosejs.com/docs/middleware.html#notes
    schema.pre('update', function schemaWithTimestampsPreUpdate() {
      this.update({}, { $set: { [updateField]: new Date() } });
    });
  }

  if (creation && indexCreation !== false) {
    schema.path(creationField).index(indexCreation);
  }

  if (update && indexUpdate !== false) {
    schema.path(updateField).index(indexUpdate);
  }
};
