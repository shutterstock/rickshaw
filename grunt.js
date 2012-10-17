/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! PROJECT_NAME - v<%= meta.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '* http://PROJECT_WEBSITE/\n' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
        'YOUR_NAME; Licensed MIT */'
    },
    lint: {
      //files: ['grunt.js', 'src/js/*.js', 'tests/**/*.js']
	all: ['src/js/Technicals/*.js']
    },
    qunit: {
      files: ['tests/**/*.html']
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', 'src/js/Technicals/*.js'],
        dest: 'dist/rickshaw.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', 'src/js/Technicals/*.js'],
        dest: 'dist/rickshaw.technicals.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
    	options: {

        // Development.
        "debug"         : false,  // Allow debugger statements e.g. browser breakpoints.
        "devel"         : true,   // Allow developments statements e.g. `console.log();`.
        
        // Settings
        "passfail"      : false,  // Stop on first error.
        "maxerr"        : 100,    // Maximum error before stopping.
        
        // Predefined globals whom JSHint will ignore.
        "browser"       : true,   // Standard browser globals e.g. `window`, `document`.
        "node"          : true,
        "rhino"         : false,
        "couch"         : false,
        "wsh"           : false,   // Windows Scripting Host.
        "jquery"        : true,
        "prototypejs"   : false,
        "mootools"      : false,
        "dojo"          : false,
    
        // The Good Parts.
        "asi"           : false,  // Tolerate Automatic Semicolon Insertion (no semicolons).
        "laxbreak"      : true,   // Tolerate unsafe line breaks e.g. `return [\n] x` without semicolons.
        "bitwise"       : true,   // Prohibit bitwise operators (&, |, ^, etc.).
        "boss"          : false,  // Tolerate assignments inside if, for & while. Usually conditions & loops are for comparison, not assignments.
        "curly"         : false,   // Require {} for every new block or scope.
        "eqeqeq"        : true,   // Require triple equals i.e. `===`.
        "eqnull"        : false,  // Tolerate use of `== null`.
        "evil"          : false,  // Tolerate use of `eval`.
        "expr"          : false,  // Tolerate `ExpressionStatement` as Programs.
        "forin"         : false,  // Tolerate `for in` loops without `hasOwnPrototype`.
        "immed"         : true,   // Require immediate invocations to be wrapped in parens e.g. `( function(){}() );`
        "latedef"       : true,   // Prohibit variable use before definition.
        "loopfunc"      : false,  // Allow functions to be defined within loops.
        "noarg"         : true,   // Prohibit use of `arguments.caller` and `arguments.callee`.
        "regexp"        : true,   // Prohibit `.` and `[^...]` in regular expressions.
        "regexdash"     : false,  // Tolerate unescaped last dash i.e. `[-...]`.
        "scripturl"     : true,   // Tolerate script-targeted URLs.
        "shadow"        : false,  // Allows re-define variables later in code e.g. `var x=1; x=2;`.
        "supernew"      : false,  // Tolerate `new function () { ... };` and `new Object;`.
        "undef"         : true,   // Require all non-global variables be declared before they are used.
        "es5"           : true,   // If ES5 syntax should be allowed.
        "strict"        : false,  // Require the "use strict"; pragma.
        "onecase"       : true,
        
        // Personal styling preferences.
        "newcap"        : true,   // Require capitalization of all constructor functions e.g. `new F()`.
        "noempty"       : true,   // Prohibit use of empty blocks.
        "nonew"         : true,   // Prohibit use of constructors for side-effects.
        "nomen"         : true,   // Prohibit use of initial or trailing underbars in names.
        "onevar"        : false,  // Allow only one `var` statement per function.
        "plusplus"      : false,  // Prohibit use of `++` & `--`.
        "sub"           : true,  // Tolerate all forms of subscript notation besides dot notation e.g. `dict['key']` instead of `dict.key`.
        "trailing"      : false,   // Prohibit trailing whitespaces.
        "white"         : false,   // Check against strict whitespace and indentation rules.

        // globals
        "predef"     : [
          "Rickshaw"
        ]
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');

};
