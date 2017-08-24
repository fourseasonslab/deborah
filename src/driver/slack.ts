/**
 * slackBOTを担当するドライバ
 */

interface JSONData
{
	[name: string]: JSONData|number|string|boolean| JSONData[];
}

interface Slack
{
	channels: SlackChannels;
	rtm: SlackRtm;
	files: SlackFiles;
}

interface SlackRtm
{
	client(): SlackClient;
	connect(token: SlackToken, callback: (err: JSONData, data: JSONData) => any);
	start(token: SlackToken, callback: (err: JSONData, data: JSONData) => any);
}

interface SlackToken
{
}

interface SlackParams extends SlackToken, JSONData
{

}

interface SlackFilesUploadParams
{
	token: string;
	channels?: string;	// comma-separated
	content?: string;
	filename?: string;
	filetype?: string;
	title?: string;
}

interface SlackChannels
{
	list(token: SlackToken, callback: (err: JSONData, data: JSONData) => any);
}

interface SlackClient
{
	listen(token: SlackToken);
	message(callback: (data: JSONData) => any);
	hello(callback: (data: JSONData) => any);
}

interface SlackFiles
{
	upload(params: SlackFilesUploadParams, callback: (err: JSONData, data: JSONData) => any);
}

class DeborahDriverSlack extends DeborahDriver
{
	static SlackBotAPI;		// slackbotapi: for Streaming API
	static Slack: Slack;	// slack: for REST API
	/** 生成元であるDeborahのインスタンス */
	bot: Deborah;
	/** settings.jsonで与えられたinterfaceの設定 */
	settings: any;
	/** slackAPIのインスタンス */
	connection: any;
	client: SlackClient;
	channelIDList: string[] = [];
	/**
	 * コンストラクタ。
	 * @param bot 生成元であるDeborahのインスタンス
	 * @param settings settings.jsonで与えられたinterfaceの設定
	 */
	constructor(bot: Deborah, settings: any){
		// 親クラスのコンストラクタを呼ぶ
		super(bot, settings);
		console.log("Driver initialized: Slack (" + settings.team + ")");

		// =============== 変数初期化 ===============
		if(DeborahDriverSlack.SlackBotAPI == undefined){
			DeborahDriverSlack.SlackBotAPI = require('slackbotapi');
		}
		if(DeborahDriverSlack.Slack == undefined){
			DeborahDriverSlack.Slack = require('slack');
		}
		this.connection = new DeborahDriverSlack.SlackBotAPI({
			'token': this.settings.token,
			'logging': false,
			'autoReconnect': true
		});
		// connect関数に処理を引き渡す
		this.connect();
	}

	/**
	 * 接続を確立する。messageイベントを待ち受ける。
	 */
	connect(){
		var that = this;
		this.connection.on('message', function(data){
			that.receive(data);
		});
		this.connection.on('open', function(){
			that.connected();
		});
	}
	connected(){
		if(this.settings && this.settings.channels instanceof Array){
			console.log("Listening channels:");
			for(var k of this.settings.channels){
				var c = this.connection.getChannel(k);
				if(c){
					console.log(k + " (" + c.id + ")");
					this.channelIDList.push(c.id);
				} else{
					console.log(k + " (Not found)");
				}
			}
		}
		console.log("connection opened!!!");
	}
	receive(data){
		// 受信した
		console.log(JSON.stringify(data, null, " "));
		// data.channel: string			channel ID

		// データか中身のテキストが空なら帰る
		if(!data || !data.text) return;

		// 他のbotからのメッセージは無視する（無限ループ防止）
		if("subtype" in data && data.subtype === "bot_message") return;

		// チャンネル情報を取得
		var channnelInfo;
		if(data.channel) {
			channnelInfo = this.connection.getChannel(data.channel)
		}
		// 指定されたチャンネル以外のメッセージは破棄する
		if(this.channelIDList.indexOf(channnelInfo.id) < 0){
			console.log("This message was sent to channel not in the list. Ignore.");
			return;
		}

		// 受信したメッセージの情報をもとにDeborahMessageを作成
		var m = new DeborahMessage();
		m.text = data.text;
		m.senderName = this.getUsername(data);
		m.context = data.channel;
		m.driver = this;
		m.rawData = data;
		m.date = new Date(data.ts * 1000);

		// 起動前に届いたメッセージは無視する
		if(m.date < this.bot.launchDate){
			console.log("This message was sended before booting. Ignore.");
			return;
		}

		// 自分のメッセージは無視する
		if(m.senderName == this.bot.settings.profile.name) return;

		console.log(this.connection.getChannel(data.channel));

		// DeborahにMessageを渡す
		this.bot.receive(m);	
	}
	/**
	 * 送られてきたメッセージに返信する
	 * @param replyTo 返信先となる（送られてきた）メッセージ
	 * @param message 返信用メッセージ本文
	 */
	reply(replyTo: DeborahMessage, message: string){
		// 設定でoutputがfalseの場合、slackに送信せず標準出力に表示する
		if(this.settings.output === false){
			console.log("Disabled output:");
			console.log(replyTo);
			console.log(message);
			return;
		}
		// sendAs関数に処理を引き渡す
		this.sendAs(replyTo.context, "@"+replyTo.senderName+" "+message, this.bot.settings.profile.name, this.bot.settings.profile["slack-icon"]);
	}

	/**
	 * 指定のchannelに対し、指定の名前とアイコンを使ってメッセージを送る
	 * @param channel 送信先チャンネル
	 * @param text 送信用メッセージ本文
	 * @param name 送信用の名前（bot名）
	 * @param icon 送信用のアイコン（botアイコン）
	 */
	sendAs(channel, text, name, icon){
		var data: any = new Object();
		data.text = text;
		data.channel = channel;
		data.icon_emoji = icon;
		data.username = name;

		// APIのchat.postMessageを使ってメッセージを送信する
		this.connection.reqAPI("chat.postMessage", data);
	}

	/**
	 * メッセージ送信元のユーザ名を取得する。
	 * @param data 
	 */
	getUsername(data: any){
		// botの場合とそうでない場合で取得方法が異なる
		if(data.user === undefined) {
			// botの場合
			return data.username;
		} else {
			// bot以外の場合
			return this.connection.getUser(data.user).name;
		}
	}
	uploadSnippet(name: string, channelID: string, content: string, type: string){
		DeborahDriverSlack.Slack.files.upload({
			token: this.settings.token,
			channels: channelID,	// comma-separated
			content: content,
			filename: name,
			title: name,
			filetype: type,
		}, function(err, data){
			console.log(err);
			console.log(data);
		});
	}
}
