var fs = require("fs");
var path = require("path");
var plist = require("plist");
var Jimp = require("jimp");

var srcFile = process.argv[2]
if (!srcFile) {
    console.error("Please input file")
}

var srcDir = path.dirname(srcFile)

var outputDir = process.argv[3] || srcDir + "/output"

var writeImage = function (p, k, v, cb) {

    console.log("writeImage p: " + p + " k: " + k + " v: " + JSON.stringify(v));
    var width = v.sourceSize[0];
    var height = v.sourceSize[1];
    var dstX = v.sourceColorRect[0][0];
    var dstY = v.sourceColorRect[0][1];
    var srcX = v.frame[0][0];
    var srcY = v.frame[0][1];
    var srcW = v.frame[1][0];
    var srcH = v.frame[1][1];

    if (v.rotated) {
        [width, height] = [height, width];
        [srcW, srcH] = [srcH, srcW];
    }

    var image = new Jimp(width, height);
    image.rgba(true);
    image.background(0);
    image.blit(p, dstX, dstY, srcX, srcY, srcW, srcH);
    if(v.rotated) {
        image.rotate(-90);
    }

    var fileName = k + ".png";
    image.write(outputDir + "/" + fileName)
    cb()
}

var runMapAsync = function (p, m, f) {
    var keys = Object.keys(m)
    var next = function (i) {
        k = keys[i]
        v = m[k]
        return function () {
            if (i >= keys.length) return
            f(p, k, v, next(i + 1))
        }
    }
    next(0)()
}

var parseFrame = function (str) {
    str = str.replace(/\{/g, "[").replace(/\}/g, "]");
    return JSON.parse(str);
}

fs.readFile(srcFile, "utf8", (err, data) => {
    // console.log(data);
    var result = plist.parse(data);
    // console.log(JSON.stringify(result.metadata.textureFileName));
    for (var k in result.frames) {
        let f = result.frames[k];
        f.frame = parseFrame(f.frame);
        f.offset = parseFrame(f.offset);
        f.sourceColorRect = parseFrame(f.sourceColorRect);
        f.sourceSize = parseFrame(f.sourceSize);
        // console.log(f.frame);
    }

    var filePath = srcDir + "/" + result.metadata.textureFileName;
    Jimp.read(filePath).then((p) => {
        runMapAsync(p, result.frames, writeImage);
    }).catch(function (err) {
        // handle an exception
        console.error(err)
    });
});
