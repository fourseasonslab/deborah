import {Deborah} from "./deborah";
import {DeborahDriver} from "./driver";
import {DeborahMessage} from "./message";
import {DeborahResponder} from "./responder";

const fs = require('fs');
/*
const reader = require('readline').createInterface({   //#include 'readline'の中のcreateinterface関数的な
	input: process.stdin,   //名前:データ 2つでセット
	output: process.stdout
});
*/

export class markov
{
	text;
	segs = [];
	endmark = /。$|．$|\n$/;
	nextWords = {};
	prevWords = {};
	sentence = [];
	nextWord;
	prevWord;

	constructor(){
	}

	loadText(){
		this.text = fs.readFileSync('/Users/kano/Documents/TierIV/deborah/src/saishin.txt', 'utf-8');
		var parseText = (inp) => {
			this.segs = inp.split(" ");
			return this.segs;
		};
		this.segs = parseText("" + this.text);

		var nextWordCount = (inp) => {
			for(var i=0; i<inp.length; i++){
				if(!this.nextWords[inp[i]]) this.nextWords[inp[i]] = [];
				var candidates = this.nextWords[inp[i]];
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
			return this.nextWords;
		}

		var prevWordCount = (inp) => {
			for(var i=inp.length -1; i>0; i--){
				if(!this.prevWords[inp[i]]) this.prevWords[inp[i]] = [];
				var candidates = this.prevWords[inp[i]];
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
			return this.prevWords;
		}

		this.nextWords = nextWordCount(this.segs);
		this.prevWords = prevWordCount(this.segs);

		var keys = Object.keys(this.nextWords);
		for(var i=0; i<keys.length; i++){
			this.nextWords[keys[i]].sort(function(a, b){
				return (b[1] - a[1]);
			});
		}
		keys = Object.keys(this.prevWords);
		for(var i=0; i<keys.length; i++){
			this.prevWords[keys[i]].sort(function(a, b){
				return (b[1] - a[1]);
			});
		}
	}

	makeSentence(str: string, f: Function){
		//console.log("好きな単語を入れてね: ");

		//reader.on('line', function(line) {
		this.nextWord = str;
		this.prevWord = str;

		if(this.nextWords[this.nextWord] == undefined){
			//console.log("わっかんないや！もう一回！");
			//console.log("好きな単語を入れてね: ");
			f("わっかんないや...");
			return;
		}

		while(this.nextWords[this.nextWord] != undefined){
			this.sentence.push(this.nextWord);
			var nextIndex = Math.floor(Math.random() *
				(this.nextWords[this.nextWord].length < 3 ? this.nextWords[this.nextWord].length : 3));

			if(this.endmark.test(this.nextWords[this.nextWord][nextIndex][0])){
				this.sentence.push(this.nextWords[this.nextWord][nextIndex][0]);
				break;
			}
			this.nextWord = this.nextWords[this.nextWord][nextIndex][0];
		}

		this.sentence.shift();
		while(this.prevWords[this.prevWord] != undefined){
			this.sentence.unshift(this.prevWord);
			var prevIndex = Math.floor(Math.random() *
				(this.prevWords[this.prevWord].length < 4 ? this.prevWords[this.prevWord].length : 4));

			if(this.endmark.test(this.prevWords[this.prevWord][prevIndex][0])){
				break;
			}
			this.prevWord = this.prevWords[this.prevWord][prevIndex][0];
		}
		//console.log("生成した文章: " + this.sentence.join(""));
		f(this.sentence.join(""));
		this.sentence = [];
		return;
		//});
	}
}

/*
 var nyaan = new markov();
 nyaan.loadText();
 nyaan.makeSentence("俺");
 */
