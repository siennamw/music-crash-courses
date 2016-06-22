/**
 * Created by Sienna on 6/21/16.
 */

var gulp = require('gulp');

/////////////////////
/* Nunjucks Script */
/////////////////////
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


