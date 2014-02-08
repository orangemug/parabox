module.exports = function(config) {
  config.set({
    singleRun: true,
    basePath: '../',
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    captureTimeout: 10000,
    autoWatch: false,
    frameworks: ['mocha', 'browserify'],
    preprocessors: {
      'test/*': ['browserify']
    },
    files: [
      'test/index.js'
    ],
    browserify: {
      extension: ['.js'],
      watch: true
    },
    reporters: [
      'progress',
    ],
    browsers: [
      'PhantomJS',
      'Chrome',
      'Firefox'
    ]
  });
};
