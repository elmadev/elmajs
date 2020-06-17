module.exports = {
  projects: [
    {
      displayName: 'node',
      roots: ['<rootDir>'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      testRegex: '.*\\.(int|unit)\\.(test|spec)\\.tsx?$',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    },
    {
      displayName: 'browser',
      roots: ['<rootDir>'],
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      testRegex: '.*\\.e2e\\.(test|spec)\\.tsx?$',
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    },
  ],
};
