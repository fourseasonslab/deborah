/**
 * WebAPIを担当するドライバ
 */
import {DeborahDriver} from "../driver";
import {Deborah} from "../deborah";
import {DeborahMessage} from "../message";

export class DeborahDriverWebAPI extends DeborahDriver
{
	/** 生成元であるDeborahのインスタンス */
	bot: Deborah;
	/** settings.jsonで与えられたinterfaceの設定 */
	settings: any;
	/** サーバー */
	httpServer: any;
	/** 入出力先 */
	io: any;
	/** OpenJTalkのインスタンス */
	openjtalk: any;
	/** Require: DataURL */
	dataurl: any;
	/** Require: fs */
	fs: any;

	/**
	 * コンストラクタ。
	 * @param bot 生成元であるDeborahのインスタンス
	 * @param settings settings.jsonで与えられたinterfaceの設定
	 */
	constructor(bot: Deborah, settings: any){
		// 親クラスのコンストラクタを呼ぶ
		super(bot, settings);
		console.log("Driver initialized: WebAPI");
		
		// =============== 変数初期化 ===============
		this.fs = require('fs');
		this.dataurl = require('dataurl');
		var http = require('http');
		this.httpServer = http.createServer();
		var Sock = require('socket.io');
		this.io = Sock.listen(this.httpServer);
		
		// OpenJTalkのインスタンスを生成しようと試みる
		var OpenJTalk = require('openjtalk');
		if(OpenJTalk){
			this.openjtalk = new OpenJTalk();
			//this.openjtalk.talk('音声合成が有効です');
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
		/** listenするポート番号 */
		var port = 3000;

		var app = require('express')();
		var http = require('http').Server(app);
		var io = require('socket.io')(http);

		app.get('/', (req, res) => {
			res.sendFile(__dirname + '/index.html');
		});

		io.on('connection', (socket) => {
			console.log("connection established");
			//console.log(client);
			// socketに入力があったときの動作
			socket.on('input', (data) => {
				console.log("recv input:");
				console.log(data);

				// 受信したメッセージの情報をDeborahMessageに渡す
				var m = new DeborahMessage();
				m.text = data.text;
				m.senderName = "unknown";
				m.context = socket;
				m.driver = this;
				m.rawData = socket;
				
				// DeborahにMessageを渡す
				this.bot.receive(m);
			});
		});
		http.listen(port, () => {
			console.log('listening on *:' + port);
		});
	}

	/**
	 * 送られてきたメッセージに返信する
	 * @param replyTo 返信先となる（送られてきた）メッセージ
	 * @param message 返信用メッセージ本文
	 */
	reply(replyTo: DeborahMessage, message: string){
		// messageから音声のDataURLを生成してコールバック
		this.createVoiceURL(message, function(url: string){
			console.log("webapi: reply: " + message);

			// メッセージのテキストと音声URLをオブジェクトにまとめる
			var m = {
				text: message,
				voiceURL: url,
			};
			
			// socketに対してreplyを発行
			replyTo.rawData.emit("reply", m);
		});
	}

	/**
	 * テキストを受けて、合成した音声のDataURLを生成してコールバック
	 * @param text 合成元テキスト
	 * @param f コールバック関数
	 */
	createVoiceURL(text: string, f: (url: string) => void){
		var that = this;
		this.openjtalk._makeWav(text, this.openjtalk.pitch, function(err, res){
			console.log(res);
			// 生成されたwavファイルを読み込む
			that.fs.readFile(res.wav, function(err, data){
				// 合成音声のDataURLを生成する
				var url = that.dataurl.convert({
					data: data,
					mimetype: 'audio/wav'
				});
				//console.log(url);
				// 生成したDataURLを渡してコールバック
				f(url);
				// 使用済みのwavファイルを削除
				that.fs.unlink(res.wav, function (err) {
					if (err) console.log('unlink failed');
				});
			});
		});
	}
}
