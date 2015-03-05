var gulp = require('gulp');
var rename = require('gulp-rename');
var beep = require('beepbeep');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglifyjs');
var stylus = require('gulp-stylus');
var autoprefixer = require('autoprefixer-stylus');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var tap = require('gulp-tap');
var hjson = require('hjson');
var nib = require('nib');


var config;

gulp.task('stylus', stylusTask);
gulp.task('concat', concatTask);
gulp.task('uglify', uglifyTask);
gulp.task('watch', watchTask);

gulp.task('js', ['concat', 'uglify']);
gulp.task('build', ['stylus', 'js']);

gulp.task('default', ['build', 'watch']);

function stylusTask() {

    gulp.src('./src/nzGrid.styl')
        .pipe(stylus({
            use: [nib(), autoprefixer()],
        }))
        .pipe(rename("nzGrid.css"))
        .pipe(gulp.dest('./dist/'));

    return gulp.src('./src/nzGrid.styl')
        .pipe(stylus({
            use: [nib(), autoprefixer()],
            compress: true,
        }))
        .pipe(rename("nzGrid.min.css"))
        .pipe(gulp.dest('./dist/'));
}

function concatTask() {
    return gulp.src([
            './node_modules/javascript-detect-element-resize/detect-element-resize.js',
            './src/nzGrid.js',
        ])
        .pipe(concat('nzGrid.js'))
        .pipe(gulp.dest('./dist/'));
}

function uglifyTask() {

    return gulp.src('./dist/nzGrid.js')
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(rename("nzGrid.min.js"))
        .pipe(gulp.dest('./dist/'));
}

function watchTask() {
    gulp.watch(['./src/**'], ['build']);
}
