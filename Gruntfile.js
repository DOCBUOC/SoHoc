module.exports = function (grunt) {
    // Load plugins
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    const releaseVersion = Date.now();
    const releases = ['release1', 'release2', 'release3'];
    // Configure tasks
    grunt.initConfig({
        copy: {
            dev: {
                expand: true,
                cwd: '',
                src: '**',
                dest: '../SoSoMienBac_Build/dev/releases/' + releaseVersion + '/',
            },
            staging: {
                expand: true,
                cwd: '',
                src: '**',
                dest: '../SoSoMienBac_Build/staging/',
            },
            production: {
                expand: true,
                cwd: '',
                src: '**',
                dest: '../SoSoMienBac_Build/production/',
            },
        },
        symlink: {
            dev: {
                src: '../SoSoMienBac_Build/dev/releases/' + releaseVersion + '/',
                dest: '../SoSoMienBac_Build/dev/current',
            },
            staging: {
                src: '../SoSoMienBac_Build/staging/releases/' + releaseVersion + '/',
                dest: '../SoSoMienBac_Build/staging/current',
            },
            production: {
                src: '../SoSoMienBac_Build/production/releases/' + releaseVersion + '/',
                dest: '../SoSoMienBac_Build/production/current',
            }
        },
        uglify: {
            production: {
                files: [{
                    expand: true,
                    cwd: 'src/js',
                    src: '**/*.js',
                    dest: '../SoSoMienBac_Build/production/js',
                }]
            }
        },
        cssmin: {
            production: {
                files: [{
                    expand: true,
                    cwd: 'src/css',
                    src: ['*.css'],
                    dest: '../SoSoMienBac_Build/production/css',
                }]
            }
        }
    });

    // Register tasks
    grunt.registerTask('build:dev', ['copy:dev']);
    grunt.registerTask('build:staging', ['copy:staging']);
    grunt.registerTask('build:production', ['copy:production', 'uglify:production', 'cssmin:production']);
};
