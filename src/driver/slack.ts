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