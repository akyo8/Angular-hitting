// SystemJS configuration file, see links for more information
// https://github.com/systemjs/systemjs
// https://github.com/systemjs/systemjs/blob/master/docs/config-api.md
(function (global) {

/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
var userMap = {
  'moment': 'node_modules/moment',
  'numeral': 'node_modules/numeral',
  'ngx-accordion': 'node_modules/ngx-accordion',
  'angular2-busy': 'node_modules/angular2-busy',
  'angular-2-local-storage': 'node_modules/angular-2-local-storage',
  'angular2-notifications': 'node_modules/angular2-notifications',
  'ng2-file-upload': 'node_modules/ng2-file-upload'
};


/** User packages configuration. */
var userPackages = {
  'moment':{
    defaultExtension: 'js'
  },
  'numeral':{
    defaultExtension: 'js',
    main: 'numeral.js'
  },
  'angular2-busy':{
    defaultExtension: 'js',
    main: 'index.js'
  },
  'angular-2-local-storage':{
    defaultExtension: 'js',
    main: 'dist/angular-2-local-storage.js'
  },
  'angular2-notifications': {
    defaultExtension: 'js',
    main: 'components.js'
  },
  'ng2-file-upload': {
    defaultExtension: 'js',
    main: 'index.js'
  },
  'ngx-accordion': {
    main: 'index.js',
    defaultExtension: 'js'
  }
};

var barrels = [
  '@angular/core',
  '@angular/common',
  '@angular/compiler',
  '@angular/http',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',
  '@angular/forms',
  '@angular/testing'
];

var systemConfigPackages = {
  'app': {main: 'main.js', defaultExtension: 'js'},
  'rxjs': {defaultExtension: 'js'}
};
barrels.forEach((barrelName) => {
  systemConfigPackages[barrelName] = { main: 'index.js', defaultExtension: 'js' };
});

// Apply the CLI SystemJS configuration.
System.config({
  typescriptOptions: {
    "module": "system",
    "sourceMap": true
  },
  map: {
    'app': '.tmp',
    'rxjs': 'node_modules/rxjs',
    '@angular': 'node_modules/@angular'
  },
  packages: systemConfigPackages
});

System.config({ map: userMap, packages: userPackages });

})(this);
