var browserify = require('browserify');
var clean = require('gulp-clean');
var gulp = require('gulp');
var gutil = require('gulp-util');
var open = require('gulp-open');
var tap = require('gulp-tap');
var watch = require('gulp-watch');

gulp.task('default', function() {

});

gulp.task('browserify', function() {
  var stream = gulp.src('src/main.js', {read: false})
    .pipe(tap(function(file) {
      gutil.log('bundling ' + file.path);
      file.contents = browserify(file.path, {debug: true}).bundle();
    }))
    .pipe(gulp.dest('dist'));
  return stream;
});

gulp.task('build-web', ['browserify'], function() {
  var stream = gulp.src('index.html')
    .pipe(gulp.dest('dist'));
  return stream;
});

gulp.task('show-web', ['build-web'], function() {
  gulp.src('dist/index.html')
    .pipe(open());
});

gulp.task('watch-web', ['show-web'], function() {
  watch('src/*.js', function() {
    gulp.start('build-web');
  });
});

gulp.task('clean-dist', function () {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});
