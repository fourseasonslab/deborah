class DeborahDriverLineApp extends DeborahDriver
{
	// =============== 変数宣言 ===============
	/** Require:LINEbotAPI */
	line: any;
	/** Require:express */
	express: any;
	/** Require:bodyParser */
	bodyParser: any;
	/** line.client */
	lineClient: any;
	/** line.validator */
	lineValidator: any;
	/** expressのapp */
	app: any;

	/** 状態 */
	stat: number = 0;
	/** 返信先のメッセージ */
	replyTo: DeborahMessage = null;
	/** 返信用メッセージ本文 */
	message: string = null;

	/** 生成元であるDeborahのインスタンス */
	bot: Deborah;
	/** settings.jsonで与えられたinterfaceの内容 */
	settings: any;

	/**
	 * コンストラクタ。
	 * @param bot 生成元であるDeborahのインスタンス
	 * @param settings settings.jsonで与えられたinterfaceの内容
	 */
	constructor(bot: Deborah, settings: any) {
		// 親クラスのコンストラクタを呼ぶ
		super(bot, settings);

		// =============== 変数初期化 ===============
		this.line    = this.tryRequire('node-line-bot-api');
		this.express = this.tryRequire('express');
		this.app = this.express();
		this.bodyParser = this.tryRequire('body-parser');
		this.lineClient = this.line.client;
		this.lineValidator = this.line.validator;

		// Validatorによる送信元の検証にrawBodyが必要
		this.app.use(this.bodyParser.json({
			verify: function (req, res, buf) {
				req.rawBody = buf;
			}
		}));

		// LINEbotAPIを指定のトークン値で初期化する
		this.line.init({
			accessToken: process.env.LINE_TOKEN || this.settings.accessToken,
			channelSecret: process.env.LINE_SECRET || this.settings.channelSecret
		});

		// "/webhook/"に対するPOST要求への応答を定義する。
		// まずValidatorが送信元を検証した後、以下のコールバック関数が呼ばれる。
		let that = this;
		this.app.post('/webhook/', 
			this.line.validator.validateSignature(), 
			function(req, res, next){
				// /** Promiseオブジェクトの配列（no longer used） */
				// const promises: Promise<any>[] = [];
				/** エラー回数 */
				let errorCount: number = 0;
				// 要求のbodyにあるeventsそれぞれについて実行
				req.body.events.map(function(event){
					console.log(event.source.userId);
					
					// メッセージが空なら帰る
					if (!event.message.text) return;

					// イベントを投げたユーザーの情報を取得する
					that.line.client.getProfile(event.source.userId).then((profile)=>{
						// 受信したメッセージの情報をDeborahMessageに渡す
						var m = new DeborahMessage();
						m.text = event.message.text;
						m.senderName = profile.displayName;
						m.context = "main";
						m.driver = that;
						m.rawData = null;

						that.stat = 1; // 状態1（Responder待ち）に遷移
						that.message = ""; // 返信用メッセージを空に
						that.bot.receive(m); // DeborahにMessageを渡す

						// 状態2（返信準備OK）であれば
						if (that.stat == 2) {
							// promises.push(that.line.client.replyMessage({
							// 返信する
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
						// 状態0（初期状態）に戻る
						that.stat = 0;
					},
						// イベントを投げたユーザーの情報の取得に失敗した場合
						()=>{ errorCount++; }
					);
				});
				// Promise.all(promises).then(function(){res.json({success: true})});
				// 1度もエラーになっていなければ（catchが呼ばれなければ）成功
				if (!errorCount) res.json({success: true});
			}
		);

		// connect関数に処理を引き渡す
		this.connect();
	}

	/**
	 * 接続を確立する。
	 * 指定のポート（デフォルトでは3000番）で接続を待つ。
	 */
	connect() {
		let port = process.env.PORT || 3000;
		this.app.listen(port, function(){
			console.log('Example app listening on port ' + port + '!')
		});
	}

	/**
	 * 送られてきたメッセージに返信する
	 * @param replyTo 返信先となる（送られてきた）メッセージ
	 * @param message 返信用メッセージ本文
	 */
	reply(replyTo: DeborahMessage, message: string){
		// 状態1（Responder待ち）であれば
		if (this.stat == 1) {
			// 返信を作成
			this.replyTo = replyTo;
			this.message += (this.message ? "\n" : "") +  message;
			// 状態2（返信準備OK）に遷移
			this.stat = 2;
		} 
	}
}