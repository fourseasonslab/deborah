var fs = require('fs');
var text;
var segs = [];

text = fs.readFileSync('segs_souseki.txt', 'utf-8');
var parseText = function (inp) {
	var segs = inp.split(" ");
	return segs;
};
segs = parseText("" + text);

var nextWordCount = {};
var wordCount = function(inp){
	for(var i=0; i<inp.length; i++){
		if(!nextWordCount[inp[i]]) nextWordCount[inp[i]] = [];
		var candidates = nextWordCount[inp[i]];
		if(candidates == undefined){
			candidates = [];
			candidates.push([inp[i+1], 1]);
		}else{
			var f = function(){
				for(var k=0; k<candidates.length; k++){
					if(candidates[k][0] == inp[i+1]){
						candidates[k][1]++;
						return candidates[k];
					}
				}
				return null;
			}
			var func = f();
			if(func == null){
				candidates.push([inp[i+1], 1]);
				}
		}
	}
	return nextWordCount;
}

var wordCounts = wordCount(segs);
console.log(wordCounts);
//console.log(segs);
