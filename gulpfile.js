require('dotenv').config();

var del = require('del');
var ext_replace = require('gulp-ext-replace');
var gpath = require('path');
var gulp = require('gulp');
var less = require('gulp-less');
var nunjucksRender = require('gulp-nunjucks-render');
var rsync = require('gulp-rsync');
var webserver = require('gulp-webserver');


/* Build
 * -----------------------------------*/
gulp.task('build', ['nunjucks', 'ext404', 'copyFonts', 'copyCSS', 'copyJS', 'copyPHP', 'copyImages', 'copyScores']);
// also make this the default
gulp.task('default', ['build']);

/* Nunjucks
 * -----------------------------------*/
gulp.task('nunjucks', function () {
  // Gets .html, .shtml, and .nunjucks files in sources/content
  return gulp.src('./sources/content/**/*.+(html|shtml|nunjucks)')
  // Renders template with nunjucks
    .pipe(nunjucksRender({
      path: ['./sources/templates'],
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
    './build/404.html',
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
      paths: [gpath.join(__dirname, 'less', 'includes')],
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

/* Copy PHP to build
 * -----------------------------------*/
gulp.task('copyPHP', function () {
  gulp.src('./sources/php/mail.php')
    .pipe(gulp.dest('./build/php')
    );
});

/* Copy images to build
 * -----------------------------------*/
gulp.task('copyImages', ['less'], function () {
  gulp.src('./sources/images/**/*')
    .pipe(gulp.dest('./build/images')
    );
});

/* Copy scores to build
 * -----------------------------------*/
gulp.task('copyScores', function () {
  gulp.src('./sources/scores/**/*')
    .pipe(gulp.dest('./build/scores')
    );
});

/* Watch styles
 * ---------------------------------- */
gulp.task('watchStyles', function () {
  gulp.watch('sources/css/mcc_styles.less', ['copyCSS']);
});

/* Watch content and templates
 * ---------------------------------- */
gulp.task('watchTemplates', function () {
  gulp.watch(['sources/content/**/*', 'sources/templates/**/*'], ['nunjucks']);
});

/* Watch images
 * ---------------------------------- */
gulp.task('watchImages', function () {
  gulp.watch('sources/images/**/*', ['copyImages']);
});

/* Watch scores
 * ---------------------------------- */
gulp.task('watchScores', function () {
  gulp.watch('sources/scores/**/*', ['copyScores']);
});

/* Local Server
 * ---------------------------------- */
gulp.task('serve', ['watchStyles', 'watchTemplates', 'watchImages', 'watchScores', 'build'], function () {
  gulp.src('build')
    .pipe(webserver({
        port: '9090',
        livereload: true,
        fallback: 'build/index.html',
        open: true,
      })
    );
});

/* Deploy
 * -----------------------------------*/
gulp.task('deploy', ['build'], function () {
  return gulp.src('build/**')
    .pipe(rsync({
        root: 'build/',
        hostname: process.env.HOSTNAME,
        destination: process.env.DESTINATION,
      })
    );
});
