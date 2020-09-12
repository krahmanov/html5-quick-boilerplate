// All Requirements
const { src, dest, series, parallel, watch } = require('gulp');
const bs = require('browser-sync').create();
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const htmlValidator = require('gulp-w3c-html-validator');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const del = require('del');

function browserSync() {
  // Start the server
  bs.init({
    server: 'dist/',
    notify: false,
    online: false,
  });
}

// HTMl
function html() {
  return src('src/html/**/*.html')
    .pipe(htmlValidator())
    .pipe(htmlValidator.reporter())
    .pipe(dest('dist/'))
    .pipe(bs.stream());
}

// Styles
function styles() {
  return src('src/sass/**/*.scss')
    .pipe(sass())
    .pipe(concat('app.min.css'))
    .pipe(
      autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })
    )
    .pipe(
      cleancss({
        level: { 1: { specialComments: 0 } },
      })
    )
    .pipe(dest('dist/css/'))
    .pipe(bs.stream());
}

// Scripts
function scripts() {
  return src([
    // 'node_modules/topbar/topbar.js', // Additional Libraries can be added this topbar one is just for example
    'src/js/**/*.js',
  ])
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
        ignore: [
          'node_modules/topbar/topbar.js', // Ignore library to avoid errors
        ],
      })
    )
    .pipe(concat('app.bundle.min.js')) // Concatination
    .pipe(uglify()) // Compression
    .pipe(dest('dist/js/'))
    .pipe(bs.stream()); // Update content with browserSync
}

function images() {
  return src('src/img/**/*').pipe(imagemin()).pipe(dest('dist/img/'));
}

function cleanImg() {
  return del('dist/img/**/*', { force: true });
}

function cleanDist() {
  return del('dist/*', { force: true });
}

function initWatch() {
  watch(['src/js/**/*.js'], scripts);
  watch(['src/sass/**/*.scss'], styles);
  watch(['src/html/*.html'], html);
  watch(['src/img/**/*'], images);
}

exports.browserSync = browserSync;
exports.scripts = scripts;
exports.html = html;
exports.styles = styles;
exports.images = images;
exports.cleanImg = cleanImg;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, styles, scripts, images, html);

exports.default = parallel(
  styles,
  scripts,
  images,
  html,
  browserSync,
  initWatch
);
