import {DeborahDriver} from "./driver";

export class DeborahMessage
{
	text: string;
	senderName: string;
	context: string;	// group id etc. depends on driver.
	driver: DeborahDriver;
	rawData: any;
	analytics: any;
	date: Date;
	static cabocha;

	constructor(){
		var that = this;
		try{
			var Cabocha = require('node-cabocha');
			DeborahMessage.cabocha = new Cabocha();
		} catch(e){
			console.error(e);
		}
	}
	wordMatch(pattern: string[]): boolean | string[][]{
		var matcher = function(pattern, target){
			/*
			console.log("try match:");
			console.log(JSON.stringify(pattern, null, " "));
			console.log(JSON.stringify(target, null, " "));
			 */
			if(!pattern.length){
				if(pattern.length == 0 && target.length == 0) return [];
				return false;
			}
			if(pattern[0] === '*'){
				for(var i = 0; i <= target.length; i++){
					//console.log("i = " + i);
					var follow = matcher(pattern.slice(1), target.slice(i));
					if(follow) return [target.slice(0, i)].concat(follow);
				}
			} else if(target.length > 0){
				if(pattern[0] === '.' || pattern[0] === target[0][0]){
					var follow = matcher(pattern.slice(1), target.slice(1));
					if(follow) return [[target[0][0]]].concat(follow);
				}
			}
			return false;
		}
		var match: string[][] = [];
		return matcher(pattern, this.analytics.words);
	}
	analyze(f : Function){
		var that = this;
		console.log("Analyze requested.");
		DeborahMessage.cabocha.parse(this.text, function(result){
			var depres = result.depRels;
			var num;
			var importantWords = [];
			for(var i = 0; i < depres.length; i++){
				if(depres[i][0] === -1){
					num = i;
					importantWords.push(result.depRels[num][2][0]);
					break;
				}
			}
			for(var i = 0; i < result.words.length; i++){
				if(result.words[i][2] === "固有名詞"){
					importantWords.push(i);
					importantWords.push(i);
				}
			}
			for(var i = 0; i < num; i++){
				if(depres[i][0] === num){
					importantWords.push(result.depRels[i][2][0]);
				}
			}

			var max = Math.max.apply(null, result.scores);
			var min = Math.max.apply(null, result.scores);
			var normScores = [];
			for(var i = 0; i < result.scores.length; i++){
				normScores[i] = (result.scores[i] - min) / (max - min);
			}
			result.normScores = normScores;
			if(result.scores.indexOf(Math.max.apply(null, result.scores)) !== -1){
				var maxScore = result.scores.indexOf(Math.max.apply(null, result.scores));
			}

			var types = [];
			for(var i = 0; i < result.words.length; i++){
				if(result.words[i][0] === "昨日"){
					types.push("time");
				}else if(result.words[i][0] === "宇宙"){
					types.push("place");
				}else if(result.words[i][0] === "うどん"){
					types.push("food");
				}else if(result.words[i][0] === "佳乃"){
					types.push("person");
				}else{
					types.push(null);
				}
			}
			result.types = types;

			var count = [];
			for(var i = 0; i < result.depRels.length; i++){
				count[i] = 0;
			}
			for(var i = 0; i < result.depRels.length; i++){
				if(result.depRels[i][0] !== -1){
					count[result.depRels[i][0]]++;
				}
			}
			result.counts = count;

			var rankWords = [];
			for(var i = 0; i < result.counts.length; i++){
				rankWords.push([result.counts[i], result.depRels[i][1], result.depRels[i][2][0]]);
			}
			rankWords.sort(
				function(a, b){
					return b[0] - a[0];
				}
			);
			result.rankWords = rankWords;
			for(var i = 0; i< 4; i++){
				if(i < result.rankWords.length){
					importantWords.push(result.rankWords[i][2]);
				}
			}

			var kana = "";
			for(var i=0; i<result.words.length; i++){
				kana += result.words[i][8];
			}
			result.kana = kana.replace(/[^ァ-ヴー]/g,"");

			result.importantWords = importantWords;
			that.analytics = result;
			console.log("DONE analyse");
			f(that);
		});
	}
}
