/* Gulp definitions for Music Crash Courses
 *
 * Copyright (C) Sienna M. Wood 2016
 * 25 June 2016
 */

var gulp = require('gulp'),
    nunjucksRender = require('gulp-nunjucks-render'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    ext_replace = require('gulp-ext-replace'),
    del = require('del'),
    path = require('path');


/* Build
 * -----------------------------------*/
gulp.task('build', ['nunjucks', 'ext404', 'copyFonts', 'copyCSS', 'copyJS']);

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

/* Change extension on 404 to .shtml
 * -----------------------------------*/
gulp.task('ext404', ['nunjucks'], function () {
    gulp.src('./build/404.html')
        .pipe(ext_replace('.shtml'))
        .pipe(gulp.dest('./build'));
    return del([
        './build/404.html'
    ])
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

/* Watchers (default)
 * -----------------------------------*/
gulp.task('default', function () {

    var lessWatch = gulp.watch('./sources/css/**/*.+(less|css)', ['less', 'copyCSS']);
    var contentWatch = gulp.watch('./sources/content/**/*.+(html|shtml)', ['nunjucks', 'ext404']);
    var nunjucksWatch = gulp.watch('./sources/templates/**/*.nunjucks');

    lessWatch.on('change', function (event) {
        console.log('Less event type: ' + event.type); // added, changed, or deleted
        console.log('Less event path: ' + event.path); // The path of the modified file
    });
    contentWatch.on('change', function (event) {
        console.log('Content event type: ' + event.type); // added, changed, or deleted
        console.log('Content event path: ' + event.path); // The path of the modified file
    });
    nunjucksWatch.on('change', function (event) {
        console.log('Nunjucks event type: ' + event.type); // added, changed, or deleted
        console.log('Nunjucks event path: ' + event.path); // The path of the modified file
    });
});
