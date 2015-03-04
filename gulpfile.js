var gulp = require('gulp');
var rename = require('gulp-rename');
var beep = require('beepbeep');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var uglify = require('gulp-uglifyjs');
var stylus = require('gulp-stylus');
var stylus = require('gulp-concat');
var tap = require('gulp-tap');
var hjson = require('hjson');
var del = require('del');
var nib = require('nib');


var config;

gulp.task('stylus', stylusTask);
gulp.task('concat', jsTask);
gulp.task('uglify', jsTask);
gulp.task('js', ['concat', 'uglify']);
gulp.task('watch', watchTask);
gulp.task('build', ['stylus', 'js', 'clean']);
gulp.task('clean', cleanTask);
gulp.task('default', ['build', 'watch']);

function stylusTask() {

    gulp.src('./src/nzGrid.styl')
        .pipe(stylus({
            use: [nib()],
            compress: false,
            "include css": true
        }))
        .pipe(rename("nzGrid.css"))
        .pipe(gulp.dest('./dist/'));

    return gulp.src('./src/nzGrid.styl')
        .pipe(stylus({
            use: [nib()],
            compress: true,
            "include css": true
        }))
        .pipe(rename("nzGrid.min.css"))
        .pipe(gulp.dest('./dist/'));
}

function concat() {
    return gulp.src([
            './node_modules/javascript-detect-element-resize/detect-element-resize.js',
            './src/nzGrid.js',
        ])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./.temp/'));
}

function uglify() {
    return gulp.src('./.temp/all.js')
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(rename("nzGrid.min.js"))
        .pipe(gulp.dest('./dist/'));
}

function cleanTask() {
    return gulp.task('clean:mobile', function(cb) {
        del('./.temp/');
    });

}

function watchTask() {
    gulp.watch(['./**.styl', './**.js'], ['build']);
}
