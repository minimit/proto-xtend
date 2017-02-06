'use strict';

var gulp = require('gulp');
var fs = require('fs');
var pump = require('pump');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');
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

// compile scss and js

gulp.task('copy-dist', ['scss', 'js'], function() {
  return gulp.src('src/docs/assets/xtend/*')
    .pipe(gulp.dest('dist/'));
});

gulp.task('scss:watch', function() {
  gulp.watch(['src/docs/assets/xtend/*.scss', 'src/docs/assets/styles/*.scss', 'src/docs/demos/**/*.scss'], ['copy-dist']);
});
gulp.task('scss', ['scss-demos'], function() {
  return gulp.src('src/docs/assets/styles/*.scss')
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('src/docs/assets/styles/'));
});
gulp.task('scss-demos', ['scss-xt'], function() {
  return gulp.src('src/docs/demos/**/*.scss')
    .pipe(sass({
      outputStyle: 'nested'
    }))
    .pipe(gulp.dest('src/docs/demos/'));
});
gulp.task('scss-xt', function() {
  return gulp.src('src/docs/assets/xtend/*.scss')
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(gulp.dest('src/docs/assets/xtend/'))
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('src/docs/assets/xtend/'));
});

gulp.task('js:watch', function() {
  gulp.watch(['src/docs/assets/xtend/*.js', '!src/docs/assets/xtend/*.min.js'], ['copy-dist']);
});
/*
gulp.task('js', ['js-xt'], function(cb) {
  pump([
    gulp.src(['src/docs/assets/scripts/*.js', '!src/docs/assets/scripts/*.min.js']),
    uglify({
      preserveComments: 'license'
    }),
    rename({
      suffix: '.min'
    }),
    gulp.dest('src/docs/assets/scripts/')
    ], cb);
});
*/
gulp.task('js', function() {
  return gulp.src(['src/docs/assets/xtend/*.js', '!src/docs/assets/xtend/*.min.js'])
    .pipe(uglify({
      preserveComments: 'license'
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('src/docs/assets/xtend/'));
});
/*
gulp.task('js-concat', function(cb) {
  return gulp.src(['src/docs/assets/xtend/scripts/xt.js', 'src/docs/assets/xtend/scripts/*.js'])
    .pipe(concat('xt.js'))
    .pipe(gulp.dest('src/docs/assets/xtend/'));
});
*/

// version

gulp.task('version:watch', function() {
  gulp.watch(['package.json'], ['version-changed']);
});
gulp.task('version-changed', ['version'], function(done) {
  runSequence(['scss', 'js', 'site'], function(done) {
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
  var banner = "/*! xtend v" + version + " (http://www.minimit.com/xtend/)\n" + "@copyright (c) 2016 - 2017 Riccardo Caroli\n" + "@license MIT (https://github.com/minimit/xtend/blob/master/LICENSE) */";
  return gulp.src(['src/docs/assets/xtend/**/*.scss', 'src/docs/assets/xtend/**/*.js'])
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