/**
 * ドライバの抽象クラス。
 */
abstract class DeborahDriver
{
	/** 生成元であるDeborahのインスタンス */
	bot: Deborah;
	/** settings.jsonで与えられたinterfaceの内容 */
	settings: any;

	/**
	 * コンストラクタ。
	 * @param bot 生成元であるDeborahのインスタンス
	 * @param settings settings.jsonで与えられたinterfaceの内容
	 */
	constructor(bot: Deborah, settings: any){
		this.bot = bot;
		this.settings = settings;
	}

	/**
	 * 送られてきたメッセージに返信する
	 * @param replyTo 返信先となる（送られてきた）メッセージ
	 * @param message 返信用メッセージ本文
	 */
	abstract reply(replyTo: DeborahMessage, message: string) : void;

	/**
	 * 外部モジュールの読み込みを行う。
	 * try-catchのエラー処理を代行する。
	 * @param path 読み込みたいモジュール名
	 */
	protected tryRequire(path: string) : any {
		try {
			return require(path);
		} catch(e) {
			console.log("DeborahDriver needs '" + path + "'.\n Please run 'sudo npm install -g " + path + "'");
		}
		return null;
	}
}