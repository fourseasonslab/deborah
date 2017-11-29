var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
var fs = require('fs');
var JSONStream = require('JSONStream');
var lines = "";
var nextWords = {};
//var prevWords = {};
lines = fs.readFileSync('../../../wiki_sepAA.txt', 'utf-8');
var loadText = function (lines) {
    var parseText = function (inp) {
        segs = inp.split(" ");
        return segs;
    };
    var segs = parseText("" + lines);
    var nextWordCount = function (inp) {
        for (var i = 0; i < inp.length - 1; i++) {
            if (!nextWords[inp[i]])
                nextWords[inp[i]] = {};
            if (!nextWords[inp[i]][inp[i + 1]])
                nextWords[inp[i]][inp[i + 1]] = [];
            var candidates = nextWords[inp[i]][inp[i + 1]];
            if (candidates == undefined) {
                candidates = [];
                candidates.push([inp[i + 2], 1]);
            }
            else {
                var f = function () {
                    for (var k = 0; k < candidates.length; k++) {
                        if (candidates[k][0] == inp[i + 2]) {
                            candidates[k][1]++;
                            return candidates[k];
                        }
                    }
                    return null;
                };
                var func = f();
                if (func == null) {
                    candidates.push([inp[i + 2], 1]);
                }
            }
        }
        return nextWords;
    };
    /*
    var prevWordCount = (inp) => {
        for(var i=inp.length -1; i>0; i--){
            if(!prevWords[inp[i]]) prevWords[inp[i]] = [];
            var candidates = prevWords[inp[i]];
            if(candidates == undefined){
                candidates = [];
                candidates.push([inp[i-1], 1]);
            }else{
                var f = () => {
                    for(var k=0; k<candidates.length; k++){
                        if(candidates[k][0] == inp[i-1]){
                            candidates[k][1]++;
                            return candidates[k];
                        }
                    }
                    return null;
                }
                var func = f();
                if(func == null){
                    candidates.push([inp[i-1], 1]);
                }
            }
        }
        return prevWords;
    }
    */
    nextWords = nextWordCount(segs);
    //prevWords = prevWordCount(segs);
    var keys = Object.keys(nextWords);
    for (var i = 0; i < keys.length; i++) {
        var keys2 = Object.keys(nextWords[keys[i]]);
        for (var k = 0; k < keys2.length; k++) {
            nextWords[keys[i]][keys2[k]].sort(function (a, b) {
                return (b[1] - a[1]);
            });
        }
        //nextWords[key[i]][keys[k]] = nextWords[key[i][keys[k]]].slice(0, 20);
    }
    /*
    keys = Object.keys(prevWords);
    for(var i=0; i<keys.length; i++){
        prevWords[keys[i]].sort(function(a, b){
            return (b[1] - a[1]);
        });
    }
     */
    var Dic1 = "../nextWordsDic_wiki_3gram1.json";
    //var Dic2 = "prevWordsDic_wiki_3gram.json"
    console.log("Dictionary saving started");
    //fs.writeFileSync(Dic1, JSON.stringify(nextWords, null, "\t"), null, " ");
    var outputStream = fs.createWriteStream(Dic1);
    var transformStream = JSONStream.stringifyObject();
    transformStream.pipe(outputStream);
    Object.keys(nextWords).forEach(function (key) {
        transformStream.write([key, nextWords[key]]);
    });
    transformStream.end();
    //fs.writeFileSync(Dic2, JSON.stringify(prevWords), null, " ");
    //console.log("Dictionary saved to: " + Dic1 + ", " + Dic2);
    outputStream.on("finish", function () {
        console.log("Dictionary saved to: " + Dic1);
    });
};
loadText(lines);
