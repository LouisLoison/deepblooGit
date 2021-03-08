module.exports = {
  roots: [
    '../lambda/',
  ],
  notify: true,
  bail: 1,
  timers: 'fake',
  moduleNameMapper: {
    '@lib/(.*)$': '<rootDir>/../lib/$1',
    '[$]lib/(.*)$': '<rootDir>/../../../lib/backend/$1',
  },
};
