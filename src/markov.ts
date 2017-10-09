import {DeborahMarkovDictionary} from "./dictionary"

const fs = require('fs');

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
		this.nextWords = DeborahMarkovDictionary.getNextWordsDic();
		this.prevWords = DeborahMarkovDictionary.getPrevWordsDic();
		if(this.nextWords === undefined){
			console.log("nextWordsが空っぽでした．");
			this.nextWords = {};
		}
		if(this.prevWords === undefined){
			console.log("prevWordsが空っぽでした．");
			this.prevWords = {};
		}
	}

	// loadText()は少し変更してloadText.tsに移植済み

	makeSentence(str: string, f: Function){
		this.nextWord = str;
		this.prevWord = str;

		if(this.nextWords[this.nextWord] == undefined){
			f("わっかんないや...");
			return;
		}

		while(this.nextWords[this.nextWord] != undefined){
			this.sentence.push(this.nextWord);
			var nextIndex = Math.floor(Math.random() *
				(this.nextWords[this.nextWord].length < 10 ? this.nextWords[this.nextWord].length : 10));

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
				(this.prevWords[this.prevWord].length < 10 ? this.prevWords[this.prevWord].length : 10));

			if(this.endmark.test(this.prevWords[this.prevWord][prevIndex][0])){
				break;
			}
			this.prevWord = this.prevWords[this.prevWord][prevIndex][0];
		}
		f(this.sentence.join(""));
		this.sentence = [];
		return;
	}
}
