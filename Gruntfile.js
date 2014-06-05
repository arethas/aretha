
module.exports = function (grunt) {
  "use strict";

  var _ = grunt.util._;

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  var configuration = {
    pkg : grunt.file.readJSON("package.json"),
    dir: {
      components: "bower_components",
      scripts: "scripts",
      styles: "styles",
      fonts: "<%= config.dir.styles %>/fonts"
    }
  };

  grunt.registerTask("bower", [
    "shell:bowerInstall",
    "parallel:bowerBuild",
    "clean:components"
  ]);

  grunt.registerTask("build", [
    "clean:dev",
    "parallel:bowerCopy",
    "less:dev"
  ]);

  grunt.registerTask("default", [
    "build",
    "connect:server",
    "watch"
  ]);

  grunt.registerTask("deploy", [
    "clean:dist",
    "build",
    "less:dist",
    "uglify:dist"
  ]);

  grunt.registerTask("test", [
    "jshint:stdout",
    "jshint:junit"
  ]);

  grunt.initConfig({
    config: configuration,

    clean: {
      dev: [
        "<%= config.dir.scripts %>/vendors/**/*",
        "<%= config.dir.styles %>/vendors/**/*",
        "<%= config.dir.fonts %>/vendors/**/*"
      ],
      components: [],
      dist: [
        "<%= config.dir.styles %>/app*.min.css",
        "<%= config.dir.scripts %>/app*.min.js"
      ]
    },

    concat: {

    },

    less: {
      options: {
        paths: ["<%= config.dir.components %>", "<%= config.dir.styles %>"]
      },
      dev: {
        files: {
          "<%= config.dir.styles %>/app.css": "<%= config.dir.styles %>/app.less"
        }
      },
      dist: {
        options: {
          compress: true
        },
        files: [{
          "<%= config.dir.styles %>/app.min.css": "<%= config.dir.styles %>/app.less"
        }]
      }
    },

    // jshint: {
    //   options: {
    //     globals: {
    //       jQuery: true,
    //       console: true,
    //       module: true,
    //       document: true
    //     }
    //   },
    //   stdout: {
    //     files: { src: [
    //       "Gruntfile.js",
    //       "public/javascripts/*.js",
    //       "public/javascripts/animations/*.js",
    //       "public/javascripts/authentification/*.js",
    //       "public/javascripts/contracts/*.js",
    //       "public/javascripts/directive/*.js",
    //       "public/javascripts/global/*.js",
    //       "public/javascripts/user/*.js",
    //       "public/javascripts/util/*.js",
    //       "test/**/*.js",
    //       "!<%= config.dir.scripts %>/<%= config.play.application.files.script %>.<%= config.play.application.version %>.min.js"]
    //     },
    //     options: {
    //       "force" : true
    //     }
    //   },
    //   junit: {
    //     files: { src: [
    //       "Gruntfile.js",
    //       "public/javascripts/*.js",
    //       "public/javascripts/animations/*.js",
    //       "public/javascripts/authentification/*.js",
    //       "public/javascripts/directive/*.js",
    //       "public/javascripts/user/*.js",
    //       "public/javascripts/util/*.js",
    //       "test/**/*.js",
    //       "!<%= config.dir.scripts %>/<%= config.play.application.files.script %>.<%= config.play.application.version %>.min.js"]
    //     },
    //     options: {
    //       reporter: require("jshint-junit-reporter"),
    //       reporterOutput: "test_out/jshint.xml",
    //       "force" : true
    //     }
    //   }
    // },

    uglify: {
      options: {
        banner: ""
      },
      dist: {
        options: {
          compress: true,
          report: "min"
        },
        files: [{
          dest: "<%= config.dir.scripts %>/<%= config.play.application.files.script %>.<%= config.play.application.version %>.min.js",
          src: [
            "<%= config.dir.scripts %>/vendors/lodash/lodash.js",
            "<%= config.dir.scripts %>/app.js",
            "<%= config.dir.scripts %>/*.js",
            "<%= config.dir.scripts %>/!(vendors)/**/*.js",
            "!<%= config.dir.scripts %>/app*.min.js"
          ]
        }]
      }
    },

    copy: {
      // Here start the Bower hell: manual copying of all required resources installed with Bower
      // Prefix them all with "bower"
      // Be sure to add them to the "bowerCopy" task near the top of the file
      bowerFontAwesome: {
        files: [{
          expand: true,
          cwd: "<%= config.dir.components %>/font-awesome/fonts/",
          src: ["*"],
          dest: "<%= config.dir.fonts %>/vendors/fontawesome/"
        }]
      },
      bowerQ: {
        files: [{
          expand: true,
          cwd: "<%= config.dir.components %>/q/",
          src: ["q.js", "q.min.js"],
          dest: "<%= config.dir.scripts %>/vendors/q/"
        }]
      },
      bowerLodash: {
        files: [{
          expand: true,
          cwd: "<%= config.dir.components %>/lodash/dist/",
          src: ["lodash.js", "lodash.min.js"],
          dest: "<%= config.dir.scripts %>/vendors/lodash/"
        }]
      },
      bowerMopidy: {
        files: [{
          expand: true,
          cwd: "<%= config.dir.components %>/mopidy/mopidy/frontends/http/data/",
          src: ["*.js"],
          dest: "<%= config.dir.scripts %>/vendors/mopidy/"
        }]
      },
      bowerZepto: {
        files: [{
          expand: true,
          cwd: "<%= config.dir.components %>/zepto/",
          src: ["*.js"],
          dest: "<%= config.dir.scripts %>/vendors/zepto/"
        }]
      }
    },

    shell: {
      bowerInstall: {
        command: "bower install",
        options: {
          stdout: true
        }
      }
    },

    parallel: {
      options: {
        grunt: true
      },
      bowerBuild: {
        tasks: []
      },
      bowerCopy: {
        tasks: [
          "copy:bowerFontAwesome",
          "copy:bowerQ",
          "copy:bowerLodash",
          "copy:bowerMopidy",
          "copy:bowerZepto"
        ]
      }
    },

    connect: {
      server: {
        options: {
          port: 8000
        }
      }
    },

    watch: {
      options: {
        livereload: false,
        forever: true
      },
      less: {
        files: ["<%= config.dir.styles %>/*.less", "<%= config.dir.styles %>/**/*.less"],
        tasks: ["less:dev"]
      },
      site: {
        options: {
          livereload: true
        },
        files: [
          "*.html",
          "**/*.html",
          "<%= config.dir.scripts %>/*.js",
          "<%= config.dir.scripts %>/**/*.js",
          "<%= config.dir.styles %>/*.css"
        ],
        tasks: []
      }
    }
  });

};
