// ====================
// to release
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

const replace = require('gulp-replace');
const changed = require('gulp-changed');
const concat  = require('gulp-concat');
const rename  = require('gulp-rename');
const plumber = require('gulp-plumber');
const fs      = require('graceful-fs');
const del     = require('del');

const config = require('../config').default;
const paths = config.paths;

// リリースファイル生成時にリプレースするテキスト
const replace_text =  '<!-- === REPLACE TEXT === -->';
// リプレース内容の記述してあるファイルパス
const replace_file = './tags/_replace_text.html';

gulp.task('release', [
    'release:image',
    'release:ejs',
    'release:sass',
    'release:js',
    'release:others'
]);

gulp.task('release:image', function () {
    gulp
    .src(paths.image)
    .pipe(plumber())
    .pipe(changed(paths.release))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.release));
});

// [EJS]コンパイル
gulp.task('release:ejs', function () {
    var json = {
        common : JSON.parse(fs.readFileSync('./json/common.json')),
        pages  : JSON.parse(fs.readFileSync('./json/pages.json'))
    };

    var text = fs.readFileSync(replace_file);

    gulp
    .src(paths.ejs.src)
    .pipe(plumber())
    .pipe(changed(paths.release))
    .pipe(ejs(json, '', { ext : ".html" }))
    .on('error', function (error) {
        console.log(error.message);
        this.emit('end');
    })
    .pipe(replace(replace_text, text))
    .pipe(beautify())
    .pipe(gulp.dest(paths.release));
});

// [Sass]コンパイル、concat
gulp.task('release:sass', ['release:sass:default', 'release:sass:concat']);
gulp.task('release:sass:default', function () {
    // assets/css/ 以下 以外のscssファイルをconcatせずにdistに吐き出す
    gulp.src(paths.css.default)
    .pipe(plumber())
    .pipe(changed(paths.release))
    .pipe(sass())
    .pipe(cssbeautify())
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(gulp.dest(paths.release));
});
gulp.task('release:sass:concat', function () {
    gulp.src(paths.css.concat)
    .pipe(plumber())
    .pipe(changed(paths.css.release))
    .pipe(sass())
    .pipe(cssbeautify())
    .pipe(autoprefixer())
    .pipe(cssmin())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(paths.css.release));
});

gulp.task('release:js', ['release:js:default', 'release:js:common']);
gulp.task('release:js:default', function () {
    gulp.src(paths.js.default)
    .pipe(plumber())
    .pipe(changed(paths.release))
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(uglify({output: {comments: "/^!/"}}))
    .pipe(gulp.dest(paths.release));
});
gulp.task('release:js:common', function () {
    gulp.src(paths.js.common)
    .pipe(plumber())
    .pipe(changed(paths.js.release))
    .pipe(concat('common.js'))
    // .pipe(babel({
    //     presets: ['env']
    // }))
    .pipe(uglify({output: {comments: "/^!/"}}))
    .pipe(gulp.dest(paths.js.release));
});

gulp.task('release:others', function () {
    gulp
    .src(paths.others)
    .pipe(plumber())
    .pipe(changed(paths.release))
    .pipe(gulp.dest(paths.release));
});