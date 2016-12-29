var DeborahMessage = (function () {
    function DeborahMessage() {
    }
    return DeborahMessage;
}());
var DeborahDriverSlack = (function () {
    function DeborahDriverSlack(bot, setting) {
        console.log("Driver initialized: Slack (" + setting.team + ")");
        this.bot = bot;
        this.setting = setting;
        var slackAPI = require('slackbotapi');
        this.connection = new slackAPI({
            'token': this.setting.token,
            'logging': false,
            'autoReconnect': true
        });
        this.connect();
    }
    DeborahDriverSlack.prototype.connect = function () {
        var that = this;
        this.connection.on('message', function (data) {
            // receive
            console.log(JSON.stringify(data, null, " "));
            if (!data || !data.text)
                return;
            var m = new DeborahMessage();
            m.text = data.text;
            m.senderName = that.getUsername(data);
            m.context = data.channel;
            m.driver = that;
            m.rawData = data;
            //
            if (m.senderName == that.bot.settings.profile.name)
                return;
            //
            //
            that.bot.receive(m);
        });
    };
    DeborahDriverSlack.prototype.replyAsBot = function (received, message) {
        this.sendAs(received.context, message, this.bot.settings.name, this.bot.settings.icon);
    };
    DeborahDriverSlack.prototype.sendAs = function (channel, text, name, icon) {
        var data = new Object();
        data.text = text;
        data.channel = channel;
        data.icon_emoji = icon;
        data.username = name;
        this.connection.reqAPI("chat.postMessage", data);
    };
    DeborahDriverSlack.prototype.getUsername = function (data) {
        // botの場合
        if (data.user === undefined) {
            return data.username;
        }
        else {
            return this.connection.getUser(data.user).name;
        }
    };
    return DeborahDriverSlack;
}());
var Deborah = (function () {
    function Deborah() {
        this.driverList = [];
        console.log("Initializing deborah...");
        var fs = require("fs");
        this.settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
        console.log(JSON.stringify(this.settings, null, 1));
        var MeCab = require('mecab-lite');
        this.mecab = new MeCab();
        var reader = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        // 標準入力を受け取ったら
        reader.on('line', function (line) {
            // コマンド実行
            /*
            for(var i of settings.channels){
                doCommands(line,settings.name,i);
            }
            */
        });
        // c-C（EOF）が入力されたら
        reader.on('close', function () {
            // 別れの挨拶
            console.log("Terminating...");
            //sendAsBot(settings.channels[0],"Bye!",function (){
            process.exit(0);
            //});
        });
    }
    Deborah.prototype.start = function () {
        var interfaces = this.settings.interfaces;
        if (!(interfaces instanceof Array)) {
            console.log("settings.interfaces is not an Array.");
            process.exit(0);
        }
        for (var i = 0; i < interfaces.length; i++) {
            var iset = interfaces[i];
            if (iset.type == "slack-connection") {
                this.driverList.push(new DeborahDriverSlack(this, iset));
            }
        }
    };
    Deborah.prototype.receive = function (data) {
        // メッセージが空なら帰る
        /*
        // helloイベント（自分の起動）が発生したとき
        slack.on('hello', function (data){
            // settings.channelsをユニークなIDに変換する
            for (var i = 0; i<settings.channels.length; i++){
                var chname = settings.channels[i].substr(1, settings.channels[i].length-1).toLowerCase();
                switch (settings.channels[i].charAt(0)){
                    // 指定先がChannel(public)の場合
                    case "#":
                        settings.channels[i] = slack.getChannel(chname).id;
                        break;
                    
                    // 指定先がUserの場合
                    case "@":
                        settings.channels[i] = slack.getIM(chname).id;
                        break;
        
                    // 指定先がGroup(private)の場合
                    case "%":
                        settings.channels[i] = slack.getGroup(chname).id;
                        break;
        
                    // その他
                    default:
                }
            }
            // ごあいさつ
            for(var k of settings.channels){
                sendAsBot(k,"Hi! I'm here now!");
            }
        });
        
        */
        // 特定の文字列〔例：:fish_cake:（なるとの絵文字）〕を含むメッセージに反応する
        if (data.text.match(/:fish_cake:/)) {
        }
        // %から始まる文字列をコマンドとして認識する
        this.doCommand(data);
    };
    Deborah.prototype.doCommand = function (data) {
        // %から始まる文字列をコマンドとして認識する
        if (data.text.charAt(0) !== '%')
            return;
        var command = data.text.substring(1).split(' ');
        // コマンドの種類により異なる動作を選択
        switch (command[0].toLowerCase()) {
            // %hello
            // 挨拶します
            case 'hello':
                //this.driver.replyAsBot(data, 'Oh, hello @' + data.name + ' !');
                break;
            // %say str
            // 指定の文字列を喋ります
            case 'say':
                var str = data.text.split('%say ')[1];
                //this.driver.replyAsBot(data, str);
                break;
            // %mecab str
            // mecabに指定の文字列を渡して分かち書きの結果を返します
            case 'mecab':
                var str = data.text.split('%mecab ')[1];
                var that = this;
                this.mecab.parse(str, function (err, result) {
                    var ans = "@" + data.senderName + " ";
                    for (var i = 0; i < result.length - 1; i++) {
                        ans += result[i][0] + "/";
                    }
                    //that.driver.replyAsBot(data, ans);
                });
                break;
            // %debug
            // デバッグ用コマンド。
            case 'debug':
                switch (command[1]) {
                    case 'slackData':
                        console.log(data.rawData);
                        //else console.log(slack.slackData[command[2]]);
                        break;
                    case 'cur':
                        console.log(data);
                        break;
                }
                break;
        }
    };
    return Deborah;
}());
var deborah = new Deborah();
deborah.start();
