'use strict';

var gulp = require('gulp');
var fs = require('fs');
var pump = require('pump');
var sass = require('gulp-sass');
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
    runSequence(['copy-dist'], function(done) {
      runSequence(['bower'], function(done) {
        runSequence(['site']);
      });
    });
  });
});

gulp.task('watch', ['version'], function(done) {
  runSequence(['scss', 'js'], function(done) {
    runSequence(['copy-dist'], function(done) {
      runSequence(['bower'], function(done) {
        runSequence(['site-serve', 'version:watch', 'scss:watch', 'js:watch']);
      });
    });
  });
});

// copy-dist

gulp.task('copy-dist', function() {
  return gulp.src('src/docs/assets/xtend/*')
    .pipe(gulp.dest('dist/'));
});

// scss

gulp.task('scss:watch', function() {
  gulp.watch(['src/docs/assets/xtend/*.scss'], ['scss']);
  gulp.watch(['src/docs/assets/styles/*.scss'], ['scss-site']);
});
gulp.task('scss', ['scss-site'], function() {
  return gulp.src('src/docs/assets/xtend/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('src/docs/assets/xtend/'));
});
gulp.task('scss-site', ['scss-demos'], function() {
  return gulp.src('src/docs/assets/styles/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('src/docs/assets/styles/'));
});
gulp.task('scss-demos', function() {
  return gulp.src('src/docs/demos/**/*.scss')
    .pipe(sass({
      outputStyle: 'nested'
    }))
    .pipe(gulp.dest('src/docs/demos/'));
});

// js

gulp.task('js:watch', function() {
  gulp.watch(['src/docs/assets/xtend/*.js'], ['js']);
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
  runSequence(['scss', 'js'], function(done) {
    runSequence(['copy-dist']);
  });
});
gulp.task('version', function() {
  var version = JSON.parse(fs.readFileSync('package.json')).version;
  // inject _config.yml
  gulp.src('_config.yml')
    .pipe(injectString.replace(/version: (.*)/, 'version: ' + version))
    .pipe(gulp.dest(''));
  // inject scss and js
  var banner = "/*! xtend v" + version + " (http://)\n" + "@copyright (c) 2016 - 2017 Riccardo Caroli\n" + "@license MIT (https://github.com/minimit/xtend/blob/master/LICENSE) */";
  return gulp.src(['src/docs/assets/xtend/*.scss', 'src/docs/assets/xtend/*.js'])
    .pipe(injectString.replace(/\/\*\![^\*]+\*\//, banner))
    .pipe(gulp.dest('src/docs/assets/xtend/'));
});

// site

gulp.task('site', function() {
  require('child_process').exec('jekyll build', function(err, stdout, stderr) {
    console.log(stdout);
  });
});
gulp.task('site-serve', function() {
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