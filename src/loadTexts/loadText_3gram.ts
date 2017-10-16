const reader = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});

const fs = require('fs');

var lines = "";

var nextWords = {};
//var prevWords = {};

lines = fs.readFileSync('../../wiki_sepAA.txt', 'utf-8');
var loadText = (lines) =>{
	var parseText = (inp) => {
		segs = inp.split(" ");
		return segs;
	};
	var segs = parseText("" + lines);

	var nextWordCount = (inp) => {
		for(var i=0; i<inp.length - 1; i++){
			if(!nextWords[inp[i]]) nextWords[inp[i]] = {};
			if(!nextWords[inp[i]][inp[i+1]]) nextWords[inp[i]][inp[i+1]] = [];
			var candidates = nextWords[inp[i]][inp[i+1]];
			if(candidates == undefined){
				candidates = [];
				candidates.push([inp[i+2], 1]);
			}else{
				var f = () => {
					for(var k=0; k<candidates.length; k++){
						if(candidates[k][0] == inp[i+2]){
							candidates[k][1]++;
							return candidates[k];
						}
					}
					return null;
				}
				var func = f();
				if(func == null){
					candidates.push([inp[i+2], 1]);
				}
			}
		}
		return nextWords;
	}

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

	/*
	var keys = Object.keys(nextWords);
	for(var i=0; i<keys.length; i++){
		var keys2 = Object.keys(nextWords[keys[i]]);
		for(var k=0; k<keys2.length; k++){
			nextWords[keys[i][keys2[k]]].sort(function(a, b){
				return (b[1] - a[1]);
			});
		}
	}
	*/
	/*
	keys = Object.keys(prevWords);
	for(var i=0; i<keys.length; i++){
		prevWords[keys[i]].sort(function(a, b){
			return (b[1] - a[1]);
		});
	}
	*/
	var Dic1 = "nextWordsDic_wiki_3gram.json";
	//var Dic2 = "prevWordsDic_wiki_3gram.json"
	fs.writeFileSync(Dic1, JSON.stringify(nextWords), null, " ");
	//fs.writeFileSync(Dic2, JSON.stringify(prevWords), null, " ");
	//console.log("Dictionary saved to: " + Dic1 + ", " + Dic2);
	console.log("Dictionary saved to: " + Dic1);
}
loadText(lines);
