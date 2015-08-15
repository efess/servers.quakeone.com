'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');

gulp.task('default', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: ['./public/js/App/main.js'],
    debug: true
  });

  return b.bundle()
    .pipe(source('main.js'))
    .pipe(buffer())
    // .pipe(sourcemaps.init({loadMaps: true}))
    //     // Add transformation tasks to the pipeline here.
    //     .pipe(uglify())
    //     .on('error', gutil.log)
    // .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js/'));
});

// add custom browserify options here
var customOpts = {
  entries: ['./public/js/App/main.js'],
  debug: true
};
var opts = extend({}, watchify.args, customOpts);
var b = watchify(browserify(opts)); 

gulp.task('js', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    // .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
    //     // Add transformation tasks to the pipeline here.
    // .pipe(uglify())
    //     .on('error', gutil.log)
    // .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'));
}


function extend( defaults, options ) {
    var extended = {};
    var prop;
    for (prop in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
            extended[prop] = defaults[prop];
        }
    }
    for (prop in options) {
        if (Object.prototype.hasOwnProperty.call(options, prop)) {
            extended[prop] = options[prop];
        }
    }
    return extended;
};