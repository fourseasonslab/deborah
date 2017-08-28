class DeborahResponderProton extends DeborahResponder
{

	jisho: string[];
	used_words: string[];

	constructor(bot: Deborah){
		super(bot);
		this.name ="Proton";
		//console.log("計算できたよ！");
		//
		const fs = require('fs');
		this.jisho = ("" + fs.readFileSync('src/responder/yomi.txt')) .split("\n");
		this.used_words = [];

	};
	generateResponse(req: DeborahMessage){

		var result = req.analytics;
		//	var that = this;
		//console.log(req.analytics.words[0][8]);
		var reply = "";
		for(var i=0; i<req.analytics.words.length; i++){
			reply += req.analytics.words[i][8];
		}
		console.log(reply);

		if(this.used_words.indexOf(reply)>=0){
			req.driver.reply(req,"それさっき言ったよ〜！あなたの負けね！ふふふ");
		}else{

			//履歴に追加
			this.used_words.push(reply);
			/*	var jisho = ["カクテル", "リンゴ", "ゴリラ", "ラクダ", 
			"ダチョウ", "ウミ", "ミント", "トウモコロシ", "シルク", "クルマ",
			"マイタケ", "ケトル", "ルーマニア", "アメリカ", "カラス",
			"にほんしゆ", "ゆき"];
			 */


			/*req.driver.reply(req, "最初の文字は");
			req.driver.reply(req, req.analytics.words[0][8][0]);
			req.driver.reply(req, ", 最後の文字は");
			req.driver.reply(req, req.analytics.words[0][8][req.analytics.words[0][8].length - 1]);
			 */


			//最後の文字の例外処理
			//var last = req.analytics.words[0][8][req.analytics.words[0][8].length - 1];
			var last = reply[reply.length-1];
			if(last == "ー"){
				last = reply[reply.length-2];
			}

			switch(last){
				case "ッ":
					last = "ツ";
					break;
				case "ャ":
					last = "ヤ";
					break;
				case "ュ":
					last = "ユ";
					break;
				case "ョ":
					last = "ヨ";
					break;
			}

			if(last == "ン"){
				req.driver.reply(req, "きさまの負けだ！！！");
			}else{
				for(var i=0; i<this.jisho.length; i++){
					if((last == this.jisho[i][0]) && (this.jisho[i][this.jisho[i].length-1] != "ン")){
						if(this.used_words.indexOf(this.jisho[i]) < 0){	
							req.driver.reply(req, this.jisho[i]);
							this.used_words.push(this.jisho[i]);
							break;
						}
					}
				}
			}
			//console.log(this.used_words);
			/*
		var rep1 = "";
		var rep2 = "";

		for(var i = 0; i < req.text.length; i++){
			if(i%2 == 0){
				rep1 += req.text[i];
			}else{
				rep2 += req.text[i];
			}
		}

		req.driver.reply(req, rep1);
		req.driver.reply(req, rep2);
			 */
		}
	}
}
