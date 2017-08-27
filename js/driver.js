"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeborahDriver {
    /**
     * コンストラクタ。
     * @param bot 生成元であるDeborahのインスタンス
     * @param settings settings.jsonで与えられたinterfaceの設定
     */
    constructor(bot, settings) {
        this.bot = bot;
        this.settings = settings;
    }
    /**
     * 送られてきたメッセージに返信する
     * @param replyTo 返信先となる（送られてきた）メッセージ
     * @param message 返信用メッセージ本文
     */
    reply(replyTo, message) {
    }
}
exports.DeborahDriver = DeborahDriver;
