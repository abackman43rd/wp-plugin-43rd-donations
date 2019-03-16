// Gulp.js configuration file
'use strict';

const dir = {
    src:   'src/',
    build: 'build/',
};

const
    browserify = require('browserify'),
    buffer     = require('vinyl-buffer'),
    del        = require('del'),
    concat     = require('gulp-concat'),
    deporder   = require('gulp-deporder'),
    gulp       = require('gulp'),
    gutil      = require('gulp-util'),
    imagemin   = require('gulp-imagemin'),
    log        = require('gulplog'),
    newer      = require('gulp-newer'),
    postcss    = require('gulp-postcss'),
    sass       = require('gulp-sass'),
    source     = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    stripdebug = require('gulp-strip-debug'),
    uglify     = require('gulp-uglify');

var browsersync = false;

/*
 * Clean
 */
function emptyFolder(path, cb) {
    console.log('Preparing to delete all files and folders from build directory:', dir.build);

    const exclude = '!' + (path.endsWith('/') ? path.substring(0, path.length - 1) : path);
    const promise = del([ path + '**', exclude ]);
    return promise.then((deleted) => {
        if (deleted.length) {
            console.log('Deleted the following files and folders:\n\t' + deleted.join('\n\t'));
        } else {
            console.log('No files or folders deleted.');
        }
    });
}

gulp.task('clean', (cb) => emptyFolder(dir.build, cb));

/*
 * PHP files
 */
const php = {
    src:   dir.src + '**/*.php',
    build: dir.build,
};

// Copy all plugin PHP files.
gulp.task('php', () => {
    return gulp.src(php.src)
        .pipe(newer(php.build))
        .pipe(gulp.dest(php.build));
});

/*
 * Asset files
 */
const assets = {
    src:   dir.src + 'assets/**/*',
    build: dir.build + 'assets/',
};

gulp.task('assets', () => {
    return gulp.src(assets.src)
        .pipe(newer(assets.build))
        .pipe(imagemin())
        .pipe(gulp.dest(assets.build));
});

/*
 * SCSS styles
 */
const css = {
    src:   dir.src + 'scss/**/*.scss',
    watch: dir.src + 'scss/**/*',
    build: dir.build,
    sassOpts: {
        outputStyle:     'nested',
        imagePath:       assets.build,
        precision:       3,
        errLogToConsole: true,
    },
    processors: [
        require('postcss-assets')({
            loadPaths: [ 'assets/' ],
            basePath:  dir.build,
            baseUrl:   '/wp-content/plugins/43rd-donations/',
        }),
        require('autoprefixer')({
            browsers: [ 'last 2 versions', '> 2%' ],
        }),
        require('css-mqpacker'),
        require('cssnano'),
    ],
};

gulp.task('css',
    gulp.series('assets', () => {
        return gulp.src(css.src)
            .pipe(sass(css.sassOpts))
            .pipe(postcss(css.processors))
            .pipe(gulp.dest(css.build))
            .pipe(browsersync ? browsersync.reload({ stream: true }) : gutil.noop());
    })
);

/**
 * JavaScript
 */
const js = {
    src:   dir.src + 'js/',
    build: dir.build,
};

gulp.task('pluginjs', () => {
    const b = browserify({
        entries: js.src + 'donation_form.js',
        debug:   true,
        transform: [ 'babelify' ],
    });

    return b.bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify())
        .on('error', log.error)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(js.build));
});

gulp.task('all', gulp.series('css', 'php', 'pluginjs'));
