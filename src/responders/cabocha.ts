class DeborahResponderCabocha extends DeborahResponder
{
	constructor(bot: Deborah){
		super(bot);
		this.name ="Cabocha";
	}
	generateResponse(req: DeborahMessage){
		this.bot.cabochaf1.parse(req.text, function(result) {
			//console.log("がおお" + result);  
			var depres = result.depRels;
			var num;
			//for(var i = 0; i < depres.length; i++) console.log("resArray[" + i + "][1] = " + resArray[i][1]);
			for(var i = 0; i < depres.length; i++){
				if(depres[i][0] === -1){
					num = i;
					//console.log("num = " + num);
					break;
				}
			}
			//console.log(JSON.stringify(result, null, " "));
			for(var i = 0; i < num; i++){
				//console.log("depres[" + i + "][1] = " + resArray[i][1]);
				if(depres[i][0] === num){
					//console.log("s = " + s);
					req.driver.reply(req, "Cabocha  " + "そうか、君は" + depres[i][1] + depres[num][1] + "フレンズなんだね！");
					console.log(depres[num][2].length);
					for(var j = 0; j < depres[num][2].length; j++){
						var w = depres[num][2][j];
						console.log(w);
						console.log(result.words[w]);
						if(result.words[w][1] === "動詞"){
							console.log(result.words[w][0] + "の終止形は" + result.words[w][7] + "だよ");
						}
					}
				}
			}
			console.log("最大値: " + Math.max.apply(null, result.scores));
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

			result.types = types;

			for(var i = 0; i< result.types.length; i++){
				if(result.types[i] === "food"){
					req.driver.reply(req, "type: " + result.words[i][0] + "美味しかったですか？");
				}
			}
		});
	}
}
