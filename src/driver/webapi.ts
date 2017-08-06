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