var autoprefixer = require('autoprefixer'),
	config = require('./config.json'),
	cssnano = require('cssnano'),
	gulp = require('gulp'),
	ftp = require('vinyl-ftp'),
	less = require('gulp-less'),
	notify = require('gulp-notify'),
	path = require('path'),
	plumber = require('gulp-plumber'),
	postcss = require('gulp-postcss'),
	request = require('request'),
	sourcemaps = require('gulp-sourcemaps'),
	watch = require('gulp-watch'),

	

	ftpconf = config.ftpconf,
 
	baseFolder = config.baseFolder,
	testFolder = config.testFolder,
	devFolder = config.devFolder,
	
	processors = [
        autoprefixer,
        cssnano
    ],

	lessPaths = [
		// V3 AND V2
		//////////////////////

		// test
		baseFolder + testFolder + '*/includes/default/styles.less',
		baseFolder + testFolder + '*/includes/mobile/styles.less',

		// dev
		baseFolder + devFolder + '*/httpdocs/includes/default/styles.less',
		baseFolder + devFolder + '*/httpdocs/includes/mobile/styles.less',

		// fwm subdomains eg DSS Flex
		baseFolder + devFolder + 'fosterwebmarketing.com/subdomains/*/includes/default/styles.less',
		baseFolder + devFolder + 'fosterwebmarketing.com/subdomains/*/includes/moble/styles.less',
	],


	getFtpConnection = function(host) {  
		return ftp.create({
			host: host,
			port: ftpconf.port,
			user: ftpconf.username,
			password: ftpconf.password,
			parallel: 10,
		});
	};



console.log(baseFolder, testFolder, devFolder)
	console.log('ehyyyyy');

gulp.task('watch', function() {
	var env, conn, relPath;

	watch(lessPaths, function (event) {

	// Detect Environment (Test or Dev)
		if( event.path.indexOf(testFolder) >= 0 && event.path.indexOf(devFolder) < 0 ){
			conn = getFtpConnection(ftpconf.testHost);
			env = testFolder;
			console.log(env);
		} else{
			conn = getFtpConnection(ftpconf.devHost);
			env = devFolder;
			console.log(env);
		}

		relPath = event.dirname.split(env)[1];

		return gulp.src( (event.path) )
			//less
			.pipe( plumber({errorHandler: notify.onError({'message': 'Error: <%= error.message %>'})}) )
			
	        .pipe(less())
	        .pipe(postcss(processors))
	        .pipe( gulp.dest(event.dirname) )
			.pipe( notify({message: "<%= options.filePath %> - Less Compiled, Prefixed and Minified"}) )

			//up CSS
			.pipe( plumber({errorHandler: notify.onError({title: '', 'message': 'FTP Error: <%= error.message %>'})}) )
			.pipe( conn.dest( ftpconf.remoteFolder + relPath ) )
			.pipe( notify({title: '', message: "<%= options.filePath %> - Uploaded"}) )

	});
});
