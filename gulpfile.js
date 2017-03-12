var gulp        = require('gulp');
var ts          = require('gulp-typescript');
var $           = require('gulp-load-plugins')();
var source      = require('vinyl-source-stream');
var browserify  = require('browserify');
var tsify       = require('tsify');
var tscConfig   = require('./tsconfig.json');
var fs          = require('fs');
var sourcemaps  = require('gulp-sourcemaps');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var browserSync = require('browser-sync').create();
var path        = require('path')
var exorcist    = require('exorcist')
var mapfile     = path.join(__dirname, 'app/rpgcompiled.js.map')

function swallowError (error) {
  console.log(":: BREAKING ERROR :: "+error.toString())
  this.emit('end')
}

gulp.task('ts-compile', function () {
    return browserify({ debug: true })
    .add('app/ts/app.ts')
    .plugin(tsify, tscConfig)
    .bundle()
    .pipe(exorcist(mapfile))
    .on('error', swallowError)
    .on('TypeScript error', swallowError)
    .pipe(source('rpgcompiled.js'))
    .pipe(gulp.dest('app'));
});

gulp.task('js-compile', function () {
    return gulp
        .src(['app/src/*.js'])
        .pipe($.sourcemaps.init())
        .pipe($.concat('rpgcompiled.js'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('app'));
});

gulp.task('build', function(){
    return browserify()
    .add('app/src/app.js')
    //.plugin(tsify, { noImplicitAny: true })
    .bundle()
    .pipe(fs.createWriteStream('app/rpgcompiled.js'))
});


gulp.task('watch-all', function() {
    gulp.watch(['app/ts/**/*.ts'],      ['ts-compile']);
    //gulp.watch(['app/src/**/*.js'], ['build']);
    //gulp.watch(['app/js/*.js'], ['js-compile']);
});
