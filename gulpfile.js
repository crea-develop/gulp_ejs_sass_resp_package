var gulp = require('gulp');

var ejs = require('gulp-ejs');
var prettify = require('gulp-prettify');

var imagemin = require('gulp-imagemin');

var uglify = require('gulp-uglify');

var autoprefixer    = require('gulp-autoprefixer');
var cssbeautify     = require('gulp-cssbeautify');
var cssmin          = require('gulp-cssmin');
var sass            = require('gulp-sass');

var changed     = require('gulp-changed');
var concat      = require('gulp-concat');
var rename      = require('gulp-rename');
var plumber     = require('gulp-plumber');
var fs          = require('graceful-fs');
var del         = require('del');


var paths = {
    dist        : 'dist/',
    ejs        : 'src/**/*.ejs',
    ejsnot        : '!src/**/_*.ejs',
    image       : 'src/**/*.+(jpg|gif|png)',
    sass         : {
        src     : 'src/**/*.scss',
        dist    : 'dist/assets/css/'
    },
    js          : {
        src     : 'src/**/*.js',
        srcnot  : '!src/**/common/*.js',
        dist    : 'dist/assets/js/'
    },
    other : 'src/**/*.!(jpg|gif|png|php|html|scss|css|js)'
};

var common_js_sort = [
    'src/assets/js/common/jquery-3.2.0.min.js',
    'src/assets/js/common/jquery.easing.js'
];


// =======================================================
//    Common tasks
// =======================================================

// 画像の圧縮タスク
// ====================
gulp.task('image', function() {
    gulp
    .src(paths.image)
    .pipe(plumber(paths.image))
    .pipe(changed(paths.dist))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist));
});

// EJSのコンパイル・整形タスク
// ====================
gulp.task('ejs', function () {
    var json = JSON.parse(fs.readFileSync('./ejs_setting.json'));
    gulp
    .src([paths.ejs, paths.ejsnot])
    .pipe(plumber(paths.ejs))
    .pipe(changed(paths.dist))
    .pipe(ejs(json, '', {
        ext   : ".html"
    }))
    .on('error', function (error) {
        // エラー時にdistにejsファイルを吐き出さないようにする
        console.log(error.message); this.emit('end');
    })
    .pipe(prettify())
    .pipe(gulp.dest(paths.dist));
});

// sassのコンパイル・minifyタスク
// ====================
gulp.task('sass', function () {
    gulp
    .src(paths.sass.src)
    .pipe(plumber(paths.sass.src))
    .pipe(changed(paths.sass.dist))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(cssmin())
    .pipe(concat('style.css'))
    .pipe(gulp.dest(paths.sass.dist));
});

// jsのminifyタスク
// ====================
gulp.task('js', ['main_js', 'common_js']);

// HTML, CSS, JS, 画像以外のファイルをdistにコピーする
gulp.task('copy', function () {
    gulp
    .src(paths.other)
    .pipe(gulp.dest(paths.dist));
});

// 監視タスク
// ====================
gulp.task('watch', function() {
    gulp.watch(paths.ejs, ['ejs']);
    gulp.watch(paths.sass.src, ['sass']);
    gulp.watch(paths.js.src,   ['js']);
    gulp.watch(paths.other, ['copy']);
});

// 一括処理タスク
// ====================
gulp.task('default', ['ejs', 'sass', 'js', 'image', 'copy']);

// distの中身を全削除
// ※※※　distの中だけに動画ファイルとかおいていると全部消えるのでお気をつけください　※※※
gulp.task('clean', function () {
    return del([paths.dist + '**/*']);
});


// =======================================================
//    JavaScript Tasks
// =======================================================

//  JavaScript minify task
gulp.task('main_js', function() {
    gulp
    .src([paths.js.src, paths.js.srcnot])
    .pipe(plumber())
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(changed(paths.dist))
    .pipe(gulp.dest(paths.dist));
});

//  JavaScript concat & minify task
gulp.task('common_js', function() {
    gulp
    .src(common_js_sort) // gulp/config.jsで設定
    .pipe(plumber())
    .pipe(uglify({preserveComments: 'some'})) // minify
    .pipe(changed(paths.js.dist))
    .pipe(concat('common.js'))                // 結合
    .pipe(gulp.dest(paths.js.dist));
});
