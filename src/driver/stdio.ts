/**
 * 標準入出力（stdio）を担当するドライバ
 */
class DeborahDriverStdIO extends DeborahDriver
{
	/** 生成元であるDeborahのインスタンス */
	bot: Deborah;
	/** readlineモジュールによる標準入出力を扱うインタフェース */
	readline: any;
	/** OpenJTalkのインスタンス */
	openjtalk: any;

	/**
	 * コンストラクタ。
	 * @param bot 生成元であるDeborahのインスタンス
	 * @param settings settings.jsonで与えられたinterfaceの設定
	 */
	constructor(bot: Deborah, settings: any){
		super(bot, settings);
		console.log("Driver initialized: StdIO");

		// OpenJTalkのインスタンスを生成しようと試みる
		var OpenJTalk = this.tryRequire('openjtalk');
		if(OpenJTalk){
			this.openjtalk = new OpenJTalk();
			this.openjtalk.talk('音声合成が有効です');
		} else{
			// OpenJTalkがサポートされていなければnull
			this.openjtalk = null;
		}

		// connect関数に処理を引き渡す
		this.connect();
	}

	/**
	 * 接続を確立する。
	 * このドライバの場合は、標準入力をlistenする。
	 */
	connect() {
		var that = this;

		// 標準入出力を扱うインタフェースを作る
		this.readline = require('readline').createInterface({
			input: process.stdin,
			output: process.stdout
		});

		// 標準入力に入力があったときの動作を定義
		this.readline.on('line', function(line) {
			// 受信したメッセージの情報をDeborahMessageに渡す
			var m = new DeborahMessage();
			m.text = line;
			m.senderName = "local";
			m.context = "StdIO";
			m.driver = that;
			m.rawData = line;
			// DeborahにMessageを渡す
			that.bot.receive(m);
		});

		// c-C（EOF）が入力されたら、本体の終了ハンドラを呼ぶ
		this.readline.on('close', function() {
			that.bot.exitHandler();
		});
	}

	/**
	 * 送られてきたメッセージに返信する
	 * @param replyTo 返信先となる（送られてきた）メッセージ
	 * @param message 返信用メッセージ本文
	 */
	reply(replyTo: DeborahMessage, message: string){
		// 標準出力に書き出す
		this.readline.write(message);
		
		// OpenJTalkが有効なら喋る
		if(this.openjtalk){
			this.openjtalk.talk(message);
		}
	}
}