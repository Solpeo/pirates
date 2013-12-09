module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
		build: {
			template: 'template/index.html',
			name: pkg.name.toLowerCase().replace(/\s/g, '-'),
			version: pkg.version,
			engine: 'http://cdn.solpeo.com/engine/solpeo_engine-latest.min.js',
			dir: 'dist/'
		},
		uglify: {
			options: {
				banner: '/***********************************************************************\n'+
					'* <%= pkg.name %>\n'+
					'* v1.0\n'+
					'* Copyright (c) 2009-2014 Solpeo Global sp. z o.o.\n'+
					'* http://www.solpeo.com\n'+
					'*\n'+
					'***********************************************************************/\n'+
					'Engine.ready(function(){',
				footer: '});'
			},
			files: {
				src: [
					"src/config.js",
					"src/Sound.js",
					"src/Levels.js",
					"src/Element.js",
					"src/Timer.js",
					"src/Score.js",
					"src/Grid.js",
					"src/Intro.js",
					"src/main.js"
				],
				dest: '<%= build.dir %><%= build.name %>.<%= build.version %>.js'
			}
		},
		copy: {
			files: {
				src: ['sounds/**', 'images/**', 'fonts/**', 'css/**'],
				dest: '<%= build.dir %>'
			}
		},
		clean: {
			files: {
				src: ['dist/**']
			}
		}
	})

	grunt.registerTask('template', function() {

		var tmp = grunt.file.read(grunt.template.process('<%= build.template %>'));
		var content = grunt.template.process(tmp);
		var file = grunt.template.process('<%= build.dir %>index.html');

		grunt.file.write(file, content);

	})

	grunt.registerTask('default', ['clean', 'uglify', 'copy', 'template']);

}
