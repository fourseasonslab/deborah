/**
 * chatbotの本体となるクラス。
 */

import {DeborahDriver} from "./driver";
import {DeborahDriverLineApp} from "./driver/lineapp";
import {DeborahDriverSlack} from "./driver/slack";
import {DeborahDriverStdIO} from "./driver/stdio";
import {DeborahDriverTwitter} from "./driver/twitter";
import {DeborahDriverWebAPI} from "./driver/webapi";
import {DeborahMessage} from "./message";
import {DeborahMemory} from "./memory";
import {DeborahMarkovDictionary} from "./dictionary"
import {DeborahResponder} from "./responder";
import {DeborahResponderWord2Vec} from "./responder/word2vec";
import {DeborahResponderMichiru} from "./responder/michiru";
import {DeborahResponderMarkov} from "./responder/markov-bot";
import {DeborahCommand} from "./command";
import {DeborahResponderEcho} from "./responder/echo";

export class Deborah
{
	// =============== 変数宣言 ===============
	/** 利用可能なDriver */
	driverList: DeborahDriver[] = [];
	/** 利用可能なResponder */
	responderList: DeborahResponder[] = [];
	/** settings.jsonの内容 */
	settings: any;
	/** 現在のDeborahMemory */
	memory: DeborahMemory;
	/** マルコフ連鎖に用いる辞書 */
	markov: DeborahMarkovDictionary;
	/** MeCabのインスタンス */
	mecab: any;
	/** Cabochaのインスタンス */
	//cabochaf0: any;
	cabochaf1: any;
	/** 起動時刻 */
	launchDate: Date;
	// /** 起動時に入ってくるメッセージを無視する時間[ms]（no longer used?） */
	// initialIgnorePeriod: number = 5000;
	// /** 定型文での返答パターン（no longer used?） */
	// fixedResponseList: (string[])[] = [
	// 	[":fish_cake:", "やっぱなるとだよね！ :fish_cake:"],
	// 	["むり", "まあまあ。:zabuton: 一休みですよ！ :sleeping:"],
	// 	["死", "まだ死ぬには早いですよ！ :iconv:"],
	// 	["test","test"]
	// ];

	/**
	 * コンストラクタ。各種変数の初期化を担当。
	 */
	constructor(){
		console.log("Initializing deborah...");
		
		// =============== Cabocha ===============
		var Cabocha = require('node-cabocha');
		try{
			this.cabochaf1 = new Cabocha();
		} catch(e){
			console.error(e);
		}
		
		// =============== Load Settings ===============
		var fs = require("fs");
		let fval, fname = "settings.json";
		try {
			fval = fs.readFileSync('settings.json');
		} catch(e) {
			console.log("settings.json not found.\nimporting settings from environmental variable...");
			fval = process.env.DEBORAH_CONFIG;
		}
		if (!fval) {
			console.log("Error: cannot load settings.");
			process.exit(1);
		}
		this.settings = JSON.parse(fval);

		// =============== others ===============
		this.launchDate = new Date();
		//console.log(JSON.stringify(this.settings, null, 1));
		this.memory = new DeborahMemory("memory.json");
		//this.markov = new DeborahMarkovDictionary("nextWordsDic.json", "prevWordsDic.json");
		this.markov = new DeborahMarkovDictionary("src/nextWordsDic_wiki.json", "src/prevWordsDic_wiki.json");
		var MeCab = require('mecab-lite');
		this.mecab = new MeCab();
		//this.responderList.push(new DeborahResponderEcho(this));
		//this.responderList.push(new DeborahResponder(this));
		//this.responderList.push(new DeborahResponderCabocha(this));
		//this.responderList.push(new DeborahResponderKano(this));
		//this.responderList.push(new DeborahResponderWord2Vec(this));
		//this.responderList.push(new DeborahResponderMeCab(this));
		//this.responderList.push(new DeborahResponderMemory(this));
		//this.responderList.push(new DeborahResponderMichiru(this));
		this.responderList.push(new DeborahResponderMarkov(this));
	}

	/**
	 * 起動時に呼ばれる関数。Driver関係の処理を行う。
	 */
	start(){
		// =============== Load Settings ===============
		var interfaces = this.settings.interfaces;
		if (!(interfaces instanceof Array)) {
			console.log("settings.interfaces is not an Array.");
			process.exit(0);
		}

		// Settingsのinterfacesに対応するDriverをDriverListに追加
		for (var i = 0; i < interfaces.length; i++) {
			try{
				var iset = interfaces[i];
				switch (iset.type) {
					case 'slack-connection':
						this.driverList.push(new DeborahDriverSlack(this, iset));
						break;
					case 'stdio':
						this.driverList.push(new DeborahDriverStdIO(this, iset));
						break;
					case 'twitter':
						this.driverList.push(new DeborahDriverTwitter(this, iset));
						break;
					case 'line':
						this.driverList.push(new DeborahDriverLineApp(this, iset));
						break;
					case 'webapi':
						this.driverList.push(new DeborahDriverWebAPI(this, iset));
						break;
				}
			} catch(e){
				console.log("Failed to load Driver: " + iset.type);
				console.log(e);
			}
		}
	}

	/**
	 * メッセージを受け取った場合の動作。
	 * @param data 受け取ったメッセージ
	 */
	receive(data: DeborahMessage){
		try {
			console.log("Deborah.receive: [" + data.text + "] in "+ data.context);

			// 記憶に追加
			this.memory.appendReceiveHistory(data);

			// マルコフ連鎖の辞書に追加
			this.markov.addWordsToDic(data.text);

			// この下4行はanalyzeに食べさせた結果を使うresponders用
			var that = this;
			data.analyze(function(data2: DeborahMessage){
				// 該当するコマンドがあればそれに即した行動・返答をして終了
				var result:string = DeborahCommand.analyze(data2);
				if(result!==null){
					data.driver.reply(data, result);
					return;
				}
				if(that.responderList.length > 0){
					// ランダムにresponderを選択して、それに処理を引き渡す。
					var idx = Math.floor(Math.random() * that.responderList.length);
					console.log("Responder: " + that.responderList[idx].name);
					that.responderList[idx].generateResponse(data);
				} else {
					console.log("No responder available.");
				}
			});

			// %から始まる文字列をコマンドとして認識する
			this.doCommand(data);
		} catch(e) {
			console.log("内部エラーが発生しました。\nメッセージ: " + e);
		}
	}
	/**
	 * <p>%から始まる文字列をコマンドとして認識して対応する処理を行う<br>
	 * 現在実装済みのコマンドは以下の通り。</p>
	 * <ul>
	 * 	<li>%date : 起動時刻を返します</li>
	 * 	<li>%uptime : 起動からの経過時間[ms]を返します</li>
	 *	<li>%hello : 挨拶します</li>
	 * 	<li>%say:  指定の文字列を喋ります</li>
	 * 	<li>%mecab str : mecabに文字列strを渡して分かち書きの結果を返します</li>
	 * 	<li>%debug : デバッグ用コマンド。</li>
	 * 	<li>%history : 最古のものから最大count個のsenderからのメッセージを表示します</li>
	 * </ul>
	 * @param data 受け取ったメッセージ
	 */
	doCommand(data: DeborahMessage){
		// %から始まる文字列でなければ帰る
		if (data.text.charAt(0) !== '%') return;
		/** 「%」を除いて空白文字で分割 */
		var args = data.text.substring(1).split(' ');
		/** コマンドの種類 */
		var command = args[0];

		// コマンドの種類により異なる動作を選択
		switch (command.toLowerCase()) {
			case 'date':
				// %date
				// 起動時刻を返します
				data.driver.reply(data, "起動時刻は" + this.launchDate + "です。");
				break;
			case 'uptime':
				// %uptime
				// 起動からの経過時間[ms]を返します
				data.driver.reply(data, "起動してから" + (Date.now() - this.launchDate.getTime()) + "ms経過しました。");
				break;
			case 'hello':
				// %hello
				// 挨拶します
				data.driver.reply(data, 'Oh, hello ' + data.senderName + ' !');
				break;
			case 'say':
				// %say str
				// 指定の文字列を喋ります
				var str = data.text.split('%say ')[1];
				data.driver.reply(data, str);
				break;
			case 'mecab':
				// %mecab str
				// mecabに文字列strを渡して分かち書きの結果を返します
				var str = data.text.split('%mecab ')[1];
				this.mecab.parse(str, function(err, result) {
					var ans = "";
					if (result) {
						for(var i=0;i<result.length-1;i++){
							ans += result[i][0] + "/";
						}
					} else {
						ans = "ごめんなさい、このサーバーはmecabには対応していません";
					}
					data.driver.reply(data, ans);
				});
				break;
			case 'debug':
				// %debug
				// デバッグ用コマンド。
				switch (args[1]){
					// 受け取った生データを表示
					case 'rawData':
						console.log(data.rawData);
						break;
					// 受け取ったメッセージを表示
					case 'curData':
						console.log(data);
						break;
				}
				break;
			case 'history':
				// %history count sender
				// 最古のものから最大count個のsenderからのメッセージを表示する
				var count = Number(args[1]);
				var sender = args[2];
				var list = this.memory.getRecentConversation(count, sender);
				data.driver.reply(data, count + ":" + sender + "\n```\n" + JSON.stringify(list, null, " ") + "\n```\n");
				break;
		}
	}

	/**
	 * 終了ハンドラ。プログラムの終了時に実行される。具体的にはmemoryとマルコフ連鎖の辞書をファイルに保存する
	 */
	exitHandler(){
		this.memory.saveToFile();
		this.markov.saveToFile();
		console.log("EXIT!!!!!!!");
		process.exit();
	}
}

// ここでDeborahのインスタンスを作り、start関数を呼んで動作を開始させる。
var deborah = new Deborah();
deborah.start();
