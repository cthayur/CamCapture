/*jslint node: true*/
module.exports = function (grunt) {
    "use strict";

    var camCaptureFiles = [
        './src/startUp.js',
        './src/camCaptureSettings.js',
        './src/camCaptureRtc.js',
        './src/camCapture.js',
        './src/camCaptureBootstrapper.js'
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            js: {
                files: './src/*.js',
                tasks: ['uglify:debug']
            }
        },
        uglify: {
            debug: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    beautify: true,
                    mangle: false,
                    compress: false,
                    sourceMap: true,
                    drop_console: false,
                    preserveComments: 'some'
                },
                files: {
                    './build/camCapture.js': camCaptureFiles
                }
            }
        },
        copy: {
            js: {
                files: [
                    {
                        src: ['./node_modules/hilary/src/hilary.js'],
                        dest: './src/external/hilary.js',
                        filter: 'isFile'
                    },
                    {
                        src: ['./node_modules/hilary/release/hilary.min.js'],
                        dest: './src/external/hilary.min.js',
                        filter: 'isFile'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('debug', ['copy:js', 'uglify:debug']);
};
