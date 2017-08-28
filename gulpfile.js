var gulp = require('gulp'),
    $ = require('gulp-load-plugins')();
    var debug = require('gulp-debug');


gulp.task('sass', function () {
    gulp.src([
        './public/styles/style.scss'
    ])
        .pipe($.plumber({errorHandler: $.notify.onError()}))
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.concat('style.css'))
        .pipe($.csso())
        .pipe(gulp.dest('./public/css/'))

});

gulp.task('js', function() {
    gulp.src([
        './public/javascripts/**/*.js'
    ])
        .pipe(debug({title: 'unicorn:'}))
        .pipe($.plumber({errorHandler: $.notify.onError()}))
        .pipe($.concat('min.js'))
        .pipe($.uglify())
        .pipe(gulp.dest('./public/js/'))
});

gulp.task('watch', function () {
    gulp.watch(['/public/styles/**/*.scss'], ['sass']);
    gulp.watch(['/public/javascripts/**/*.js'], ['js']);
});

gulp.task('default', ['watch']);