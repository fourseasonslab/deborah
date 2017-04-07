class DeborahResponderCabocha extends DeborahResponder
{
	constructor(bot: Deborah){
		super(bot);
		this.name ="Cabocha";
	}
	generateResponse(req: DeborahMessage){
		var that = this;
		this.bot.cabochaf1.parse(req.text, function(result) {
			console.log(JSON.stringify(result, null, " "));
			var depres = result.depRels;
			var num;
			var importantWords = [];
			//for(var i = 0; i < depres.length; i++) console.log("resArray[" + i + "][1] = " + resArray[i][1]);
			for(var i = 0; i < depres.length; i++){
				if(depres[i][0] === -1){
					num = i;
					importantWords.push(result.depRels[num][2][0]);
					break;
				}
			}
			//console.log(JSON.stringify(result, null, " "));
			for(var i = 0; i < num; i++){
				if(depres[i][0] === num){
					// req.driver.reply(req, "Cabocha  " + "そうか、君は" + depres[i][1] + depres[num][1] + "フレンズなんだね！");
					importantWords.push(result.depRels[i][2][0]);
					//console.log(depres[num][2].length);
					for(var j = 0; j < depres[num][2].length; j++){
						var w = depres[num][2][j];
						//console.log(w);
						//console.log(result.words[w]);
						if(result.words[w][1] === "動詞"){
							//console.log(result.words[w][0] + "の終止形は" + result.words[w][7] + "だよ");
						}
					}
				}
			}

			var max = result.scores[0], min = result.scores[0];
			for(var i = 1; i < result.scores.length; i++){
				if(result.scores[i] > max){
					max = result.scores[i];
				}else if(result.scores[i] < min){
					min = result.scores[i];
				}
			}
			var normScores = [];
			for(var i = 0; i < result.scores.length; i++){
				normScores[i] = (result.scores[i] - min) / (max - min);
			}
			result.normScores = normScores;
			//console.log(JSON.stringify(result.normScores));
			//console.log("最大値: " + Math.max.apply(null, result.scores));
			if(result.scores.indexOf(Math.max.apply(null, result.scores)) !== -1){
				var maxScore = result.scores.indexOf(Math.max.apply(null, result.scores));
				console.log("へえ，" + result.words[maxScore][0] + "ね");
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
					// req.driver.reply(req, "type: " + result.words[i][0] + "美味しかったですか？");
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
			//console.log(JSON.stringify(result.counts));

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
			console.log(JSON.stringify(result.rankWords));
			for(var i = 0; i< 4; i++){
				if(i < result.rankWords.length){
					importantWords.push(result.rankWords[i][2]);
				}
			}

			result.importantWords = importantWords;
			var rnd = Math.floor(Math.random() * result.importantWords.length);
			console.log(result.importantWords);
			if(result.words[result.importantWords[rnd]][1] === "名詞"){
				that.reply(req, result.words[result.importantWords[rnd]][0] + "について聞かせてよ！");
			}else if(result.words[result.importantWords[rnd]][1] === "動詞"){
				that.reply(req, "どうして" + result.words[result.importantWords[rnd]][7] + "の？");
			}else if(result.words[result.importantWords[rnd]][1] === "形容詞" || result.words[result.importantWords[rnd]][1] === "形容動詞"){
				that.reply(req, result.words[result.importantWords[rnd]][7] + "よね〜");
			}else{
				that.reply(req, result.words[result.importantWords[rnd]][0] + "ってこと！？");
			}


			/*
			var w2v = require('word2vec');
			//w2v.loadModel('data/wakati_jawiki_20170215_all.txt.vectors.bin', function( err, model ){
			//大きすぎてMacbookが音を上げた
			w2v.loadModel('data/vectors.bin', function( err, model ){
				//console.log("がおがお" + model.analogy("ひまわり", ["犬", "動物"], 5));
				console.log("がおがお");
				//console.log(JSON.stringify(model.getVector("ひまわり")));
				//console.log("がおがお" + model.analogy("ひまわり", ["犬", "動物"], 5));
				console.log(model.getNearestWords( model.getVector( 'コンピュータ' ), 3 ));
			});
			*/

		});
	}
}
