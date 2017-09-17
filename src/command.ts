import {DeborahMessage} from "./message";

export class DeborahCommand {
    static commands = [
        {
            text: "スタート",
            func: function(){
                console.log("実行：スタートコマンド");
            },
            res: "スタートします。"
        },
        {
            text: "ストップ",
            func: function(){
                console.log("実行：ストップコマンド");
            },
            res: "ストップしますね。"
        }
    ];

    /**
     * 受け取ったメッセージを分析し、対応するコマンドを実行
     * @param mes 受け取ったメッセージ本文
     * @return 該当コマンドがあれば返信用本文、なければnull
     */
    static analyze(mes:DeborahMessage) :string {
        for(var i=0; i<this.commands.length; i++){
            if(this.commands[i].text === mes.analytics.kana){
                this.commands[i].func();
                return this.commands[i].res;
            }
        }
        return null;
    }
}