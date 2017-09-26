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
    sass: {
      dist: {
        options: {
          style: 'expanded',
          sourcemap: 'none',
          require: 'sass-globbing',
          noCache: true
        },
        files: {
          'assets/css/application.css':'assets/sass/application.scss'
        }
      }
    },
    watch: {
      styles: {
        files: 'assets/sass/**/*.scss',
        tasks: ['sass'],
        options: {
          spawn: false,
          livereload: true
        }
      }
    },
    combine_mq: {
      default_options: {
        expand: true,
        src: 'assets/css/application.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-combine-mq');

  grunt.registerTask('default', ['connect', 'watch']);
  grunt.registerTask('build', ['sass', 'combine_mq']);
}
