import {Deborah} from "../deborah";
import {DeborahDriver} from "../driver";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";

export class DeborahResponderKano extends DeborahResponder
{
	w2v: any;
	goodVector: any;
	badVector: any;
	favVector: any;
	constructor(bot: Deborah){
		super(bot);
		this.name ="Kano";
		var Word2Vec = require("node-word2vec");
		this.w2v = new Word2Vec(this.bot.settings.lib.word2vec.vectorPath);
		var good = ["良い", "好き", "快い", "肯定", "楽しい", "美しい", "嬉しい", "喜ぶ", "ポジティブ", "最高", "最良"];
		var bad = ["悪い", "嫌い", "不快", "否定", "つまらない", "醜い", "嫌", "悲しむ", "ネガティブ", "最低", "最悪"];
		var fav = ["合唱", "猫", "ゲーム", "本", "読書", "寝る", "ごはん", "食べる", "歌う", "カラオケ", "牛乳"];
		this.goodVector = [];
		this.badVector = [];
		this.favVector = [];
		var that = this;
		for(var i = 0; i< good.length; i++){
			this.w2v.getVector(good[i], function(v){
				that.goodVector.push(v);
			});
		}
		for(var i = 0; i< bad.length; i++){
			this.w2v.getVector(bad[i], function(v){
				that.badVector.push(v);
			});
		}
		for(var i = 0; i< fav.length; i++){
			this.w2v.getVector(fav[i], function(v){
				that.favVector.push(v);
			});
		}
	}
	generateResponse(req: DeborahMessage){
		var result = req.analytics;
		var not: boolean;
		/*
		for(var i = 0; i < result.words.length; i++){
			if(result.words[i][7] === "ない"){
				not = true;
				break;
			}
		}
		if(not){
			req.driver.reply(req, "否定的かも？");
		}
		*/
		var rnd = Math.floor(Math.random() * result.importantWords.length);
		var that = this;
		var goodScore = 0;
		var badScore = 0;
		var favScore = 0;
		this.w2v.getVector(result.words[result.importantWords[rnd]][7], function(v1){
			for(var i=0; i < that.goodVector.length; i++){
				goodScore += v1.cosineSimilarity(that.goodVector[i]);
			}
			console.log("GoodWordsとの関連度: " + goodScore);
		});
		this.w2v.getVector(result.words[result.importantWords[rnd]][7], function(v1){
			for(var i=0; i < that.badVector.length; i++){
				badScore += v1.cosineSimilarity(that.badVector[i]);
			}
			console.log("BadWordsとの関連度: " + badScore);
			if(goodScore - badScore > 0.1){
				console.log("(いい感じ〜)");
				req.driver.reply(req, ":blush:");
			}else if(goodScore - badScore < -0.1){
				console.log("ちょっと怖い…");
				req.driver.reply(req, ":fearful:");
			}else{
				console.log("普通っぽいなぁ");
				req.driver.reply(req, ":fish_cake:");
			}
		});
		this.w2v.getVector(result.words[result.importantWords[rnd]][7], function(v1){
			for(var i=0; i < that.favVector.length; i++){
				favScore += v1.cosineSimilarity(that.favVector[i]);
			}
			if(favScore >= 1.5){
				console.log("これ好きだなぁ");
				req.driver.reply(req, ":gift_heart:");
			}else{
				console.log("そうでもないわ");
			}
		});
		if(result.words[result.importantWords[rnd]][1] === "名詞"){
			if(result.words[result.importantWords[rnd]][2] === "固有名詞"){
				req.driver.reply(req, "あ，" + result.words[result.importantWords[rnd]][0] + "知ってる！");
			}else if(result.words[result.importantWords[rnd]][2] === "一般"){
				req.driver.reply(req, result.words[result.importantWords[rnd]][0] + "か，ふむふむ〜");
			}else if(result.words[result.importantWords[rnd]][2] === "サ変接続"){
				req.driver.reply(req, result.words[result.importantWords[rnd]][0] + "するの！？");
			}else if(result.words[result.importantWords[rnd]][2] === "形容動詞語幹"){
				req.driver.reply(req, result.words[result.importantWords[rnd]][0] + "なものかぁ");
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
