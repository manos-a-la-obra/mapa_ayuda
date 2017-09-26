module.exports = function(grunt) {

  grunt.initConfig({
    connect: {
      server: {
        options: {
          base: './',
          port: '3000',
          host: '*',
          livereload: true
        }
      }
    },

    watch: {
      styles: {
        files: 'assets/css/**/*.css',
        options: {
          spawn: false,
          livereload: true
        }
      },
      layout: {
        files: '*.html',
        options: {
          spawn: false,
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['connect', 'watch']);
}
