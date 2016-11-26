var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');
var buffer      = require('vinyl-buffer');
var csso        = require('gulp-csso');
var imagemin    = require('gulp-imagemin');
var merge       = require('merge-stream');
var cleanCSS    = require('gulp-clean-css');

// Static Server + watching scss/html files
gulp.task('serve', ['sass-dev'], function() {
	browserSync.init({
		server: "./"
	});

	gulp.watch("scss/*.scss", ['sass-dev']);
	gulp.watch("img/icons/*").on('change', browserSync.reload);
	gulp.watch("*.html").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass-dev', function() {
	return gulp.src("scss/main.scss")
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest("css"))
		.pipe(browserSync.stream());
});
gulp.task('sass', function() {
	return gulp.src("scss/main.scss")
		.pipe(sass())
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest("css"));
});

// Generate spritesheet for icons
gulp.task('sprite', function () {
	// Generate our spritesheet 
	var spriteData = gulp.src('img/icons/*').pipe(spritesmith({
		imgName: 'img/sprite.png',
		cssName: 'sprite.css'
	}));

	// Pipe image stream through image optimizer and onto disk 
	var imgStream = spriteData.img
	// DEV: We must buffer our stream into a Buffer for `imagemin` 
		.pipe(buffer())
		.pipe(imagemin())
		.pipe(gulp.dest('img/'));

	// Pipe CSS stream through CSS optimizer and onto disk 
	var cssStream = spriteData.css
		.pipe(csso())
		.pipe(gulp.dest('css'));

	// Return a merged stream to handle both `end` events 
	return merge(imgStream, cssStream);
});

gulp.task('default', ['sprite', 'serve']);
gulp.task('pro', ['sprite', 'sass']);
