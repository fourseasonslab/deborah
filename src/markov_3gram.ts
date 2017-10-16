import {DeborahMarkovDictionary} from "./dictionary"

const fs = require('fs');

export class markov_3gram
{
	text;
	segs = [];
	endmark = /。$|．$|\n$/;
	nextWords = {};
	//prevWords = {};
	sentence = [];
	nextWord1;
	nextWord2;
	//prevWord;

	constructor(){
		//this.nextWords = DeborahMarkovDictionary.getNextWordsDic();
		this.nextWords = JSON.parse(fs.readFileSync('src/nextWordsDic_wiki_3gram.json'));
		//this.prevWords = DeborahMarkovDictionary.getPrevWordsDic();
		if(this.nextWords === undefined){
			console.log("nextWordsが空っぽでした．");
			this.nextWords = {};
		}
		/*
		 if(this.prevWords === undefined){
			 console.log("prevWordsが空っぽでした．");
			 this.prevWords = {};
		 }
		 */
	}

	// loadText()は少し変更してloadText.tsに移植済み

	makeSentence(str1: string, str2: string, f: Function){
		this.nextWord1 = str1;
		this.nextWord2 = str2;
		//this.prevWord = str;

		if(this.nextWords[this.nextWord1] == undefined){
			f(this.nextWord1 + "がわっかんないや...");
			return;
		}
		if(this.nextWord2 === "random word"){
			var key = Object.keys(this.nextWords[this.nextWord1]);
			this.nextWord2 = key[Math.floor(Math.random() * key.length)];
			f(this.nextWord2 + "で良いだろうか...");
		}
		if(this.nextWords[this.nextWord1][this.nextWord2] == undefined){
			f(this.nextWord2 + "がわっかんないや...");
			return;
		}

		this.sentence.push(this.nextWord1);
		while(this.nextWords[this.nextWord1][this.nextWord2] != undefined){
			this.sentence.push(this.nextWord2);
			var nextIndex = Math.floor(Math.random() *
				(this.nextWords[this.nextWord1][this.nextWord2].length < 10 ? this.nextWords[this.nextWord1][this.nextWord2].length : 10));

			if(this.endmark.test(this.nextWords[this.nextWord1][this.nextWord2][nextIndex][0])){
				this.sentence.push(this.nextWords[this.nextWord1][this.nextWord2][nextIndex][0]);
				break;
			}
			var tmp = this.nextWord1;
			this.nextWord1 = this.nextWord2;
			this.nextWord2 = this.nextWords[tmp][this.nextWord2][nextIndex][0];
		}

		/*
		 this.sentence.shift();
		 while(this.prevWords[this.prevWord] != undefined){
			 this.sentence.unshift(this.prevWord);
			 var prevIndex = Math.floor(Math.random() *
				 (this.prevWords[this.prevWord].length < 10 ? this.prevWords[this.prevWord].length : 10));

			 if(this.endmark.test(this.prevWords[this.prevWord][prevIndex][0])){
				 break;
			 }
			 this.prevWord = this.prevWords[this.prevWord][prevIndex][0];
		 }
		 */
		f(this.sentence.join(""));
		this.sentence = [];
		return;
	}
}
