/**
 * WebAPIを担当するドライバ
 */
import {DeborahDriver} from "../driver";
import {Deborah} from "../deborah";
import {DeborahMessage} from "../message";

const fs = require('fs');
const dataurl = require('dataurl');

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
	/** listenするポート番号 */
	port: number;

	/**
	 * コンストラクタ。
	 * @param bot 生成元であるDeborahのインスタンス
	 * @param settings settings.jsonで与えられたinterfaceの設定
	 */
	constructor(bot: Deborah, settings: any){
		// 親クラスのコンストラクタを呼ぶ
		super(bot, settings);
		console.log("Driver initialized: WebAPI");
		
		// OpenJTalkのインスタンスを生成しようと試みる
		var OpenJTalk = require('openjtalk');
		if(OpenJTalk){
			this.openjtalk = new OpenJTalk();
			// this.openjtalk.talk('音声合成が有効です');
		} else {
			// OpenJTalkがサポートされていなければnull
			this.openjtalk = null;
		}
		if (settings.port){
			this.port = settings.port;
		} else {
			this.port = 3000;
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

		var app = require('express')();
		var http = require('http').Server(app);
		var io = require('socket.io').listen(http);
		io.set('log level',0);

		app.get('/', (req, res) => {
			// ディレクトリ構造を変更した際は必ずここも変更を忘れないこと
			res.sendFile(__dirname.replace(/\/js\/driver$/g,"/web") + '/index.html');
		});

		app.get('/client.js', (req, res) => {
			// ディレクトリ構造を変更した際は必ずここも変更を忘れないこと
			res.sendFile(__dirname.replace(/\/js\/driver$/g,"/web") + '/client.js');
		});

		app.get('/styles.css', (req, res) => {
			// ディレクトリ構造を変更した際は必ずここも変更を忘れないこと
			res.sendFile(__dirname.replace(/\/js\/driver$/g,"/web") + '/styles.css');
		});

		io.on('connection', (socket) => {
			console.log("connection established: " + socket.id);
			// socketに入力があったときの動作
			socket.on('input', (data) => {
				// 受信したメッセージの情報をDeborahMessageに渡す
				var m = new DeborahMessage();
				m.text = data.text;
				m.senderName = "unknown";
				m.context = socket.id;
				m.driver = that;
				m.rawData = socket;
				
				// DeborahにMessageを渡す
				this.bot.receive(m);
			});
		});
		http.listen(this.port, () => {
			console.log('listening on *:' + this.port);
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
		this.openjtalk._makeWav(text, this.openjtalk.pitch, (err, res) => {
			// 生成されたwavファイルを読み込む
			fs.readFile(res.wav, function(err, data){
				// 合成音声のDataURLを生成する
				var url = dataurl.convert({
					data: data,
					mimetype: 'audio/wav'
				});
				//console.log(url);
				// 生成したDataURLを渡してコールバック
				f(url);
				// 使用済みのwavファイルを削除
				fs.unlink(res.wav, function (err) {
					if (err) console.log('unlink failed');
				});
			});
		});
	}
}
