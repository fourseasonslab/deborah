/**
 * 標準入出力（stdio）を担当するドライバ
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const driver_1 = require("../driver");
const message_1 = require("../message");
class DeborahDriverStdIO extends driver_1.DeborahDriver {
    /**
     * コンストラクタ。
     * @param bot 生成元であるDeborahのインスタンス
     * @param settings settings.jsonで与えられたinterfaceの設定
     */
    constructor(bot, settings) {
        super(bot, settings);
        console.log("Driver initialized: StdIO");
        // OpenJTalkのインスタンスを生成しようと試みる
        var OpenJTalk = require('openjtalk');
        if (OpenJTalk) {
            this.openjtalk = new OpenJTalk();
            this.openjtalk.talk('音声合成が有効です');
        }
        else {
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
        this.readline.on('line', function (line) {
            // 受信したメッセージの情報をDeborahMessageに渡す
            var m = new message_1.DeborahMessage();
            m.text = line;
            m.senderName = "local";
            m.context = "StdIO";
            m.driver = that;
            m.rawData = line;
            // DeborahにMessageを渡す
            that.bot.receive(m);
        });
        // c-C（EOF）が入力されたら、本体の終了ハンドラを呼ぶ
        this.readline.on('close', function () {
            that.bot.exitHandler();
        });
    }
    /**
     * 送られてきたメッセージに返信する
     * @param replyTo 返信先となる（送られてきた）メッセージ
     * @param message 返信用メッセージ本文
     */
    reply(replyTo, message) {
        // 標準出力に書き出す
        this.readline.write(message);
        // OpenJTalkが有効なら喋る
        if (this.openjtalk) {
            this.openjtalk.talk(message);
        }
    }
}
exports.DeborahDriverStdIO = DeborahDriverStdIO;
