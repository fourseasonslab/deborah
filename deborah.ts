interface DeborahDriver
{
	bot: Deborah;
	reply(replyTo: DeborahMessage, message: string);
}

class DeborahMessage
{
	text: string;
	senderName: string;
	context: string;	// group id etc. depends on driver.
	driver: DeborahDriver;
	rawData: any;
}

class DeborahDriverLineApp implements DeborahDriver
{
	line: any;
	express: any;
	bodyParser: any;
	lineClient: any;
	lineValidator: any;
	app: any;

	stat: number = 0;
	replyTo: DeborahMessage = null;
	message: string = null;

	bot: Deborah;
	settings: any;
	private tryRequire(path: string) : any {
		try {
			return require(path);
		} catch(e) {
			console.log("DeborahDriverLineApp needs '" + path + "'.\n Please run 'sudo npm install -g " + path + "'");
		}
		return null;
	}
	constructor(bot: Deborah, settings: any) {
		this.line    = this.tryRequire('node-line-bot-api');
		this.express = this.tryRequire('express');
		this.bodyParser = this.tryRequire('body-parser');
		this.lineClient = this.line.client;
		this.lineValidator = this.line.validator;
		this.app = this.express();

		this.bot = bot;
		this.settings = settings;
		this.app.use(this.bodyParser.json({
			verify: function (req, res, buf) {
				req.rawBody = buf;
			}
		}));
		this.line.init({
			accessToken: process.env.LINE_TOKEN || this.settings.accessToken,
			channelSecret: process.env.LINE_SECRET || this.settings.channelSecret
		});
		let that = this;
		this.app.post('/webhook/', 
		  this.line.validator.validateSignature(), 
		  function(req, res, next){
			const promises: Promise<any>[] = [];
			req.body.events.map(function(event){
				if (!event.message.text) return;
					var m = new DeborahMessage();
					m.text = event.message.text;
					m.senderName = "unknown";
					m.context = "main";
					m.driver = that;
					m.rawData = null;
					that.stat = 1;
					that.bot.receive(m);
					if (that.stat == 2) {
						promises.push(that.line.client.replyMessage({
							replyToken: event.replyToken,
							messages: [
								{
									type: 'text',
									text: that.message
								}
							]
						}));
					}
					that.stat = 0;
			});
			Promise.all(promises).then(function(){res.json({success: true})});
		});
		this.connect();
	}
	connect() {
		let port = process.env.PORT || 3000;
		this.app.listen(port, function(){
			console.log('Example app listening on port ' + port + '!')
		});
	}
	reply(replyTo: DeborahMessage, message: string){
		if (this.stat == 1) {
			// Send as reply
			this.replyTo = replyTo;
			this.message = message;
			this.stat = 2;
		} 
	}
}

class DeborahDriverSlack implements DeborahDriver
{
	bot: Deborah;
	token: string;
	connection: any;
	connectionSettings: any;
	constructor(bot: Deborah, settings: any){
		console.log("Driver initialized: Slack (" + settings.team + ")");
		this.bot = bot;
		this.connectionSettings = settings;
		var slackAPI = require('slackbotapi');
		this.connection = new slackAPI({
			'token': this.connectionSettings.token,
			'logging': false,
			'autoReconnect': true
		});
		this.connect();
	}
	connect(){
		var that = this;
		this.connection.on('message', function(data){
			// receive
			console.log(JSON.stringify(data, null, " "));
			if(!data || !data.text) return;
			if("subtype" in data && data.subtype === "bot_message") return;
			var m = new DeborahMessage();
			m.text = data.text;
			m.senderName = that.getUsername(data);
			m.context = data.channel;
			m.driver = that;
			m.rawData = data;
			//
			if(m.senderName == that.bot.settings.profile.name) return;
			//
			
			//
			that.bot.receive(m);
		});
	}
	reply(replyTo: DeborahMessage, message: string){
		this.sendAs(replyTo.context, "@"+replyTo.senderName+" "+message, this.bot.settings.profile.name, this.bot.settings.profile["slack-icon"]);
	}
	sendAs(channel, text, name, icon){
		var data: any = new Object();
		data.text = text;
		data.channel = channel;
		data.icon_emoji = icon;
		data.username = name;
		this.connection.reqAPI("chat.postMessage", data);
	}
	getUsername(data: any){
		// botの場合
		if(data.user === undefined) {
			return data.username;
		} else {
			return this.connection.getUser(data.user).name;
		}
	}
}

class DeborahDriverStdIO implements DeborahDriver
{
	bot: Deborah;
	readline;
	constructor(bot: Deborah, setting: any){
		console.log("Driver initialized: StdIO");
		this.bot = bot;
		// 標準入力をlisten
		var that = this;
		this.readline = require('readline').createInterface({
			input: process.stdin,
			output: process.stdout
		});
		this.readline.on('line', function(line) {
			var m = new DeborahMessage();
			m.text = line;
			m.senderName = "local";
			m.context = "StdIO";
			m.driver = that;
			m.rawData = line;
			//
			that.bot.receive(m);
		});
		// c-C（EOF）が入力されたら
		this.readline.on('close', function() {
			// 別れの挨拶
			console.log("Terminating...");
			//sendAsBot(settings.channels[0],"Bye!",function (){
				process.exit(0);
			//});
		});
	}
	reply(replyTo: DeborahMessage, message: string){
		this.readline.write(message);
	}
}

class DeborahDriverTwitter implements DeborahDriver
{
	bot: Deborah;
	settings: any;
	client: any;
	
	constructor(bot: Deborah, settings: any){
		console.log("Driver initialized: Twitter");
		this.bot = bot;
		this.settings = settings;
		var Twitter = require('twitter');
		this.client = new Twitter({
			consumer_key: settings.consumer_key,
			consumer_secret: settings.consumer_secret,
			access_token_key: settings.access_token_key,
			access_token_secret: settings.access_token_secret
		});
		var that = this;
		this.client.stream('user', function(stream) {
			stream.on('data', function(data) {
				var id        = ('user' in data && 'screen_name' in data.user) ? data.user.screen_name : null;
				var text      = ('text' in data) ? data.text.replace(new RegExp('^@' + that.settings.screen_name + ' '), '') : '';
				var ifMention = ('in_reply_to_user_id' in data) ? (data.in_reply_to_user_id !== null) : false;
				var ifMentionToMe = ifMention && (data.in_reply_to_screen_name === that.settings.screen_name);

				console.log(data);
				
				if (!ifMentionToMe || id == that.settings.screen_name) return;

				var m = new DeborahMessage();
				m.text = text;
				m.senderName = id;
				m.context = "Twitter";
				m.driver = that;
				m.rawData = data;

				that.bot.receive(m);
			});
		});
	}
	reply(replyTo: DeborahMessage, message: string){
		var msg = {
			"status": "@"+replyTo.senderName+" "+message,
			"in_reply_to_status_id": replyTo.rawData.id_str,
		};
		this.client.post('statuses/update', msg, function(error, tweet, response) {
			if(error) throw error;
			console.log(tweet);  // Tweet body.
			//console.log(response);  // Raw response object.
		});
	}
}

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
		this.settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
		console.log(JSON.stringify(this.settings, null, 1));
		var MeCab = require('mecab-lite');
		this.mecab = new MeCab();
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
			}
		}
	}
	receive(data: DeborahMessage){
		// メッセージが空なら帰る
		console.log("Deborah.receive: [" + data.text + "] in "+ data.context);
		// 最初の無視期間は反応せず帰る
		if((Date.now() - this.launchDate.getTime()) < this.initialIgnorePeriod){
			console.log("initial ignore period. ignore.");
			return 0;
		}
		// 特定の文字列〔例：:fish_cake:（なるとの絵文字）〕を含むメッセージに反応する
		for(var k in this.fixedResponseList){
			for (let baka in data) console.log("data[" + baka + "] = " + data[baka]);
			if(data.text.match(this.fixedResponseList[k][0])){
				data.driver.reply(data, this.fixedResponseList[k][1]);
				break;
			}
		}
		// %から始まる文字列をコマンドとして認識する
		this.doCommand(data);
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
						for(var i=0;i<result.length-1;i++){
							ans += result[i][0] + "/";
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
