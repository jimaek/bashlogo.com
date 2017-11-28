let fs = require('fs');
let path = require('path');
let childProcess = require('child_process');

function isDir (dir) {
	try {
		return fs.lstatSync(dir).isDirectory();
	} catch (e) {
		return false;
	}
}

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('./package.json'),

		connect: {
			dev: {
				options: {
					port: 8000,
					keepalive: true,
					base: './dist/',
					middleware: (connect, options, middlewares) => {
						middlewares.unshift((req, res, next) => {
							if (req.url !== '/' && !path.extname(req.url) && !isDir(path.join(options.base[0], req.url))) {
								req.url += '.html';
							}

							next();
						});

						return middlewares;
					},
				}
			}
		},

		assemble: {
			options: {
				layout: 'page.hbs',
				layoutdir: './src/layouts/',
				partials: './src/partials/**/*.hbs',
				commit_hash: childProcess.execSync('git rev-parse HEAD').toString().trim()
			},
			posts: {
				files: [ {
					cwd: './src/content/',
					dest: './dist/',
					expand: true,
					src: [ '**/*.hbs' ]
				} ]
			}
		},

		copy: {
			main: {
				files: [
					{ expand: true, cwd: 'src/img/', src: [ '**/*' ], dest: 'dist/img/' },
					{ expand: true, cwd: 'src/fonts/', src: [ '**/*' ], dest: 'dist/fonts/' },
					{ expand: true, cwd: 'src/js/', src: [ '**/*' ], dest: 'dist/js/' },
					{ expand: true, cwd: 'src/icons/', src: [ '**/*' ], dest: 'dist/' },
					{ expand: true, cwd: 'dist/', src: [ '**/*.html' ], dest: 'dist/'},
				],
			},
		},

		less: {
			development: {
				options: {
					paths: [ './dist/css/' ],
					strictMath: true
				},
				files: {
					'./dist/css/style.css': './src/style/style.less'
				}
			},
			production: {
				options: {
					paths: [ './dist/' ],
					compress: true,
					strictMath: true
				},
				files: {
					'./dist/css/style.css': './src/style/style.less'
				}
			}
		},

		clean: [ 'dist/' ],
	});

	grunt.loadNpmTasks('grunt-assemble');
	grunt.loadNpmTasks('assemble-less');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-connect');

	grunt.registerTask('default', [ 'clean', 'assemble', 'less', 'copy', 'connect' ]);
	grunt.registerTask('build', [ 'clean', 'assemble', 'less', 'copy' ]);

};
