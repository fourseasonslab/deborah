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
			that.bot.exitHandler();
		});
	}
	reply(replyTo: DeborahMessage, message: string){
		this.readline.write(message);
		if(this.openjtalk){
			this.openjtalk.talk(message);
		}
	}
}