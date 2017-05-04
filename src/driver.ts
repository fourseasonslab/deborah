abstract class DeborahDriver
{
	bot: Deborah;
	settings: any;
	//
	constructor(bot: Deborah, settings: any){
		this.bot = bot;
		this.settings = settings;
	}
	reply(replyTo: DeborahMessage, message: string){
		console.log("DeborahDriver: Default: " + message);
	}
	protected tryRequire(path: string) : any {
		try {
			return require(path);
		} catch(e) {
			console.log("DeborahDriver needs '" + path + "'.\n Please run 'sudo npm install -g " + path + "'");
		}
		return null;
	}
}


class DeborahDriverLineApp extends DeborahDriver
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
	constructor(bot: Deborah, settings: any) {
		super(bot, settings);
		this.line    = this.tryRequire('node-line-bot-api');
		this.express = this.tryRequire('express');
		this.bodyParser = this.tryRequire('body-parser');
		this.lineClient = this.line.client;
		this.lineValidator = this.line.validator;
		this.app = this.express();

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
				let errorCount: number = 0;
				req.body.events.map(function(event){
					console.log(event.source.userId);
					if (!event.message.text) return;
					that.line.client.getProfile(event.source.userId).then((profile)=>{
						var m = new DeborahMessage();
						m.text = event.message.text;
						m.senderName = profile.displayName;
						m.context = "main";
						m.driver = that;
						m.rawData = null;
						that.stat = 1;
						that.message = "";
						that.bot.receive(m);
						if (that.stat == 2) {
							// promises.push(that.line.client.replyMessage({
							that.line.client.replyMessage({
								replyToken: event.replyToken,
								messages: [
									{
										type: 'text',
										text: that.message
									}
								]
								// }));
							}).catch(()=>{ errorCount++; });
						}
						that.stat = 0;
					}, ()=>{ errorCount++; });
				});
				// Promise.all(promises).then(function(){res.json({success: true})});
				if (!errorCount) res.json({success: true});
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
			this.message += (this.message ? "\n" : "") +  message;
			this.stat = 2;
		} 
	}
}

class DeborahDriverSlack extends DeborahDriver
{
	bot: Deborah;
	token: string;
	connection: any;
	connectionSettings: any;
	constructor(bot: Deborah, settings: any){
		super(bot, settings);
		console.log("Driver initialized: Slack (" + settings.team + ")");
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
			m.date = new Date(data.ts * 1000);
			if(m.date < that.bot.launchDate){
				console.log("This message was sended before booting. Ignore.");
				return;
			}
			//
			if(m.senderName == that.bot.settings.profile.name) return;
			//

			//
			that.bot.receive(m);
		});
	}
	reply(replyTo: DeborahMessage, message: string){
		if(this.settings.output === false){
			console.log("Disabled output:");
			console.log(replyTo);
			console.log(message);
			return;
		}
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

class DeborahDriverStdIO extends DeborahDriver
{
	bot: Deborah;
	readline: any;
	openjtalk: any;
	constructor(bot: Deborah, settings: any){
		super(bot, settings);
		console.log("Driver initialized: StdIO");
		//
		var OpenJTalk = this.tryRequire('openjtalk');
		if(OpenJTalk){
			this.openjtalk = new OpenJTalk();
			this.openjtalk.talk('音声合成が有効です');
		} else{
			this.openjtalk = null;
		}
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
		if(this.openjtalk){
			this.openjtalk.talk(message);
		}
	}
}

class DeborahDriverTwitter extends DeborahDriver
{
	bot: Deborah;
	settings: any;
	client: any;
	constructor(bot: Deborah, settings: any){
		super(bot, settings);
		console.log("Driver initialized: Twitter");
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

class DeborahDriverWebAPI extends DeborahDriver
{
	bot: Deborah;
	settings: any;
	httpServer: any;
	io: any;
	openjtalk: any;
	dataurl: any;
	fs: any;
	constructor(bot: Deborah, settings: any){
		super(bot, settings);
		console.log("Driver initialized: WebAPI");
		//
		this.fs = require('fs');
		this.dataurl = require('dataurl');
		var port = 3000;
		var Sock = require('socket.io');
		var http = require('http');
		var that = this;
		var OpenJTalk = this.tryRequire('openjtalk');
		if(OpenJTalk){
			this.openjtalk = new OpenJTalk();
			//this.openjtalk.talk('音声合成が有効です');
		} else{
			this.openjtalk = null;
		}
		//
		this.httpServer = http.createServer();
		this.httpServer.on('request', function(req, res){
			var stream = that.fs.createReadStream('index.html');
			res.writeHead(200, {'Content-Type': 'text/html'});
			stream.pipe(res);
		});
		this.io = Sock.listen(this.httpServer);
		this.io.on('connection', function(socket){
			console.log("connection established");
			//console.log(client);
			socket.on('input', function(data){
				console.log("recv input:");
				console.log(data);
				//
				var m = new DeborahMessage();
				m.text = data.text;
				m.senderName = "unknown";
				m.context = socket;
				m.driver = that;
				m.rawData = socket;
				//
				that.bot.receive(m);
			});
		});
		console.log("Listen on port " + port);
		this.httpServer.listen(port);
	}
	reply(replyTo: DeborahMessage, message: string){
		this.createVoiceURL(message, function(url: string){
			console.log("webapi: reply: " + message);
			var m = {
				text: message,
				voiceURL: url,
			};
			replyTo.rawData.emit("reply", m);
		});
	}
	createVoiceURL(text: string, f: (url: string) => void){
		var that = this;
		this.openjtalk._makeWav(text, this.openjtalk.pitch, function(err, res){
			console.log(res);
			that.fs.readFile(res.wav, function(err, data){
				var url = that.dataurl.convert({
					data: data,
					mimetype: 'audio/wav'
				});
				//console.log(url);
				f(url);
				that.fs.unlink(res.wav, function (err) {
					if (err) console.log('unlink failed');
				});
			});
		});
	}
}
