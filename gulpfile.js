'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf');

var sDevPath = 'local/templates/doctorguber/assets/src/',
    sProdPath = 'local/templates/doctorguber/assets/prod/';


gulp.task('clean', function (cb) {
    rimraf(sProdPath, cb);
});

// Js
gulp.task('js:build:global', function () {
    gulp.src([sDevPath + 'js/main.js'])
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(rename({
            basename: 'global',
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(sProdPath+'js/'));
});

gulp.task('js:build:templates', function () {
    gulp.src([sDevPath + 'js/templates/**/*.js'])
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(sProdPath+'js/templates'));
});

// Css
gulp.task('style:build:global', function () {
    gulp.src(sDevPath + 'scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [sDevPath+'scss/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(rename({
            basename: 'global',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(sProdPath + 'css/'));
});

gulp.task('style:build:templates', function () {
    gulp.src(sDevPath + 'scss/templates/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: [sDevPath + 'scss/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cssmin())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(sProdPath + 'css/templates'));
});

// Img
gulp.task('image:build', function () {
    gulp.src(sDevPath + 'img/**/*.*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(sProdPath + 'img/'));
});

// Fonts
gulp.task('fonts:build', function() {
    gulp.src(sDevPath + 'fonts/**/*.*')
        .pipe(gulp.dest(sProdPath + 'fonts/'))
});


gulp.task('build', [
    'js:build:global',
    'js:build:templates',
    'style:build:global',
    'style:build:templates',
    'image:build',
    'fonts:build'
]);


gulp.task('watch', function(){
    watch([sDevPath + 'scss/**/*.scss'], function(event, cb) {
        gulp.start('style:build:global');
        gulp.start('style:build:templates');
    });
    watch([sDevPath + 'js/**/*.js'], function(event, cb) {
        gulp.start('js:build:global');
        gulp.start('js:build:templates');
    });
    watch([sDevPath + 'img/**/*.*'], function(event, cb) {
        gulp.start('image:build');
    });
});

gulp.task('default', ['build', 'watch']);