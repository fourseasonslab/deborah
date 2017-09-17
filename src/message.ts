class DeborahMessage
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
	analyze(f : Function){
		var that = this;
		DeborahMessage.cabocha.parse(this.text, function(result){
			//console.log(JSON.stringify(result, null, " "));
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
			//console.log(JSON.stringify(result, null, " "));
			for(var i = 0; i < num; i++){
				if(depres[i][0] === num){
					// req.driver.reply(req, "Cabocha  " + "そうか、君は" + depres[i][1] + depres[num][1] + "フレンズなんだね！");
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
				//console.log("へえ，" + result.words[maxScore][0] + "ね");
				}

			var types = [];
			for(var i = 0; i < result.words.length; i++){
				//this.w2v = new W2V();
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

			for(var i = 0; i< result.types.length; i++){
				if(result.types[i] === "food"){
					//req.driver.reply(req, "type: " + result.words[i][0] + "美味しかったですか？");
					}
			}

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
			//console.log(JSON.stringify(result.rankWords));
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
			console.log(result); // FOR DEBUG
			that.analytics = result;
			f(that);
		});
	}
}
