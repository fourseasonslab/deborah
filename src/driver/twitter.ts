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