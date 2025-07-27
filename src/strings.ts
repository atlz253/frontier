export default {
  error: {
    missingDependencies: (dependencies: string[]) =>
      `the following dependencies could not be found: ${dependencies.join()}`,
  },
};
