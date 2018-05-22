// ====================
// to dev
// ====================

const gulp         = require('gulp');

const ejs          = require('gulp-ejs');
const beautify     = require('gulp-html-beautify');

const autoprefixer = require('gulp-autoprefixer');
const cssbeautify  = require('gulp-cssbeautify');
const sass         = require('gulp-sass');

const babel      = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');

const changed      = require('gulp-changed');
const concat       = require('gulp-concat');
const rename       = require('gulp-rename');
const plumber      = require('gulp-plumber');
const fs           = require('graceful-fs');
const del          = require('del');

const config = require('../config').default;
const paths = config.paths;

gulp.task('watch', function () {
    gulp.watch(paths.ejs.watch, ['dev:ejs']);
    gulp.watch(paths.css.watch, ['dev:sass']);
    gulp.watch(paths.js.watch,  ['dev:js']);
    gulp.watch(paths.others,    ['dev:others']);
});

gulp.task('dev:default', [
    'dev:image',
    'dev:ejs',
    'dev:sass',
    'dev:js',
    'dev:others'
]);

gulp.task('dev:clean', function () {
    return del([paths.dev + '**/*']);
});

// [画像]コピー
gulp.task('dev:image', function () {
    gulp
    .src(paths.image)
    .pipe(plumber())
    .pipe(changed(paths.dev))
    .pipe(gulp.dest(paths.dev));
});

// [EJS]コンパイル
gulp.task('dev:ejs', function () {
    var json = {
        common : JSON.parse(fs.readFileSync('./json/common.json')),
        pages  : JSON.parse(fs.readFileSync('./json/pages.json'))
    };

    gulp
    .src(paths.ejs.src)
    .pipe(plumber())
    .pipe(changed(paths.dev))
    .pipe(ejs(json, '', { ext : ".html" }))
    .on('error', function (error) {
        console.log(error.message);
        this.emit('end');
    })
    .pipe(gulp.dest(paths.dev));
});

// [Sass]コンパイル、concat
gulp.task('dev:sass', ['dev:sass:default', 'dev:sass:concat']);
gulp.task('dev:sass:default', function () {
    // assets/css/ 以下 以外のscssファイルをconcatせずにdevに吐き出す
    gulp.src(paths.css.default)
    .pipe(plumber())
    .pipe(changed(paths.dev))
    .pipe(sass())
    .pipe(cssbeautify())
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dev));
});
gulp.task('dev:sass:concat', function () {
    gulp.src(paths.css.concat)
    .pipe(plumber())
    .pipe(changed(paths.css.dev))
    .pipe(sass())
    .pipe(cssbeautify())
    .pipe(autoprefixer())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(paths.css.dev));
});

gulp.task('dev:js', ['dev:js:default', 'dev:js:common']);
gulp.task('dev:js:default', function () {
    gulp.src(paths.js.default)
    .pipe(plumber())
    .pipe(changed(paths.dev))
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.dev));
});
gulp.task('dev:js:common', function () {
    gulp.src(paths.js.common)
    .pipe(plumber())
    .pipe(changed(paths.js.dev))
    .pipe(concat('common.js'))
    // .pipe(sourcemaps.init())
    // .pipe(babel({
    //     presets: ['env']
    // }))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.js.dev));
});

gulp.task('dev:others', function () {
    gulp
    .src(paths.others)
    .pipe(plumber())
    .pipe(changed(paths.dev))
    .pipe(gulp.dest(paths.dev));
});