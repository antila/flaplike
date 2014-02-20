var grunt = require('grunt');

grunt.initConfig({
  connect: {
    server: {
      options: {
        port: 9001,
        hostname: '192.168.1.50',
        base: 'src',
        keepalive: true
      }
    }
  }
});

grunt.loadNpmTasks('grunt-contrib-connect');

grunt.registerTask('default', 'connect');
