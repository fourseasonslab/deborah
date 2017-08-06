/**
 * slackBOTを担当するドライバ
 */
class DeborahDriverSlack extends DeborahDriver
{
	/** 生成元であるDeborahのインスタンス */
	bot: Deborah;
	/** settings.jsonで与えられたinterfaceの設定 */
	settings: any;
	/** slackAPIのインスタンス */
	connection: any;
	
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
		var slackAPI = require('slackbotapi');
		this.connection = new slackAPI({
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
			// 受信した
			console.log(JSON.stringify(data, null, " "));

			// データか中身のテキストが空なら帰る
			if(!data || !data.text) return;
			// 他のbotからのメッセージは無視する（無限ループ防止）
			if("subtype" in data && data.subtype === "bot_message") return;
			
			// 受信したメッセージの情報をDeborahMessageに渡す
			var m = new DeborahMessage();
			m.text = data.text;
			m.senderName = that.getUsername(data);
			m.context = data.channel;
			m.driver = that;
			m.rawData = data;
			m.date = new Date(data.ts * 1000);

			// 起動前に届いたメッセージは無視する
			if(m.date < that.bot.launchDate){
				console.log("This message was sended before booting. Ignore.");
				return;
			}

			// 自分のメッセージは無視する
			if(m.senderName == that.bot.settings.profile.name) return;

			// DeborahにMessageを渡す
			that.bot.receive(m);
		});
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
}