module.exports = function(grunt) {

  require('jit-grunt')(grunt);

  grunt.initConfig({
    clean: {
      dist: {
        src: ['dist']
      }
    },
    copy: {
      dist: {
        files: [
          {expand: true, cwd: 'src/', dest: 'dist/', src: '**'}
        ]
      }
    }
  });

  grunt.registerTask('build', [
    'clean:dist',
    'copy:dist'
  ]);

  grunt.registerTask('default', [
    'build'
  ]);

};
