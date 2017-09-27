var fs = require('fs');
var text;
var segs = [];
var endmark = /。$|．$|\n$/;

text = fs.readFileSync('saishin.txt', 'utf-8');
var parseText = function (inp) {
	var segs = inp.split(" ");
	return segs;
};
segs = parseText("" + text);

var nextWords = {};
var nextWordCount = function(inp){
	for(var i=0; i<inp.length; i++){
		if(!nextWords[inp[i]]) nextWords[inp[i]] = [];
		var candidates = nextWords[inp[i]];
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
	return nextWords;
}

var prevWords = {};
var prevWordCount = function(inp){
	for(var i=inp.length -1; i>0; i--){
		if(!prevWords[inp[i]]) prevWords[inp[i]] = [];
		var candidates = prevWords[inp[i]];
		if(candidates == undefined){
			candidates = [];
			candidates.push([inp[i-1], 1]);
		}else{
			var f = function(){
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

var wordCounts = nextWordCount(segs);
wordCounts = prevWordCount(segs);
//console.log(wordCounts);
//console.log(segs);

var keys = Object.keys(nextWords);
for(var i=0; i<keys.length; i++){
	nextWords[keys[i]].sort(function(a, b){
		return (b[1] - a[1]);
	});
}
keys = Object.keys(prevWords);
for(var i=0; i<keys.length; i++){
	prevWords[keys[i]].sort(function(a, b){
		return (b[1] - a[1]);
	});
}
//console.log(prevWords);

var firstIndex;
var sentence = [];
/*
 do{
	 firstIndex = Math.floor(Math.random() * (segs.length - 1));
 }while(/、|が|を|に|の|と|は|も|て/.test(segs[firstIndex]));
 sentence.push(segs[firstIndex]);
 */
var nextWord = segs[firstIndex];
var prevWord;
//console.log(segs[firstIndex]);

var reader = require('readline').createInterface({   //#include 'readline'の中のcreateinterface関数的な
	input: process.stdin,   //名前:データ 2つでセット
	output: process.stdout
});

console.log("好きな単語を入れてね: ");

reader.on('line', function(line) {
	nextWord = line;
	prevWord = line;
	//console.log(line + "だね．");

	if(nextWords[nextWord] == undefined){
		console.log("夏目漱石はそんなこと言ってない，もう一回");
		console.log("好きな単語を入れてね: ");
	}


	while(nextWords[nextWord] != undefined){
		sentence.push(nextWord);
		var nextIndex = Math.floor(Math.random() *
			(nextWords[nextWord].length < 3 ? nextWords[nextWord].length : 3));

		//sentence.push(nextWords[nextWord][nextIndex][0]);
		//console.log('*');
		if(endmark.test(nextWords[nextWord][nextIndex][0])){
			//console.log("おわり");
			sentence.push(nextWords[nextWord][nextIndex][0]);
			//console.log("後に伸ばした文章: " + sentence.join(""));
			//sentence = [];
			break;
		}
		nextWord = nextWords[nextWord][nextIndex][0];
	}

	sentence.shift();
	while(prevWords[prevWord] != undefined){
		sentence.unshift(prevWord);
		var prevIndex = Math.floor(Math.random() *
			(prevWords[prevWord].length < 4 ? prevWords[prevWord].length : 4));

		//sentence.unshift(prevWords[prevWord][prevIndex][0]);
		//console.log('*');
		if(endmark.test(prevWords[prevWord][prevIndex][0])){
			//console.log("おわり");
			//console.log("前に伸ばした文章: " + sentence.join(""));
			//sentence = [];
			break;
		}
		prevWord = prevWords[prevWord][prevIndex][0];
	}
	console.log("生成した文章: " + sentence.join(""));
	sentence = [];
});


/*
 for(var i=0; i<10; i++){
	 var nextIndex = Math.floor(Math.random() *
		 (nextWords[nextWord].length < 3 ? nextWords[nextWord].length : 3));
	 sentence.push(nextWords[nextWord][nextIndex][0]);
	 console.log("生成中の文章: " + sentence.join(""));
	 nextWord = nextWords[nextWord][nextIndex][0];
 }
 */
