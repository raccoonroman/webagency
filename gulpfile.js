"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber"); // видит ошибку, но не прерывает программы, а выводит ошибку в консоль
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create(); // локальный сервер для разработки

var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require('gulp-imagemin');
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml"); // нужен вместе с пакетом posthtml-include, чтобы развернуть svg-спрайт из include
var include = require("posthtml-include");
var htmlmin = require("gulp-htmlmin"); // to minify HTML
var del = require("del");
var uglify = require('gulp-uglify');


gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer() // autoprefixer({browsers: ['last 2 version']}),
    ]))
    .pipe(gulp.dest("source/css"))
    .pipe(csso())
    // .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))

    .pipe(server.stream());
});

gulp.task("images", function () { // запускается один раз командой npx gulp images
  return gulp.src("source/img/**/*.{gif,png,jpg,jpeg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 7}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
  ]))
  .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () { // запускается один раз командой npx gulp webp
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/sprite-svg/*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin())
    //  .pipe(rename({
    //    suffix: ".min",
    //    })) // если бы понадобилось переименование
    .pipe(gulp.dest("build"));
});

gulp.task("js", function () {
  return gulp.src("source/js/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("build/js"));
});

gulp.task("clean", function () {
 return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/*.*", // маска *.* не позволяет копировать папки sprite-svg и pixel-glass
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "source/"
  });

  gulp.watch("source/sass/**/*.scss", gulp.series("css", "refresh"));
  gulp.watch("source/img/*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/js/*.js", gulp.series("js", "refresh")); //
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "sprite",
  "js",
  "html"
));

// gulp.task("start", gulp.series("build", "server"));
