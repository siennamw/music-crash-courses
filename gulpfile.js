/* Gulp definitions for Music Crash Courses
 *
 * Copyright (C) Sienna M. Wood 2016
 * 25 June 2016
 */

var gulp = require('gulp'),
    nunjucksRender = require('gulp-nunjucks-render'),
    less = require('gulp-less'),
    ext_replace = require('gulp-ext-replace'),
    del = require('del'),
    gpath = require('path'),
    webserver = require('gulp-webserver'),
    rsync = require('gulp-rsync');


/* Build
 * -----------------------------------*/
gulp.task('build', ['nunjucks', 'ext404', 'copyFonts', 'copyCSS', 'copyJS']);
// also make this the default
gulp.task('default', ['build']);

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
        .pipe(gulp.dest('./build')
    );
});

/* Change extension on 404 to .shtml
 * -----------------------------------*/
gulp.task('ext404', ['nunjucks'], function () {
    gulp.src('./build/404.html')
        .pipe(ext_replace('.shtml'))
        .pipe(gulp.dest('./build'));
    return del([
        './build/404.html'
    ]);
});

/* Copy Font-Awesome Fonts to build
 * -----------------------------------*/
gulp.task('copyFonts', function () {
    gulp.src('./node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest('./build/fonts')
    );
});

/* Compile LESS to sources
 * -----------------------------------*/
gulp.task('less', function () {
    return gulp.src('./sources/css/*.+(less|css)')
        .pipe(less({
            paths: [gpath.join(__dirname, 'less', 'includes')]
        }))
        .pipe(gulp.dest('./sources/css')
    );
});

/* Copy CSS to build
 * -----------------------------------*/
gulp.task('copyCSS', ['less'], function () {
    gulp.src('./sources/css/mcc_styles.css')
        .pipe(gulp.dest('./build/css')
    );
});

/* Copy JS to build
 * -----------------------------------*/
gulp.task('copyJS', function () {
    gulp.src(['./sources/js/mcc_scripts.js',
        './sources/sienna-boilerplate/sienna-boilerplate.js'])
        .pipe(gulp.dest('./build/js')
    );
});

/* Local Server
 * ---------------------------------- */
gulp.task('serve', function () {
    gulp.src('build')
        .pipe(webserver({
            port: '9090',
            livereload: true,
            directoryListing: {
                enable: true,
                path: 'build'
            },
            open: true
        })
    );
});

/* Deploy
 * -----------------------------------*/
gulp.task('deploy', ['build'], function () {
    return gulp.src('build/**')
        .pipe(rsync({
            root: 'build/',
            hostname: 'siennasg@74.220.215.85',
            destination: 'public_html/musiccrashcourses'
        })
    );
});
