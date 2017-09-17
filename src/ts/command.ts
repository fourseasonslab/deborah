class DeborahCommand {
    static commands = [
        {
            text: "コマンド",
            func: function(){
                console.log("コマンドが実行されました");
            } 
        }
    ];

    /**
     * 受け取ったメッセージを分析し、対応するコマンドを実行
     * @param mes 受け取ったメッセージ本文
     * @return 該当コマンドがあればtrue
     */
    static analyze(mes : string) : boolean{
        for(var i=0; i<this.commands.length; i++){
            if(this.commands[i].text === mes){
                this.commands[i].func();
                return true;
            }
        }
        return false;
    }
}