/*jslint node: true*/
module.exports = function (grunt) {
    "use strict";

    var camCaptureFiles = [
        './src/camCaptureStartUp.js',
        './src/ICamCaptureSettings.js',
        './src/ICamCapture.js',
        './src/camCaptureRtc.js',
        './src/camCaptureFlash.js',
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
                    sourceMap: false,
                    drop_console: false,
                    preserveComments: 'some'
                },
                files: {
                    './build/camCapture.js': camCaptureFiles
                }
            },
            debugWithMap: {
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
            },
            release: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
//                    beautify: false,
//                    mangle: true,
//                    compress: true,
//                    sourceMap: false,
//                    drop_console: false
                },
                files: {
                    './build/camCapture.min.js': camCaptureFiles
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

    grunt.registerTask('debugWithMap', ['copy:js', 'uglify:debugWithMap']);
    grunt.registerTask('debug', ['copy:js', 'uglify:debug']);
    grunt.registerTask('release', ['uglify:release']);
};
