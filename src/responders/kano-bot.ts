class DeborahResponderKano extends DeborahResponder
{
	constructor(bot: Deborah){
		super(bot);
		this.name ="Kano";
	}
	generateResponse(req: DeborahMessage){
		/*for(var i = 0; i< req.analytics.importantWords.length; i++){
			console.log(req.analytics.words[req.analytics.importantWords[i]][0]);
		}*/
		var rnd = Math.floor(Math.random() * req.analytics.importantWords.length);
		if(req.analytics.words[req.analytics.importantWords[rnd]][1] === "名詞"){
			if(req.analytics.words[req.analytics.importantWords[rnd]][2] === "固有名詞"){
				req.driver.reply(req, "あ，" + req.analytics.words[req.analytics.importantWords[rnd]][0] + "知ってる！");
			}else if(req.analytics.words[req.analytics.importantWords[rnd]][2] === "一般"){
				req.driver.reply(req, req.analytics.words[req.analytics.importantWords[rnd]][0] + "か，それでー？");
			}else if(req.analytics.words[req.analytics.importantWords[rnd]][2] === "サ変接続"){
				req.driver.reply(req, req.analytics.words[req.analytics.importantWords[rnd]][0] + "するの！？");
			}else{
				req.driver.reply(req, req.analytics.words[req.analytics.importantWords[rnd]][0] + "ってなんだっけ…？");
			}
		}else if(req.analytics.words[req.analytics.importantWords[rnd]][1] === "動詞"){
			var random = Math.floor(Math.random() * 2);
			if(random === 0){
				req.driver.reply(req, "どうして" + req.analytics.words[req.analytics.importantWords[rnd]][7] + "の？");
			}else{
				req.driver.reply(req, "だよね，めっちゃ" + req.analytics.words[req.analytics.importantWords[rnd]][7] + "，わかる〜");
			}
		}else if(req.analytics.words[req.analytics.importantWords[rnd]][1] === "形容詞" || req.analytics.words[req.analytics.importantWords[rnd]][1] === "形容動詞"){
			req.driver.reply(req, req.analytics.words[req.analytics.importantWords[rnd]][7] + "よね〜");
		}else{
			req.driver.reply(req, req.analytics.words[req.analytics.importantWords[rnd]][0] + "〜〜");
		}
	}
}
