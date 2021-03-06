/**
 * slackBOTを担当するドライバ
 */

import {DeborahDriver} from "../driver";
import {Deborah} from "../deborah";
import {DeborahMessage} from "../message";

interface JSONData
{
	[name: string]: JSONData|number|string|boolean| JSONData[];
}

interface SlackToken
{
}

interface Slack
{
	channels: SlackChannels;
	files: SlackFiles;
	rtm: SlackRtm;
	team: SlackTeam;
}

interface SlackChannels
{
	list(token: SlackToken, callback: (err: JSONData, data: JSONData) => any);
}

interface SlackFiles
{
	upload(params: SlackFilesUploadParams, callback: (err: JSONData, data: JSONData) => any);
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

interface SlackRtm
{
	client(): SlackClient;
	connect(token: SlackToken, callback: (err: JSONData, data: JSONData) => any);
	start(token: SlackToken, callback: (err: JSONData, data: JSONData) => any);
}

interface SlackClient
{
	listen(token: SlackToken);
	message(callback: (data: JSONData) => any);
	hello(callback: (data: JSONData) => any);
}

interface SlackTeam
{
	info(params: SlackFilesUploadParams, callback: (err: JSONData, data: SlackTeamInfoResponse) => any);
}

interface SlackTeamInfoResponse
{
	ok: boolean;
	team: SlackTeamInfo;
}

interface SlackTeamInfo
{
	id: string;
	name: string;
	domain: string;
	email_domain: string;
	icon: JSONData;
}

interface SlackMessageData
{
	type: string;
	channel: string;
	user: string;
	text: string;
	ts: string;
	subtype?: string;
}

//
//
//

class DeborahMessageSlack extends DeborahMessage
{
	constructor(data: SlackMessageData, driver: DeborahDriverSlack){
		super();
		this.text = data.text;
		this.senderName = driver.getUsername(data);
		this.context = data.channel + "@" + driver.teamInfo.id;
		this.driver = driver;
		this.rawData = data;
		this.date = new Date(parseFloat(data.ts) * 1000);
	}
	getChannelID(): string
	{
		return DeborahMessageSlack.contextToChannelID(this.context);
	}
	static contextToChannelID(context: string) : string
	{
		return context.split("@")[0];
	}
}

export class DeborahDriverSlack extends DeborahDriver
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
	teamInfo: SlackTeamInfo; 
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
		DeborahDriverSlack.Slack.team.info({token: this.settings.token}, 
			(err, data) => {
				if(data && data.ok === true){
					this.teamInfo = data.team;
					console.log("Slack.team.info: " + this.teamInfo.domain);
				} else{
					console.error("FAILED: Slack.team.info");
				}
			}
		);
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
				if(k[0] == "#"){
					// channel name
					k = k.substr(1);
					var c = this.connection.getChannel(k);
					if(c){
						console.log("\t" + k + " (" + c.id + ")");
						this.channelIDList.push(c.id);
					} else{
						console.log("\t" + k + " (Not found)");
					}
				} else{
					// channel id
					console.log("\t" + k + " (" + k + ")");
					this.channelIDList.push(k);
				}
			}
		}
	}
	receive(data: SlackMessageData){
		// 受信した
		//console.log(JSON.stringify(data, null, " "));
		{
			var fs = require('fs');
			fs.appendFile("slack_message_log.txt", 
				JSON.stringify(data, null, " "), 
				(err) => { if(err) console.log("fs failed."); });
		}
		// data.channel: string			channel ID

		// データか中身のテキストが空なら帰る
		if(!data || !data.text) return;

		// 他のbotからのメッセージは無視する（無限ループ防止）
		if("subtype" in data && data.subtype === "bot_message") return;

		// 指定されたチャンネル以外のメッセージは破棄する
		if(this.channelIDList.indexOf(data.channel) < 0){
			console.log("Channel not in the list (" + data.channel + "). Ignore.");
			return;
		}

		// 受信したメッセージの情報をもとにDeborahMessageを作成
		var m = new DeborahMessageSlack(data, this);

		// 起動前に届いたメッセージは無視する
		if(m.date < this.bot.launchDate){
			console.log("This message was sended before booting. Ignore.");
			return;
		}

		// 自分のメッセージは無視する
		if(m.senderName == this.bot.settings.profile.name) return;

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
		var m: DeborahMessageSlack = <DeborahMessageSlack> replyTo;
		
		//typing indicator
		var {RTMClient} = require('@slack/client');
		var rtm = new RTMClient(this.settings.token);
		rtm.start();
		rtm.sendTyping(m.getChannelID());
		setTimeout(() => {
			rtm.sendMessage("@"+replyTo.senderName+" "+message, m.getChannelID());
		},4500);
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
	uploadSnippet(context: string, name: string, content: string, type: string){
		DeborahDriverSlack.Slack.files.upload({
			token: this.settings.token,
			channels: DeborahMessageSlack.contextToChannelID(context),
			content: content,
			filename: name,
			title: name,
			filetype: type,
		}, function(err, data){
			if(err) console.error(err);
			/*
			console.log(data);
			 */
		});
	}
}
