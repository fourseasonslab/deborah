class DeborahResponderWord2Vec extends DeborahResponder
{

	w2v = null;

	constructor(bot: Deborah){
		super(bot);
		this.name ="Word2Vec";
		var W2V = require("node-word2vec");
		this.w2v = new W2V(this.bot.settings.lib.word2vec.vectorPath);
		
	};
	generateResponse(req: DeborahMessage){

		this.w2v.getVector("陽子",function(v1){
			console.log('陽子のべくとるは' + JSON.stringify(v1) + 'なんだって！');
			});

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

		console.log("generateRspまできたよ！");
	}
}
