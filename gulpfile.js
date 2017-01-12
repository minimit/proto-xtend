'use strict';

var gulp = require('gulp');
var fs = require('fs');
var pump = require('pump');
var sass = require('gulp-sass');
var gulpif = require('gulp-if');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
var runSequence = require('run-sequence');
var injectString = require('gulp-inject-string');

// main

gulp.task('default', ['build']);

gulp.task('build', ['version'], function(done) {
  runSequence(['scss', 'js'], function(done) {
    runSequence(['site'], function(done) {
      runSequence(['bower']);
    });
  });
});

gulp.task('watch', ['version'], function(done) {
  runSequence(['scss', 'js'], function(done) {
    runSequence(['site'], function(done) {
      runSequence(['bower'], function(done) {
        runSequence(['version:watch', 'scss:watch', 'js:watch']);
      });
    });
  });
});

// scss

gulp.task('scss:watch', function() {
  gulp.watch(['src/docs/assets/styles/*.scss', 'src/docs/assets/xtend/*.scss'], ['scss']);
});
gulp.task('scss', ['scss-demos'], function() {
  return gulp.src('src/docs/assets/styles/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('src/docs/assets/styles/'));
});
gulp.task('scss-demos', ['scss-dist'], function() {
  return gulp.src('src/docs/demos/**/*.scss')
    .pipe(sass({
      outputStyle: 'nested'
    }))
    .pipe(gulp.dest('src/docs/demos/'));
});
gulp.task('scss-dist', function() {
  /*
  var condition = function (f) {
    return /xtend-theme/.test(f.path);
  }
  return gulp.src('dist/*.scss')
    .pipe(gulpif(condition, sass({
      outputStyle: 'nested'
    }), sass({
      outputStyle: 'compressed'
    })))
    .pipe(gulp.dest('dist/'));
  */
  return gulp.src('src/docs/assets/xtend/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('src/docs/assets/xtend/'));
});

// js

gulp.task('js:watch', function() {
  gulp.watch(['src/docs/assets/scripts/*.js', 'src/docs/assets/xtend/*.js'], ['js']);
});
gulp.task('js', function(cb) {
  pump([
    gulp.src(['src/docs/assets/xtend/*.js', '!src/docs/assets/xtend/*.min.js']),
    uglify({
      preserveComments: 'license'
    }),
    rename({
      suffix: '.min'
    }),
    gulp.dest('src/docs/assets/xtend/')
    ], cb);
});

// version

gulp.task('version:watch', function() {
  gulp.watch(['package.json'], ['version-changed']);
});
gulp.task('version-changed', ['version'], function(done) {
  runSequence(['scss', 'js']);
});
gulp.task('version', function() {
  var version = JSON.parse(fs.readFileSync('package.json')).version;
  // inject _config.yml
  gulp.src('_config.yml')
    .pipe(injectString.replace(/version: (.*)/, 'version: ' + version))
    .pipe(gulp.dest(''));
  // inject scss and js
  var banner = "/*! xtend v" + version + " (http://)\n" + "@copyright (c) 2016 - 2017 Riccardo Caroli\n" + "@license MIT (https://github.com/minimit/xtend/blob/master/LICENSE) */";
  return gulp.src(['dist/*.scss', 'dist/*.js'])
    .pipe(injectString.replace(/\/\*\![^\*]+\*\//, banner))
    .pipe(gulp.dest('dist/'));
});

// site

gulp.task('site', function() {
  require('child_process').exec('jekyll serve', function(err, stdout, stderr) {
    console.log(stdout);
  });
});

// inject bower

gulp.task('bower', function() {
  return gulp.src('bower.json')
    .pipe(inject(gulp.src(['dist/*.scss', 'dist/*.css', 'dist/*.js'], {read: false}), {
      starttag: '"main": [',
      endtag: ']',
      transform: function (filepath, file, i, length) {
        return '"' + filepath + '"' + (i + 1 < length ? ', ' : '');
      }
    }))
    .pipe(gulp.dest(''));
});