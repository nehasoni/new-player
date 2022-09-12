"use strict";

var gulp = require("gulp");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
const runSequence = require('gulp4-run-sequence')
var hash = require("gulp-hash");
var del = require("del");
var gzip = require("gulp-gzip");
var webpack = require('webpack-stream');
var dir = __dirname + "/npm_build";

gulp.task("clean", function(done) {
  del.sync([dir + "/dist"]);
  del.sync([dir + "/public"]);
  del.sync([dir + "/src"]);
  done()
});

var webpackConfig = require("./webpack.player");

gulp.task('webpack', function() {
  return gulp.src(['src/player/hls_player.js', 'src/player/fairplay_player.js'])
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(dir + '/dist/lib'));
});

gulp.task("copyVideoJs", function() {
  return gulp.src(__dirname + "/node_modules/video.js/dist/video.min.js").pipe(gulp.dest(dir + '/dist/lib'));
});


gulp.task("copyPlayerFiles", function() {
  return gulp.src(__dirname + "/src/player/**/*").pipe(gulp.dest(dir + "/dist")).pipe(gulp.dest(dir + "/src"));
});

gulp.task("concatPlayerFiles", function(done) {
  return gulp
    .src(dir + "/dist/lib/video.min.js")
    .pipe(concat("mxplayer.js", { newLine: ";" }))
    .pipe(gulp.dest(dir + "/public_temp"));
});

gulp.task("concatHLSPluginFiles", function() {
  return gulp
    .src(dir + "/dist/lib/hls.plugins.js")
    .pipe(concat("mxplayer.plugins.js", { newLine: ";" }))
    .pipe(gulp.dest(dir + "/public_temp"));
});

gulp.task("concatfairplayPluginFiles", function() {
  return gulp
    .src(dir + "/dist/lib/fairplay.js")
    .pipe(concat("fairplay.plugins.js", { newLine: ";" }))
    .pipe(gulp.dest(dir + "/public_temp"));
});

gulp.task("hashFiles", function() {
  return gulp
    .src(dir + "/public_temp/*.js")
    .pipe(
      hash({
        template: "<%= name %>.<%= hash %><%= ext %>"
      })
    ) // Add hashes to the files' names
    .pipe(gulp.dest(dir + "/public/")) // Write the renamed files
    .pipe(
      hash.manifest(dir + "/../../dist/resource.json", {
        append: false,
        sourceDir: dir + "/public"
      })
    )
    .pipe(gulp.dest(dir + "/public"));
});

gulp.task("cleanUpPlayer", function(done) {
  del.sync([dir + "/public_temp"]);
  done()
});

gulp.task("copyPublicFiles", function(done){
  gulp.src(dir + "/public/*.*").pipe(gulp.dest(dir + "/../public/js/"));
  done()
})

gulp.task("build", function(done) {
  runSequence(
    "clean",
    "webpack",
    "copyVideoJs",
    "copyPlayerFiles",
    "concatPlayerFiles",
    "concatHLSPluginFiles",
    "concatfairplayPluginFiles",
    "hashFiles",
    "cleanUpPlayer",
    "copyPublicFiles"
  );
  done()
});

gulp.task("buildDev", function() {
  runSequence("build")
  gulp.watch([dir + '/../src/player/**/*.js', dir + '/../hls/dist/*.js'], function () {
    runSequence("build")
  });
});

gulp.task("buildComponent", function(done) {
  var pwd = __dirname + "/";
  var componentPath = __dirname + "/src/component/player";
  // gulp
  //   .src(componentPath + "/src/images/**/*")
  //   .pipe(gulp.dest(componentPath + "/dist/images/"));
  // gulp
  //   .src(componentPath + "/src/video/**/*")
  //   .pipe(gulp.dest(componentPath + "/dist/video/"));
  // gulp
  //   .src(componentPath + "/src/style/**/*")
  //   .pipe(gulp.dest(componentPath + "/dist/style/"));
  gulp
    .src([componentPath + "/src/**/*.jsx", componentPath + "/src/**/*.js"])
    .pipe(
      babel({

        presets: ['@babel/env'],
      })
    )
    .pipe(gulp.dest(componentPath + "/dist/"));
    done()
});

gulp.task("buildComponentDev", function() {
  return gulp.watch([__dirname + '/src/component/player/src/**/*.js'], runSequence("buildComponent"))
});
