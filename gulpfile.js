const { src, dest, watch, parallel, series } = require("gulp");
const scss = require("gulp-sass");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const babel = require("gulp-babel");
const del = require("del");

function browsersync() {
  browserSync.init({
    server: "app/",
    notify: false,
    online: false,
  });
}

function styles() {
  return src([
    "node_modules/normalize.css/normalize.css",
    "app/scss/style.scss",
  ])
    .pipe(scss({ outputStyle: "compressed" }))
    .pipe(concat("style.min.css"))
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 version"],
        grid: true,
      })
    )
    .pipe(dest("app/css"))
    .pipe(browserSync.stream());
}

function scripts() {
  return src([
    // 'node_modules/jquery/dist/jquery.js', // add custom scripts here
    "app/js/main.js",
  ])
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
        // ignore: [
        //   "node_modules/jquery/dist/jquery.js", // Ignore library to avoid errors
        // ],
      })
    )
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
}

function images() {
  return src("app/images/**/*")
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )
    .pipe(dest("dist/images"));
}

function cleanDist() {
  return del("dist");
}

function build() {
  return src(
    [
      "app/css/style.min.css",
      "app/fonts/**/*",
      "app/js/main.min.js",
      "app/*.html",
    ],
    { base: "app" }
  ).pipe(dest("dist"));
}

function watcher() {
  // Watches for changes in SCSS folder and calls styles
  watch(["app/scss/**/*.scss"], styles);
  // Watches for changes in JS folder except app/js/main.min.js and calls scripts
  watch(["app/js/**/*.js", "!app/js/main.min.js"], scripts);
  // Watches for changes in app for html and updates browser
  watch(["app/*.html"]).on("change", browserSync.reload);
}

exports.styles = styles;
exports.watcher = watcher;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build);
exports.default = parallel(styles, scripts, browsersync, watcher);
