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
	responderList: DeborahResponder[] = [];
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
		var Cabocha = require('node-cabocha');
		this.cabochaf1 = new Cabocha();
		//this.responderList.push(new DeborahResponder(this));
		this.responderList.push(new DeborahResponderCabocha(this));
		//this.responderList.push(new DeborahResponderMeCab(this));
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
		data.analyze(function(analyzedData: DeborahMessage){
			var rnd = Math.floor(Math.random() * analyzedData.analytics.importantWords.length);
			//console.log(analyzedData.analytics.importantWords);
			if(analyzedData.analytics.words[analyzedData.analytics.importantWords[rnd]][1] === "名詞"){
				data.driver.reply(data, analyzedData.analytics.words[analyzedData.analytics.importantWords[rnd]][0] + "について聞かせてよ！");
			}else if(analyzedData.analytics.words[analyzedData.analytics.importantWords[rnd]][1] === "動詞"){
				data.driver.reply(data, "どうして" + analyzedData.analytics.words[analyzedData.analytics.importantWords[rnd]][7] + "の？");
			}else if(analyzedData.analytics.words[analyzedData.analytics.importantWords[rnd]][1] === "形容詞" || analyzedData.analytics.words[analyzedData.analytics.importantWords[rnd]][1] === "形容動詞"){
				data.driver.reply(data, analyzedData.analytics.words[analyzedData.analytics.importantWords[rnd]][7] + "よね〜");
			}else{
				data.driver.reply(data, analyzedData.analytics.words[analyzedData.analytics.importantWords[rnd]][0] + "ってこと！？");
			}

		});
		try {
			// メッセージが空なら帰る
			console.log("Deborah.receive: [" + data.text + "] in "+ data.context);

			// 最初の無視期間は反応せず帰る
			if((Date.now() - this.launchDate.getTime()) < this.initialIgnorePeriod){
				console.log("initial ignore period. ignore.");
				return 0;
			}

			// ランダムにresponderを選択して、それに処理を引き渡す。
			var idx = Math.floor(Math.random() * this.responderList.length);
			console.log("Responder: " + this.responderList[idx].name);
			this.responderList[idx].generateResponse(data); 

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
