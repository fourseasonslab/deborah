var fs = require('fs');
var text;
var segs = [];
var endmark = /。$|．$|\\n$/;

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
//console.log(wordCounts);
//console.log(segs);

var keys = Object.keys(nextWordCount);
for(var i=0; i<keys.length; i++){
	nextWordCount[keys[i]].sort(function(a, b){
		return (b[1] - a[1]);
	});
}
//console.log(nextWordCount);

var firstIndex;
var sentence = [];
do{
	firstIndex = Math.floor(Math.random() * (segs.length - 1));
}while(/、|が|を|に|の|と|は|も|て/.test(segs[firstIndex]));
sentence.push(segs[firstIndex]);

var nextWord = segs[firstIndex];
console.log(segs[firstIndex]);

/*
while(true){
	var nextIndex = Math.floor(Math.random() *
		(nextWordCount[nextWord].length < 3 ? nextWordCount[nextWord].length : 3));

	sentence.push(nextWordCount[nextWord][nextIndex][0]);
	//console.log('*');
	if(endmark.test(nextWordCount[nextWord][nextIndex][0])){
		console.log("おわり");
		console.log("生成した文章: " + sentence.join(""));
		break;
	}
}
*/

for(var i=0; i<10; i++){
	var nextIndex = Math.floor(Math.random() *
		(nextWordCount[nextWord].length < 3 ? nextWordCount[nextWord].length : 3));
	sentence.push(nextWordCount[nextWord][nextIndex][0]);
	console.log("生成中の文章: " + sentence.join(""));
	nextWord = nextWordCount[nextWord][nextIndex][0];
}
