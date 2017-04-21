class DeborahResponderKano extends DeborahResponder
{
	constructor(bot: Deborah){
		super(bot);
		this.name ="Kano";
	}
	generateResponse(req: DeborahMessage){
		var Word2Vec = require("node-word2vec");
		var w2v = new Word2Vec("/Users/kano/Documents/TierIV/word2vec/jawiki-sep-1-vectors-bin1.bin");
		/*w2v.getVector("陽子", function(v1){
			w2v.getVector("明子", function(v2){
				console.log(v1.cosineSimilarity(v2));
			});
		});*/
		var result = req.analytics;
		var not: boolean;
		/*for(var i = 0; i< result.importantWords.length; i++){
			console.log(result.words[result.importantWords[i]][0]);
		}*/
		for(var i = 0; i < result.words.length; i++){
			if(result.words[i][7] === "ない"){
				not = true;
				break;
			}
		}
		if(not){
			req.driver.reply(req, "否定的かも？");
		}
		var good = ["良い", "好き", "快い", "肯定", "楽しい", "美しい", "嬉しい"];
		var bad = ["悪い", "嫌い", "不快", "否定", "つまらない", "醜い", "嫌"];
		var rnd = Math.floor(Math.random() * result.importantWords.length);
		w2v.getVector(result.words[result.importantWords[rnd]][7], function(v1){
			var goodScore: number = 0;
			var that = this;
			w2v.getVector(good[1], function(v2){
				that.goodScore = v1.cosineSimilarity(v2);
				//console.log("GoodWordsとの関連度"+ i + ": " + goodScore);
				console.log("GoodWordsとの関連度1: " + v1.cosineSimilarity(v2));
			});
			//console.log("GoodWordsとの関連度1: " + goodScore);
		});
		w2v.getVector(result.words[result.importantWords[rnd]][7], function(v1, badScore: number){
			//var badScore: number;
			var that = this;
			//for(var i=0; i< bad.length; i++){
				w2v.getVector(bad[i], function(v2){
					console.log("badWordとの関連度: " + v1.cosineSimilarity(v2));
				});
			//}
			//console.log("BadWordsとの関連度" + badScore);
		});
		if(result.words[result.importantWords[rnd]][1] === "名詞"){
			if(result.words[result.importantWords[rnd]][2] === "固有名詞"){
				req.driver.reply(req, "あ，" + result.words[result.importantWords[rnd]][0] + "知ってる！");
			}else if(result.words[result.importantWords[rnd]][2] === "一般"){
				req.driver.reply(req, result.words[result.importantWords[rnd]][0] + "か，それでー？");
			}else if(result.words[result.importantWords[rnd]][2] === "サ変接続"){
				req.driver.reply(req, result.words[result.importantWords[rnd]][0] + "するの！？");
			}else{
				req.driver.reply(req, result.words[result.importantWords[rnd]][0] + "ってなんだっけ…？");
			}
		}else if(result.words[result.importantWords[rnd]][1] === "動詞"){
			var random = Math.floor(Math.random() * 2);
			if(random === 0){
				req.driver.reply(req, "どうして" + result.words[result.importantWords[rnd]][7] + "の？");
			}else{
				req.driver.reply(req, "だよね，めっちゃ" + result.words[result.importantWords[rnd]][7] + "，わかる〜");
			}
		}else if(result.words[result.importantWords[rnd]][1] === "形容詞" || result.words[result.importantWords[rnd]][1] === "形容動詞"){
			req.driver.reply(req, result.words[result.importantWords[rnd]][7] + "よね〜");
		}else{
			req.driver.reply(req, result.words[result.importantWords[rnd]][0] + "〜〜");
		}
	}
}
