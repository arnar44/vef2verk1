const gulp = require('gulp');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');
const sass = require('gulp-sass');


gulp.task('default', ['sass', 'browser-sync'], () => {
  gulp.watch('scss/*.scss', ['sass']);
});

gulp.task('sass', () => {
  gulp.src('./scss/styles.scss')
    .pipe(sass({ includePaths: ['scss'] }))
    .pipe(gulp.dest('./public/'));
});

gulp.task('browser-sync', ['nodemon'], () => {
  browserSync.init(null, {
    proxy: 'http://localhost:3000',
    files: ['public/**/*.*', 'views/**/*.*'],
    browser: 'chrome.exe',
    port: 7000,
  });
});
gulp.task('nodemon', (cb) => {
  let started = false;

  return nodemon({
    script: 'app.js',
  }).on('start', () => {
    if (!started) {
      cb();
      started = true;
    }
  });
});
