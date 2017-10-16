import {Deborah} from "../deborah";
import {DeborahDriver} from "../driver";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";

export class DeborahResponderWord2Vec extends DeborahResponder
{
	bot: Deborah;
	name: string;
	//
	w2v = null;
	constructor(bot: Deborah){
		super(bot);
		this.name ="Word2Vec";
		var Word2Vec = require("node-word2vec");
		this.w2v = new Word2Vec(this.bot.settings.lib.word2vec.vectorPath);
	};
	generateResponse(req: DeborahMessage){

		this.w2v.getVector("陽子",function(v1){
			console.log('陽子のべくとるは' + JSON.stringify(v1) + 'なんだって！');
			});

		
			var result = req.analytics;
		//	var that = this;

		//		var scores = [];
		//		var nClass = "";
		/*	var foodScore = 0;
		var drinkScore = 0;
		var timeScore = 0;
		var nameScore = 0;
		var placeScore = 0;
		//
		 */
		//
		//		console.log(JSON.stringify(req.analytics) + "!!!!!!!!!!!!!!");
			console.log(JSON.stringify(result.importantWords) + "!!!!");
		//for(var i=0; i < result.importantWords.length; i++){
			//	if(result.words[result.importantWords[i]][1] === "名詞"){
				//				this.w2v.getVector(result.words[result.importantWords[i]][7], function(v1){
					/*	for(var j=0; j < that.foodVector.length; j++){
						scores[0] += v1.cosineSimilarity(that.foodVector[j]);// /that.foodVector.lenght;
					}
					for(var j=0; j < that.drinkVector.length; j++){
						scores[1] += v1.cosineSimilarity(that.drinkVector[j]);// / that.drinkVector.length;
					}
					for(var j=0; j < that.timeVector.length; j++){
						scores[2] += v1.cosineSimilarity(that.timeVector[j]);// / that.timeVector.length;
					}
					for(var j=0; j < that.nameVector.length; j++){
						scores[3] += v1.cosineSimilarity(that.nameVector[j]);// / that.nameVector.length;
					}
					for(var j=0; j < that.placeVector.length; j++){
						scores[4] += v1.cosineSimilarity(that.placeVector[j]);// / that.placeVector.length;
					}

					var indexOfMaxScore = scores.indexOf(Math.max.apply(Math, scores));
					//iMax = 0;
					//var indexOfMaxValue = scores.reduce((iMax, x, i, scores) => x > scores[iMax] ? i : iMax, 0);
					//					nClass: String;
					switch(indexOfMaxScore){
						case 0:
							nClass = "食べ物"; break;
						case 1:
							nClass = "飲み物"; break;
						case 2:
							nClass = "時間"; break;
						case 3:
							nClass = "名前"; break;
						case 4:
							nClass = "場所"; break;
						default:
							nClass = "わたしが知らないもの"; break;
					 
					}*/
					console.log("わーい！！！");
				

					//			console.log(result.words[result.importantWords[i]][7] + "知ってるよ！" + nClass + "でしょ！");
				//	});
		//		}
	//		}

			
		/*this.bot.w2v.parse(req.text, function(err, result) {
			console.log(JSON.stringify(result, null, 2));
			var s = "";
			for(var i = 0; i < result.length - 1; i++){
				if(result[i][1] === "動詞"){
					s = result[i][0];
					if(result[i][6] !== "基本形"){
						for(i++; i < result.length - 1; i++){
							s += result[i][0];
							if(result[i][6] === "基本形") break;
						}
					}
					//console.log(s);
				}
			}
			if(s.length > 0){
				req.driver.reply(req, "そうか、君は" + s + "フレンズなんだね！");
			}
		});*/

		//		console.log("generateRspまできたよ！");
	}
}

