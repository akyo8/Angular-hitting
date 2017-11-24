const gulp = require('gulp');
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const path = require('path');
const cssConcat = require('gulp-concat-css');
const rename = require('gulp-rename');
const transform = require('gulp-transform');
const tsc = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const gulpTypings = require('gulp-typings');
const uglify = require('gulp-uglify');
const minifyCSS = require('gulp-cssnano');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const minifyHTML = require('gulp-htmlmin');
const htmlMinifier = require('html-minifier');
const htmlReplace = require('gulp-html-replace');
const parker = require('gulp-parker');
const useref = require('gulp-useref');
const sass = require('gulp-sass');
const scssLint = require('gulp-scss-lint');
const filePath = require('path');
const del = require('del');
const SystemBuilder = require('systemjs-builder');
const gulpTemplate = require('gulp-template');
const inlineNg2Template = require('gulp-inline-ng2-template');
const merge = require('merge-stream');
const watch = require('gulp-watch');

const print = require('gulp-print');

gulp.task('clean', function() {
  return del.sync(['dist/**', 'build/**', '.tmp/**', 'config/environment.ts']);
});

gulp.task('libs:dev', function() {
  return gulp.src([
      'node_modules/core-js/client/shim.min.js',
      'node_modules/reflect-metadata/Reflect.js',
      //'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/zone.js/dist/zone.js',
      'dist-systemjs-config.js'
    ])
    .pipe(concat('dependencies.js'))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('libs:prod', function() {
  return gulp.src([
      'node_modules/core-js/client/shim.min.js',
      'node_modules/reflect-metadata/Reflect.js',
      //'node_modules/systemjs/dist/system-polyfills.js',
      'node_modules/systemjs/dist/system.src.js',
      'node_modules/zone.js/dist/zone.js',
      'dist-systemjs-config.js'
    ])
    .pipe(concat('dependencies.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('.tmp'));
});

gulp.task('env:dev', function() {
  const envVars = require('./config/environment.dev');
  return gulp.src('config/environment.template.ts')
    .pipe(gulpTemplate({
      env: envVars || {}
    }))
    .pipe(rename('environment.ts'))
    .pipe(gulp.dest('config'))
    .on('finish', function() {
      console.log('enviroment.ts generated successfully for DEV');
    });
});

gulp.task('env:qa', function() {
  const envVars = require('./config/environment.qa');
  return gulp.src('config/environment.template.ts')
    .pipe(gulpTemplate({
      env: envVars || {}
    }))
    .pipe(rename('environment.ts'))
    .pipe(gulp.dest('config'))
    .on('finish', function() {
      console.log('enviroment.ts generated successfully for QA');
    });
});

gulp.task('env:prod', function() {
  const envVars = require('./config/environment.prod');
  return gulp.src('config/environment.template.ts')
    .pipe(gulpTemplate({
      env: envVars || {}
    }))
    .pipe(rename('environment.ts'))
    .pipe(gulp.dest('config'))
    .on('finish', function() {
      console.log('enviroment.ts generated successfully for PROD');
    });
});

gulp.task('vendors', function() {
  return merge([
    gulp.src(['node_modules/rxjs/**/*'])
    .pipe(gulp.dest('build/js/rxjs')),

    // copy source maps
    /*
            gulp.src([
              'node_modules/es6-shim/es6-shim.map',
              'node_modules/reflect-metadata/Reflect.js.map',
              'node_modules/systemjs/dist/system-polyfills.js.map'
            ]).pipe(gulp.dest('dist/js')),
    */

    gulp.src([
      '@angular/**/*',
      'moment/moment.js',
      'numeral/numeral.js',
      'quill/dist/quill.js',
      'lightgallery/dist/js/lightgallery.js',
      'lightgallery/lib/lightgallery-all.js',
      'angular2-busy/**/*.js',
      'angular-2-local-storage/**/*.js',
      'angular2-notifications/**/*.js',
      'ng2-page-scroll/bundles/ng2-page-scroll.umd.js'
    ], { cwd: 'node_modules/**' })
    .pipe(gulp.dest('build/vendor/'))
  ]);
});

var minifyTemplate = function(path, ext, file, cb) {
  try {
    var minifiedFile = htmlMinifier.minify(file, {
      collapseWhitespace: true,
      caseSensitive: true,
      removeComments: true,
      removeRedundantAttributes: true
    });
    cb(null, minifiedFile);
  } catch (err) {
    cb(err);
  }
};

const inlineNg2TemplateConfig = {
  base: 'src/app/',
  templateProcessor: minifyTemplate,
  useRelativePaths: false,
  indent: 0,
  removeLineBreaks: true
};

var tscBuild = function() {};
tscBuild.init = function() {
  tscBuild.pathRenameFn = function(path) {
    if ("src" === path.dirname) {
      path.dirname = "";
    } else {
      path.dirname = path.dirname.replace(/src(\\|\/)/, "");
    }
  };
  tscBuild.transformFn = function(contents) {
    return contents.replace(new RegExp('\.\.\/\.\.\/config', 'g'), "../config");
  };
  tscBuild.tsProject = tsc.createProject('tsconfig.json', {
    typescript: require('typescript')
  });
};
tscBuild.dev = function() {
  tscBuild.init();

  var tsResult = gulp.src(['src/**/*.ts', 'config/*.ts', '!config/environment.template.ts', '!src/**/*.spec.ts'], { cwd: './' })
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: function(err) {
        console.error('>>> [tsc] Typescript compilation failed'.bold.green);
        this.emit('end');
      }
    }))
    //.pipe(inlineNg2Template(inlineNg2TemplateConfig))
    //.pipe(tsc(tsProject, undefined, tsc.reporter.fullReporter()));
    .pipe(tsc(tscBuild.tsProject));

  return tsResult.js
    .pipe(sourcemaps.write({
      // Return relative source map root directories per file.
      sourceRoot: function(file) {
        //var sourceFile = path.join(file.cwd, file.sourceMap.file);
        //return path.relative(path.dirname(sourceFile), file.cwd);
        return path.relative(path.join(file.cwd, file.path), file.base);
      },
      includeContent: true
    }))
    .pipe(rename(tscBuild.pathRenameFn))
    .pipe(transform(tscBuild.transformFn, { encoding: 'ascii' }))
    .pipe(gulp.dest('./.tmp'));
};
tscBuild.prod = function() {
  tscBuild.init();

  var tsResult = gulp.src(['src/**/*.ts', 'config/*.ts', '!config/environment.template.ts', '!src/**/*.spec.ts'], { cwd: './' })
    .pipe(plumber({
      errorHandler: function(err) {
        console.error('>>> [tsc] Typescript compilation failed'.bold.green);
        this.emit('end');
      }
    }))
    //.pipe(inlineNg2Template(inlineNg2TemplateConfig))
    //.pipe(tsc(tsProject, undefined, tsc.reporter.fullReporter()));
    .pipe(tsc(tscBuild.tsProject));

  return tsResult.js
    .pipe(rename(tscBuild.pathRenameFn))
    .pipe(transform(tscBuild.transformFn, { encoding: 'ascii' }))
    .pipe(gulp.dest('./.tmp'));
};

gulp.task('tsc:dev', ['env:dev'], tscBuild.dev);
gulp.task('tsc:qa', ['env:qa'], tscBuild.prod);
gulp.task('tsc:prod', ['env:prod'], tscBuild.prod);

gulp.task('system-build:dev', ['tsc:dev', 'vendors'], function() {
  var builder = new SystemBuilder();

  return builder.loadConfig('systemjs-config.js')
    .then(function() {
      return builder.buildStatic('app', '.tmp/bundle.js', {
        minify: false,
        sourceMaps: true
      });
    })
    //.then(function() { return del('build'); })
    .catch(function(err) {
      console.error('>>> [systemjs-builder] Bundling failed'.bold.green, err);
    });
});
gulp.task('system-build:qa', ['tsc:qa', 'vendors'], function() {
  var builder = new SystemBuilder();

  return builder.loadConfig('systemjs-config.js')
    .then(function() {
      return builder.buildStatic('app', '.tmp/bundle.js', {
        //minify: true,
        minify: false,
        sourceMaps: false
      });
    })
    //.then(function() { return del('build'); })
    .catch(function(err) {
      console.error('>>> [systemjs-builder] Bundling failed'.bold.green, err);
    });
});
gulp.task('system-build:prod', ['tsc:prod', 'vendors'], function() {
  var builder = new SystemBuilder();

  return builder.loadConfig('systemjs-config.js')
    .then(function() {
      return builder.buildStatic('app', '.tmp/bundle.js', {
        //minify: true,
        minify: false,
        sourceMaps: false
      });
    })
    //.then(function() { return del('build'); })
    .catch(function(err) {
      console.error('>>> [systemjs-builder] Bundling failed'.bold.green, err);
    });
});

gulp.task("installTypings", function() {
  return stream = gulp.src("./typings.json")
    .pipe(gulpTypings());
});

gulp.task('vendorjs', function() {
  return gulp.src('js/**/*.js', { cwd: 'public/**' })
    .pipe(gulp.dest('.tmp'));
});

gulp.task('sass:dev', function() {
  return gulp.src('src/scss/*.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: []
    })
    .on('error', sass.logError))
    .pipe(autoprefixer({
            browsers: ['last 5 versions'],
            cascade: false
        }))
    // .pipe(rename('style.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/css'));
});

gulp.task('sass:prod', function() {
  return gulp.src('src/scss/style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(rename('style.css'))
    .pipe(gulp.dest('.tmp/css'));
});

gulp.task('cssassets', function() {
  return merge([
    gulp.src('node_modules/lightgallery/dist/fonts/**')
      .pipe(gulp.dest('.tmp/assets/fonts')),
    gulp.src('node_modules/lightgallery/dist/img/**')
      .pipe(gulp.dest('.tmp/assets/images'))
  ]);
});

gulp.task('css:dev', ['cssassets'], function() {
  var cssTransformFn = function(contents) {
    return contents
      .replace(new RegExp('\.\.\/fonts\/', 'g'), '../assets/fonts/')
      .replace(new RegExp ('\.\.\/img\/', 'g'), '../assets/images/')
      ;
  };

  return gulp.src([
    'src/scss/**/*.css',
    'src/app/primeng/resources/primeng.css',
    'node_modules/angular2-busy/build/style/busy.css',
    'node_modules/lightgallery/dist/css/lightgallery.css',
    'node_modules/quill/dist/*.css',
    'public/css/*.css'
  ])
    .pipe(transform(cssTransformFn, {encoding: 'ascii'}))
    .pipe(autoprefixer())
    .pipe(gulp.dest('.tmp/css'));
});

gulp.task('css:prod', ['cssassets'], function() {
  var cssTransformFn = function(contents) {
    return contents
      .replace(new RegExp('\.\.\/fonts\/', 'g'), '../assets/fonts/')
      .replace(new RegExp ('\.\.\/img\/', 'g'), '../assets/images/')
      ;
  };

  return gulp.src([
    'src/scss/**/*.css',
    'src/app/primeng/resources/primeng.css',
    'node_modules/angular2-busy/build/style/busy.css',
    'node_modules/lightgallery/dist/css/lightgallery.css',
    'node_modules/quill/dist/*.css',
    'public/css/*.css'
  ])
    .pipe(transform(cssTransformFn, {encoding: 'ascii'}))
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(gulp.dest('.tmp/css'));
});

gulp.task('cssconcat:dev', ['sass:dev', 'css:dev'], function() {
  return gulp.src('.tmp/css/**/*.css')
    // .pipe(cssConcat('style.css'))
    .pipe(gulp.dest('.tmp/css'));
});

gulp.task('cssconcat:prod', ['sass:prod', 'css:prod'], function() {
  return gulp.src('.tmp/css/*.css')
    .pipe(cssConcat('style.css'))
    .pipe(gulp.dest('.tmp/css'));
});


gulp.task('parker', function() {
    return gulp.src('build/css/style.css')
        .pipe(parker({
            file: 'css-report.md',
            title: 'Parker -- CSS Report',
            // metrics: [
            //     "TotalRules",
            //     "TotalStylesheets"
            // ]
            }));
});

gulp.task('htmlfiles', function() {
  return gulp.src('src/index.html')
    .pipe(gulp.dest('.tmp'));
});

gulp.task('html:dev', ['htmlfiles', 'libs:dev', 'system-build:dev', 'vendorjs', 'cssconcat:dev'], function() {
  return gulp.src('.tmp/index.html')
    .pipe(useref({ searchPath: '.tmp' }))
    .pipe(htmlReplace({
      'css': {
        src: 'style.css',
        tpl: '<link rel="stylesheet" type="text/css" href="%s">'
      },
      'js': {
        src: 'vendor2.js',
        tpl: '<script src="%s"></script>'
      }
    }))
    .pipe(gulp.dest('.tmp'));
});

/* Some build paths are shared with :prod builds, only the environment configuration is isolated. */
gulp.task('html:qa', ['htmlfiles', 'libs:prod', 'system-build:qa', 'vendorjs', 'cssconcat:prod'], function() {
  return gulp.src('.tmp/index.html')
    .pipe(useref({ searchPath: '.tmp' }))
    .pipe(htmlReplace({
      'css': {
        src: 'style.css',
        tpl: '<link rel="stylesheet" type="text/css" href="%s">'
      },
      'js': {
        src: 'vendor2.js',
        tpl: '<script src="%s"></script>'
      }
    }))
    //.pipe(minifyHTML({}))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('html:prod', ['htmlfiles', 'libs:prod', 'system-build:prod', 'vendorjs', 'cssconcat:prod'], function() {
  return gulp.src('.tmp/index.html')
    .pipe(useref({ searchPath: '.tmp' }))
    .pipe(htmlReplace({
      'css': {
        src: 'style.css',
        tpl: '<link rel="stylesheet" type="text/css" href="%s">'
      },
      'js': {
        src: 'vendor2.js',
        tpl: '<script src="%s"></script>'
      }
    }))
    //.pipe(minifyHTML({}))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('assets', function() {
  return gulp.src('public/assets/**/*.*')
    .pipe(gulp.dest('.tmp/assets/'));
});

gulp.task('htmltemplates', function() {
  return gulp.src(['src/app/**/*.html', 'src/app/**/*.css'])
    .pipe(rename({ dirname: '' }))
    .pipe(gulp.dest('build'));
});

gulp.task('sourcefiles', function() {
  return gulp.src(['src/main.ts', 'src/app/**/*.ts', 'config/environment.ts', '!src/app/**/*.spec.ts'], { cwd: '**' })
    .pipe(gulp.dest('build'));
});

// gulp.task('watch', function() {
//   var watchTs = gulp.watch('src/**/**.ts', ['system-build']),
//     watchScss = gulp.watch('src/css/**/*.scss', ['lintScss', 'scss']),
//     //watchCss = gulp.watch('public/css/*.css', [ 'css:dev' ]),
//     watchHtml = gulp.watch('src/**/*.html', ['html:dev']),
//     watchAssets = gulp.watch('public/assets/**/*.*', ['assets']),

//     onChanged = function(event) {
//       console.log('File ' + event.path + ' was ' + event.type + '. Running tasks...');
//     };

//   watchTs.on('change', onChanged);
//   watchScss.on('change', onChanged);
//   //watchCss.on('change', onChanged);
//   watchHtml.on('change', onChanged);
//   watchAssets.on('change', onChanged);
// });

gulp.task('watch', function() {
  var
    watchScss = gulp.watch('src/scss/**/*.scss', ['sass:push']),

    onChanged = function(event) {
      console.log('File ' + event.path + ' was ' + event.type + '. Running tasks...');
    };

    watchScss.on('change', onChanged);
});

gulp.task('sass:push', ['sass:dev'], function() {
    return gulp.src(['.tmp/**', '!.tmp/app/**', '!.tmp/js/**', '!.tmp/main.js', '!.tmp/polyfills.js', '!.tmp/vendor.js'])
    // .pipe(revAll.revision())
    .pipe(gulp.dest('build'));
});


gulp.task('revall:dev', ['html:dev', 'assets'], function() {
  var revAll = require('gulp-rev-all')({
    dontRenameFile: [/^\/favicon.ico$/g, /^\/index.html/g],
    dontUpdateReference: [/index.html/g],
    prefix: 'http://localhost:8000/'
  });

  return gulp.src(['.tmp/**', '!.tmp/app/**', '!.tmp/js/**', '!.tmp/main.js', '!.tmp/polyfills.js', '!.tmp/vendor.js'])
    // .pipe(revAll.revision())
    .pipe(gulp.dest('build'));
});

gulp.task('revall:qa', ['html:qa', 'assets'], function() {
  var revAll = require('gulp-rev-all')({
    dontRenameFile: [/^\/favicon.ico$/g, /^\/index.html/g],
    dontUpdateReference: [/index.html/g]
  });

  return gulp.src(['.tmp/**', '!.tmp/app/**', '!.tmp/js/**', '!.tmp/main.js', '!.tmp/polyfills.js', '!.tmp/vendor.js'])
    .pipe(revAll.revision())
    .pipe(gulp.dest('build'));
});

gulp.task('revall:prod', ['html:prod', 'assets'], function() {
  var revAll = require('gulp-rev-all')({
    dontRenameFile: [/^\/favicon.ico$/g, /^\/index.html/g],
    dontUpdateReference: [/index.html/g]
  });

  return gulp.src(['.tmp/**', '!.tmp/app/**', '!.tmp/js/**', '!.tmp/main.js', '!.tmp/polyfills.js', '!.tmp/vendor.js'])
    .pipe(revAll.revision())
    .pipe(gulp.dest('build'));
});

gulp.task('build:dev', ['clean', 'revall:dev', 'htmltemplates', 'sourcefiles'], function() {
  console.log("Building for dev");
});

gulp.task('build:qa', ['clean', 'revall:qa', 'htmltemplates'], function() {
  console.log("Building for qa");
});

gulp.task('build:prod', ['clean', 'revall:prod', 'htmltemplates'], function() {
  console.log("Building for production");
});

