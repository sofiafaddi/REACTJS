var webpackConfig = require("./webpack.config.js");
var webpack = require("webpack");
module.exports = function(grunt) {
    grunt.initConfig({

        express: {
            build: {        // Nom de la tache pour le sereveur
                options: {
                    server: ('server/server.js')
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'server/server.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },
        less: {
            development: {
                options: {
                    paths: ["less"],
                    yuicompress: true
                },
                files: {
                    "./style/style.css": "less/style.less"
                }
            }
        },
        watch: {
            files: "./less/*",
            tasks: ["less"]
        },
        webpack: {
            options: {
                stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
            },
            prod: webpackConfig,
            dev: Object.assign({ watch: true }, webpackConfig)
        }



    });

    grunt.registerTask('build', ['less', 'jshint','express', 'express-keepalive']);
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-webpack');

};