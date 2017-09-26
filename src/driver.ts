/**
 * ドライバの抽象クラス。
 */
import {Deborah} from "./deborah";
import {DeborahMessage} from "./message";

export class DeborahDriver
{
	/** 生成元であるDeborahのインスタンス */
	bot: Deborah;
	/** settings.jsonで与えられたinterfaceの内容 */
	settings: any;

	/**
	 * コンストラクタ。
	 * @param bot 生成元であるDeborahのインスタンス
	 * @param settings settings.jsonで与えられたinterfaceの設定
	 */
	constructor(bot: Deborah, settings: any)
	{
		this.bot = bot;
		this.settings = settings;
	}

	/**
	 * 送られてきたメッセージに返信する
	 * @param replyTo 返信先となる（送られてきた）メッセージ
	 * @param message 返信用メッセージ本文
	 */
	reply(replyTo: DeborahMessage, message: string) : void
	{

	}
}
