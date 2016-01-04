/**
 * Created by kalle on 04.01.2016.
 */
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var rimraf = require('rimraf');
var path = require('path');

var paths = {
    lib: 'lib',
    src: 'src/**/*.jsx'
};

gulp.task('clean-lib', function(cb) {
    rimraf(paths.lib, cb);
});

gulp.task('build-lib', ['clean-lib'], function () { // (A)
    return gulp.src([paths.src])
        .pipe(sourcemaps.init()) // (B)
        .pipe(babel({
            presets: ['es2015', 'react']
        }))
        /*.pipe(sourcemaps.write('.', // (C)
         { sourceRoot: path.join(__dirname, 'src') }
         ))*/
        .pipe(gulp.dest(paths.lib));
});

gulp.task('watch', function() {
    gulp.watch([paths.src], ['build-lib'])
});

gulp.task('default', ['clean-lib', 'build-lib', 'watch']);