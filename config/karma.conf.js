basePath = '../';

files = [
    JASMINE,
    JASMINE_ADAPTER,
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'bower_components/binarta.web.storage.angular/src/web.storage.js',
    'bower_components/momentjs/moment.js',
    'src/**/*.js',
    'test/**/*.js'
];

autoWatch = true;

browsers = ['PhantomJS'];

junitReporter = {
    outputFile: 'test_out/unit.xml',
    suite: 'unit'
};
