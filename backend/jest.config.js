export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    // This regex maps imports ending in .js to the file itself (stripping .js)
    // which is often needed in Jest ESM mode
    '^(\\.\\.?\\/.*)\\.js$': '$1',
  },
  verbose: true,
  injectGlobals: true,
};
