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