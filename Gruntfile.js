module.exports = function(grunt) {

  grunt.initConfig({
     env : {
      options : {
       //Shared Options Hash
      },
      dev: {
        REDISTOGO_URL: 'redis://redistogo:cdc1c4f5a4f9ea8429387f63eadbccdf@hoki.redistogo.com:10765/'
      },
      cibuild : {
        REDISTOGO_URL : 'redis://rediscloud:c5DS4STm0sBTQNZS@pub-redis-14750.us-east-1-4.2.ec2.garantiadata.com:14750'
      }
    },
    ts: {
      options: {
          compile: true,                 // perform compilation. [true (default) | false]
          comments: false,               // same as !removeComments. [true | false (default)]
          target: 'es5',                 // target javascript language. [es3 (default) | es5]
          module: 'commonjs',                 // target javascript module style. [amd (default) | commonjs]
          sourceMap: true,               // generate a source map for every output js file. [true (default) | false]
          sourceRoot: '',                // where to locate TypeScript files. [(default) '' == source ts location]
          mapRoot: '',                   // where to locate .map.js files. [(default) '' == generated js location.]
          declaration: false,            // generate a declaration .d.ts file for every output js file. [true | false (default)]
          htmlModuleTemplate: 'My.Module.<%= filename %>',    // Template for module name for generated ts from html files [(default) '<%= filename %>']
          htmlVarTemplate: '<%= ext %>',                      // Template for variable name used in generated ts from html files [(default) '<%= ext %>]
                                                              // Both html templates accept the ext and filename parameters.
          noImplicitAny: false,          // set to true to pass --noImplicitAny to the compiler. [true | false (default)]
          fast: "watch"                  // see https://github.com/TypeStrong/grunt-ts/blob/master/docs/fast.md ["watch" (default) | "always" | "never"]
          /* ,compiler: './node_modules/grunt-ts/customcompiler/tsc'  */ //will use the specified compiler.
      },      
      default : {
        src: ["**/*.ts", "!node_modules/**/*.ts"]
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'unit-test-results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
          //require: 'coverage/blanket'
        },
        src: ['lib/test/*.js', 'routes/test/*.js']
      },
      devbuild: {
        options: {
          reporter: 'spec',
          captureFile: 'devbuild-test-results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          timeout: 5200
          //require: 'coverage/blanket'
        },
        src: ['lib/test/*.js', 'routes/test/*.js', 'feature-test/steps/test*.js']
      },
      cibuild: {
        options: {
          reporter: 'spec',
          captureFile: 'cibuild-test-results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          timeout: 5200
          //require: 'coverage/blanket'
        },
        src: ['lib/test/*.js', 'routes/test/*.js', 'feature-test/steps/test*.js']
      },
      uitbuild: {
        options: {
          reporter: 'spec',
          captureFile: 'cibuild-test-results.txt', // Optionally capture the reporter output to a file
          quiet: false, // Optionally suppress output to standard out (defaults to false)
          clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
          timeout: 5200
          //require: 'coverage/blanket'
        },
        src: ['lib/test/*.js', 'routes/test/*.js', 'feature-test/steps/test*.js', 'ui-test/full/steps/test*.js']
      }
      
    },
    coverage: {
      options: {
        reporter: 'html-cov',
        // use the quiet flag to suppress the mocha console output
        quiet: true,
        // specify a destination file to capture the mocha
        // output (the quiet option does not suppress this)
        captureFile: 'coverage.html'
      },
      src: ['test/**/*.js']
    },
    jslint: { // configure the task
      // lint your project's server code
      server: {
        src: [ // some example files
          'lib/*.js',
          'routes/*.js',
          'lib/test/*.js',
          'routes/test/*.js',
          'feature-test/steps/*.js'
        ],
        directives: { // example directives
          node: true,
          todo: true
        },
        options: {
          edition: 'latest', // specify an edition of jslint or use 'dir/mycustom-jslint.js' for own path
          junit: 'out/server-junit.xml', // write the output to a JUnit XML
          log: 'out/server-lint.log',
          jslintXml: 'out/server-jslint.xml',
          errorsOnly: true, // only display errors
          failOnError: false, // defaults to true
          checkstyle: 'out/server-checkstyle.xml' // write a checkstyle-XML
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-jslint');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-mocha-test');
  
  // Default task(s).
  grunt.registerTask('default', ['env', 'ts', 'jslint', 'mochaTest:test']);
  grunt.registerTask('devbuild', ['env', 'ts', 'jslint', 'mochaTest:devbuild']);
  grunt.registerTask('cibuild', ['env:cibuild', 'ts', 'jslint', 'mochaTest:cibuild']);
  grunt.registerTask('uitbuild', ['env:cibuild', 'ts', 'jslint', 'mochaTest:uitbuild']);

};