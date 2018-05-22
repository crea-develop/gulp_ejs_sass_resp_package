// ====================
// to dist
// ====================

const gulp         = require('gulp');

const ejs          = require('gulp-ejs');
const beautify     = require('gulp-html-beautify');

const autoprefixer = require('gulp-autoprefixer');
const cssbeautify  = require('gulp-cssbeautify');
const sass         = require('gulp-sass');
const cssmin       = require('gulp-cssmin');

const uglify     = require('gulp-uglify-es').default;
const babel      = require('gulp-babel');

const imagemin     = require('gulp-imagemin');

const changed      = require('gulp-changed');
const concat       = require('gulp-concat');
const rename       = require('gulp-rename');
const plumber      = require('gulp-plumber');
const fs           = require('graceful-fs');
const del          = require('del');

const config = require('../config').default;
const paths = config.paths;

gulp.task('dist:default', [
    'dist:image',
    'dist:ejs',
    'dist:sass',
    'dist:js',
    'dist:others'
]);

gulp.task('dist:clean', function () {
    return del([paths.dist + '**/*']);
});

gulp.task('dist:image', function () {
    gulp
    .src(paths.image)
    .pipe(plumber())
    .pipe(changed(paths.dist))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist));
});


// [EJS]コンパイル
gulp.task('dist:ejs', function () {
    var json = {
        common : JSON.parse(fs.readFileSync('./json/common.json')),
        pages  : JSON.parse(fs.readFileSync('./json/pages.json'))
    };

    gulp
    .src(paths.ejs.src)
    .pipe(plumber())
    .pipe(changed(paths.dist))
    .pipe(ejs(json, '', { ext : ".html" }))
    .on('error', function (error) {
        console.log(error.message);
        this.emit('end');
    })
    .pipe(gulp.dest(paths.dist));
});

// [Sass]コンパイル、concat
gulp.task('dist:sass', ['dist:sass:default', 'dist:sass:concat']);
gulp.task('dist:sass:default', function () {
    // assets/css/ 以下 以外のscssファイルをconcatせずにdistに吐き出す
    gulp.src(paths.css.default)
    .pipe(plumber())
    .pipe(changed(paths.dist))
    .pipe(sass())
    .pipe(cssbeautify())
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(gulp.dest(paths.dist));
});
gulp.task('dist:sass:concat', function () {
    gulp.src(paths.css.concat)
    .pipe(plumber())
    .pipe(changed(paths.css.dist))
    .pipe(sass())
    .pipe(cssbeautify())
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(paths.css.dist));
});

gulp.task('dist:js', ['dist:js:default', 'dist:js:common']);
gulp.task('dist:js:default', function () {
    gulp.src(paths.js.default)
    .pipe(plumber())
    .pipe(changed(paths.dist))
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(uglify({output: {comments: "/^!/"}}))
    .pipe(gulp.dest(paths.dist));
});
gulp.task('dist:js:common', function () {
    gulp.src(paths.js.common)
    .pipe(plumber())
    .pipe(changed(paths.js.dist))
    .pipe(concat('common.js'))
    // .pipe(babel({
    //     presets: ['env']
    // }))
    .pipe(uglify({output: {comments: "/^!/"}}))
    .pipe(gulp.dest(paths.js.dist));
});

gulp.task('dist:others', function () {
    gulp
    .src(paths.others)
    .pipe(plumber())
    .pipe(changed(paths.dist))
    .pipe(gulp.dest(paths.dist));
});