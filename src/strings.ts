export default {
  error: {
    missingDependencies: (dependencies: string[]) =>
      `the following dependencies could not be found: ${dependencies.join()}`,
    moduleConfigNotFound: (name: string) =>
      `couldn't find a module with name: ${name}`,
    missingBuilder: (name: string) =>
      `builder could not found for module: ${name}`,
  },
};
