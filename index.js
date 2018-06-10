var fs = require('fs')
var path = require('path')
var Jimp = require('jimp')

var srcFile = process.argv[2]
if(!srcFile) {
	console.error('Please input json file')
}
if(!srcFile.endsWith()) {
	srcFile += '.json'
}
var srcDir = path.dirname(srcFile)

var outputDir = process.argv[3] || srcDir + '/output'

console.log("run: " + srcFile + " " + outputDir)

var writeImage = function(p, k, v, cb) {
	var fileName = k.replace(/_([^_]*)$/, '.$1')
	Jimp.read(p).then(function (image) {
		image.crop(v.x, v.y, v.w, v.h).write(outputDir + '/'  + fileName)
		cb()
	}).catch(function (err) {
    	// handle an exception
		console.error(err)
	});
}

var runMapAsync = function(p, m, f) {
	var keys = Object.keys(m)
	var next = function(i) {
		k = keys[i]
		v = m[k]
		return function() {
			if(i >= keys.length)return
			f(p, k, v, next(i + 1))
		}
	}
	next(0)()
}

	
fs.readFile(srcFile, (err, data) => {
	if(err) {
		console.error(err)
		return
	}

	var sheet = JSON.parse(data)
	if(!sheet) {
		return
	}

	var filePath = srcDir + '/' + sheet.file
	runMapAsync(filePath, sheet.frames, writeImage)
})
