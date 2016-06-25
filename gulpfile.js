/* Gulp definitions for Music Crash Courses
 *
 * Copyright (C) Sienna M. Wood 2016
 * 25 June 2016
 */

var gulp = require('gulp'),
    nunjucksRender = require('gulp-nunjucks-render'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    watch = require('gulp-watch'),
    path = require('path');


/* Build
* -----------------------------------*/
gulp.task('build', ['nunjucks', 'copyFonts', 'copyCSS', 'copyJS']);

/* Nunjucks
 * -----------------------------------*/
gulp.task('nunjucks', function () {
    // Gets .html, .shtml, and .nunjucks files in sources/content
    return gulp.src('./sources/content/**/*.+(html|shtml|nunjucks)')
    // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: ['./sources/templates']
        }))
        // output files in build folder
        .pipe(gulp.dest('./build'))
});

/* Copy Font-Awesome Fonts to build
 * -----------------------------------*/
gulp.task('copyFonts', function () {
    gulp.src('./node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('./build/fonts'));
});

/* Compile LESS to sources
 * -----------------------------------*/
gulp.task('less', function () {
    return gulp.src('./sources/css/*.+(less|css)')
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest('./sources/css'));
});

/* Copy CSS to build
 * -----------------------------------*/
gulp.task('copyCSS', ['less'], function () {
    gulp.src('./sources/css/mcc_styles.css')
        .pipe(gulp.dest('./build/css'));
});

/* Copy JS to build
 * -----------------------------------*/
gulp.task('copyJS', function () {
    gulp.src('./sources/js/mcc_scripts.js')
        .pipe(gulp.dest('./build/js'));
    gulp.src('./sources/sienna-boilerplate/sienna-boilerplate.js')
        .pipe(gulp.dest('./build/js'));
});
