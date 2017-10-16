const reader = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

const fs = require('fs');

var lines = "";
//reader.on('line', function(line) {
	//lines += line;
//});

var nextWords = {};
var prevWords = {};

lines = fs.readFileSync('../../wiki_sepAA.txt', 'utf-8');
//reader.on('close', function() {
	var loadText = (lines) =>{
		//text = fs.readFileSync('/Users/kano/Documents/TierIV/deborah/src/saishin.txt', 'utf-8');
		var parseText = (inp) => {
			//inp = inp.replace("\n", "");
			segs = inp.split(" ");
			return segs;
		};
		//segs = parseText("" + text);
		var segs = parseText("" + lines);

		var nextWordCount = (inp) => {
			for(var i=0; i<inp.length; i++){
				if(!nextWords[inp[i]]) nextWords[inp[i]] = [];
				var candidates = nextWords[inp[i]];
				if(candidates == undefined){
					candidates = [];
					candidates.push([inp[i+1], 1]);
				}else{
					var f = () => {
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

		nextWords = nextWordCount(segs);
		prevWords = prevWordCount(segs);

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
		//console.log(nextWords);
		//console.log(prevWords);
		var Dic1 = "nextWordsDic_wiki.json";
		var Dic2 = "prevWordsDic_wiki.json"
		fs.writeFileSync(Dic1, JSON.stringify(nextWords), null, " ");
		fs.writeFileSync(Dic2, JSON.stringify(prevWords), null, " ");
		console.log("Dictionary saved to: " + Dic1 + ", " + Dic2);
	}
	//console.log(lines);
	loadText(lines);
//});
