
/*
// helloイベント（自分の起動）が発生したとき
slack.on('hello', function (data){
	// settings.channelsをユニークなIDに変換する
for (var i = 0; i<settings.channels.length; i++){
var chname = settings.channels[i].substr(1, settings.channels[i].length-1).toLowerCase();
switch (settings.channels[i].charAt(0)){
	// 指定先がChannel(public)の場合
case "#":
settings.channels[i] = slack.getChannel(chname).id;
break;

// 指定先がUserの場合
case "@":
settings.channels[i] = slack.getIM(chname).id;
break;

// 指定先がGroup(private)の場合
case "%":
settings.channels[i] = slack.getGroup(chname).id;
break;

// その他
default:
}
}
// ごあいさつ
for(var k of settings.channels){
sendAsBot(k,"Hi! I'm here now!");
}
});

 */

class Deborah
{
	driverList: DeborahDriver[] = [];
	settings: any;
	mecab: any;
	//cabochaf0: any;
	cabochaf1: any;
	launchDate: Date;
	initialIgnorePeriod: number = 5000;	// ms
	fixedResponseList: (string[])[] = [
		[":fish_cake:", "やっぱなるとだよね！ :fish_cake:"],
		["むり", "まあまあ。:zabuton: 一休みですよ！ :sleeping:"],
		["死", "まだ死ぬには早いですよ！ :iconv:"],
		["test","test"]
	];
	constructor(){
		console.log("Initializing deborah...");
		this.launchDate = new Date();
		var fs = require("fs");
		let fval, fname = "settings.json";
		try {
			fval = fs.readFileSync('settings.json');
		} catch(e) {
			console.log("settings.json not found.\nimporting settings from environmental variable...");
			fval = process.env.DEBORAH_CONFIG;
		}
		if (!fval) {
			console.log("Error: cannot load settings.");
			process.exit(1);
		}
		this.settings = JSON.parse(fval);
		console.log(JSON.stringify(this.settings, null, 1));
		var MeCab = require('mecab-lite');
		this.mecab = new MeCab();
		this.cabochaf1 = new Cabocha();
		//this.cabochaf0 = new Cabocha("f0");

		//
	}
	start(){
		var interfaces = this.settings.interfaces;
		if (!(interfaces instanceof Array)) {
			console.log("settings.interfaces is not an Array.");
			process.exit(0);
		}
		for (var i = 0; i < interfaces.length; i++) {
			var iset = interfaces[i];
			if (iset.type == "slack-connection") {
				this.driverList.push(new DeborahDriverSlack(this, iset));
			} else if (iset.type == "stdio") {
				this.driverList.push(new DeborahDriverStdIO(this, iset));
			} if(iset.type == "twitter"){
				this.driverList.push(new DeborahDriverTwitter(this, iset));
			} else if (iset.type == "line") {
				this.driverList.push(new DeborahDriverLineApp(this, iset));
			} else if (iset.type == "webapi") {
				this.driverList.push(new DeborahDriverWebAPI(this, iset));
			}
		}
	}
	receive(data: DeborahMessage){
		try {
			// メッセージが空なら帰る
			console.log("Deborah.receive: [" + data.text + "] in "+ data.context);
			// 最初の無視期間は反応せず帰る
			if((Date.now() - this.launchDate.getTime()) < this.initialIgnorePeriod){
				console.log("initial ignore period. ignore.");
				return 0;
			}
			// 特定の文字列〔例：:fish_cake:（なるとの絵文字）〕を含むメッセージに反応する
			/*
							  for(var k in this.fixedResponseList){
							  for (let baka in data) console.log("data[" + baka + "] = " + data[baka]);
							  if(data.text.match(this.fixedResponseList[k][0])){
							  data.driver.reply(data, this.fixedResponseList[k][1]);
							  break;
							  }
							  }
			 */
			/*
			this.cabochaf0.parse(data.text, function(result) {
				console.log("" + result);  
			});
			*/
			this.cabochaf1.parse(data.text, function(result) {
				console.log("がおお" + result);  
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
				//console.log(JSON.stringify(ret, null, " "));
				for(var i = 0; i < num; i++){
					//console.log("depres[" + i + "][1] = " + resArray[i][1]);
					if(depres[i][0] === num){
						//console.log("s = " + s);
						data.driver.reply(data, "Cabocha  " + "そうか、君は" + depres[i][1] + depres[num][1] + "フレンズなんだね！");
						//console.log("Cabocha  " + "そうか、君は" + depres[i][1] + depres[num][1] + "フレンズなんだね！");
					}
				}
			});
			this.mecab.parse(data.text, function(err, result) {
				//console.log(JSON.stringify(result, null, 2));
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
					//data.driver.reply(data, "そうか、君は" + s + "フレンズなんだね！");
				}
				/*
									  if (result) {
									  for(var i=0;i<result.length-1;i++){
									  ans += result[i][0] + "/";
									  }
									  } else {
									  ans = "ごめんなさい、このサーバーはmecabには対応していません";
									  }
									  data.driver.reply(data, ans);
				 */
			});

			// %から始まる文字列をコマンドとして認識する
			this.doCommand(data);
		} catch(e) {
			data.driver.reply(data, "内部エラーが発生しました。\nメッセージ: " + e);
		}
	}
	doCommand(data: DeborahMessage){
		// %から始まる文字列をコマンドとして認識する
		if (data.text.charAt(0) !== '%') return;
		var command = data.text.substring(1).split(' ');
		// コマンドの種類により異なる動作を選択
		switch (command[0].toLowerCase()) {
			case 'date':
				// %date
				// 起動時刻を返します
				data.driver.reply(data, "起動時刻は" + this.launchDate + "です。");
				break;
			case 'uptime':
				// %uptime
				// 起動からの経過時間[ms]を返します。
				data.driver.reply(data, "起動してから" + (Date.now() - this.launchDate.getTime()) + "ms経過しました。");
				break;
			case 'hello':
				// %hello
				// 挨拶します
				data.driver.reply(data, 'Oh, hello ' + data.senderName + ' !');
				break;
			case 'say':
				// %say str
				// 指定の文字列を喋ります
				var str = data.text.split('%say ')[1];
				data.driver.reply(data, str);
				break;
			case 'mecab':
				// %mecab str
				// mecabに指定の文字列を渡して分かち書きの結果を返します
				var str = data.text.split('%mecab ')[1];
				var that = this;
				this.mecab.parse(str, function(err, result) {
					var ans = "";
					if (result) {
						for(var i=0;i<result.length-1;i++){
							ans += result[i][0] + "/";
						}
					} else {
						ans = "ごめんなさい、このサーバーはmecabには対応していません";
					}
					data.driver.reply(data, ans);
				});
				break;
			case 'debug':
				// %debug
				// デバッグ用コマンド。
				switch (command[1]){
					case 'slackData':
						console.log(data.rawData);
						break;
					case 'cur':
						console.log(data);
						break;
				}
				break;
		}
	}
}

var deborah = new Deborah();
deborah.start();
