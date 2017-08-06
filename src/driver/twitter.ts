/**
 * Twitterを担当するドライバ
 */
class DeborahDriverTwitter extends DeborahDriver
{
	/** 生成元であるDeborahのインスタンス */
	bot: Deborah;
	/** settings.jsonで与えられたinterfaceの設定 */
	settings: any;
	/** Twitterのインスタンス */
	client: any;

	/**
	 * コンストラクタ。
	 * @param bot 生成元であるDeborahのインスタンス
	 * @param settings settings.jsonで与えられたinterfaceの設定
	 */
	constructor(bot: Deborah, settings: any){
		// 親クラスのコンストラクタを呼ぶ
		super(bot, settings);
		console.log("Driver initialized: Twitter");

		// =============== 変数初期化 ===============
		var Twitter = require('twitter');
		this.client = new Twitter({
			consumer_key: settings.consumer_key,
			consumer_secret: settings.consumer_secret,
			access_token_key: settings.access_token_key,
			access_token_secret: settings.access_token_secret
		});

		// connect関数に処理を引き渡す
		this.connect();
	}
	/**
	 * 接続を確立する。ユーザータイムラインを監視する。
	 */
	connect(){
		var that = this;
		this.client.stream('user', function(stream) {
			stream.on('data', function(data) {
				/** screen_name （@username なら 「username」） */
				var id        = ('user' in data && 'screen_name' in data.user) ? data.user.screen_name : null;
				/** 自分への@リプライを取り除いた、届いたメッセージの本文 */
				var text      = ('text' in data) ? data.text.replace(new RegExp('^@' + that.settings.screen_name + ' '), '') : '';
				/** 届いたメッセージがリプライであるか */
				var isMention = ('in_reply_to_user_id' in data) ? (data.in_reply_to_user_id !== null) : false;
				/** 届いたメッセージが自分へのリプライであるか */
				var isMentionToMe = isMention && (data.in_reply_to_screen_name === that.settings.screen_name);

				console.log(data);

				// 自分へのリプライで、かつ送信者が自分でないもののみをreceiveする
				if (!isMentionToMe || id == that.settings.screen_name) return;

				// 受信したメッセージの情報をDeborahMessageに渡す
				var m = new DeborahMessage();
				m.text = text;
				m.senderName = id;
				m.context = "Twitter";
				m.driver = that;
				m.rawData = data;

				// DeborahにMessageを渡す
				that.bot.receive(m);
			});
		});
	}
	
	/**
	 * 送られてきたメッセージに返信する
	 * @param replyTo 返信先となる（送られてきた）メッセージ
	 * @param message 返信用メッセージ本文
	 */
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