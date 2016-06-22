/**
 * Created by Sienna M. Wood for MusicCrashCourses.com
 *
 * 21 June 2016
 */

var gulp = require('gulp');

/////////////////////
/* Nunjucks Script */
/////////////////////

// run '$ gulp nunjucks' in terminal to compile static pages from templates

var nunjucksRender = require('gulp-nunjucks-render');
gulp.task('nunjucks', function() {
    // Gets .html and .nunjucks files in pages
    return gulp.src('site/content/**/*.+(html|shtml|nunjucks)')
    // Renders template with nunjucks
        .pipe(nunjucksRender({
            path: ['site/templates']
        }))
        // output files in app folder
        .pipe(gulp.dest('site'))
});


