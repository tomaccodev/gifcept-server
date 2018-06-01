const gulp = require('gulp');

const simpleTaskFactory = require('./simpleTaskFactory');
const objectPropertiesValidatorFactory = require('../validators/objectPropertiesValidatorFactory');

const ALL_TASKS = '*';

/**
 * Generates a parallelized gulp task given an object with tasks
 * @param {object} tasksObject
 * @return function
 */
const parallelize = tasksObject =>
  gulp.parallel(...Object.keys(tasksObject).map(key => tasksObject[key]));

/**
 * Factory method for gulp tasks defined by keys
 * @param {string} namespace
 * @param {function} task
 * @param {function} configValidator
 */
module.exports = (
  namespace,
  task,
  { configValidator = objectPropertiesValidatorFactory(['src', 'dest']) } = {},
) =>
  simpleTaskFactory(namespace, config => {
    /**
     * Tasks factory
     * @param {string} tasksNamespace
     * @param {function} taskAction
     * @param {object} subtaskConfig
     * @return {object}
     */
    const taskFactory = (tasksNamespace, taskAction, subtaskConfig) => {
      const tasks = Object.keys(subtaskConfig).reduce((accumulated, key) => {
        if (configValidator(subtaskConfig[key])) {
          const currentTask = taskAction(subtaskConfig[key], key);
          currentTask.displayName = `${namespace}:${key}`;
          return {
            ...accumulated,
            [key]: currentTask,
          };
        }
        // eslint-disable-next-line no-console
        console.error(`[${key}] invalid config, fix and retry.`);
        return { ...accumulated };
      }, {});

      const parallelizedTasks = parallelize(tasks);
      parallelizedTasks.displayName = `${tasksNamespace}:${ALL_TASKS}`;

      tasks[ALL_TASKS] = parallelizedTasks;

      return tasks;
    };

    switch (typeof task) {
      case 'object': {
        const tasks = Object.keys(task).reduce(
          (accumulated, key) => ({
            ...accumulated,
            [key]: taskFactory(`${namespace}:${key}`, task[key], config),
          }),
          {},
        );

        tasks[ALL_TASKS] = gulp.parallel(Object.keys(task).map(key => tasks[key][ALL_TASKS]));

        return tasks;
      }
      case 'function':
        return taskFactory(namespace, task, config);
      default:
        // eslint-disable-next-line no-console
        console.error(
          `[${namespace}] provided task is not a function or an object, fix and retry.`,
        );
        return {};
    }
  });
