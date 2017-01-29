var DeborahMessage = (function () {
    function DeborahMessage() {
    }
    return DeborahMessage;
}());
var DeborahDriverSlack = (function () {
    function DeborahDriverSlack(bot, settings) {
        console.log("Driver initialized: Slack (" + settings.team + ")");
        this.bot = bot;
        this.connectionSettings = settings;
        var slackAPI = require('slackbotapi');
        this.connection = new slackAPI({
            'token': this.connectionSettings.token,
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
    DeborahDriverSlack.prototype.reply = function (replyTo, message) {
        this.sendAs(replyTo.context, message, this.bot.settings.profile.name, this.bot.settings.profile["slack-icon"]);
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
var DeborahDriverStdIO = (function () {
    function DeborahDriverStdIO(bot, setting) {
        console.log("Driver initialized: StdIO");
        this.bot = bot;
        // 標準入力をlisten
        var that = this;
        this.readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.readline.on('line', function (line) {
            var m = new DeborahMessage();
            m.text = line;
            m.senderName = "local";
            m.context = "StdIO";
            m.driver = that;
            m.rawData = line;
            //
            that.bot.receive(m);
        });
        // c-C（EOF）が入力されたら
        this.readline.on('close', function () {
            // 別れの挨拶
            console.log("Terminating...");
            //sendAsBot(settings.channels[0],"Bye!",function (){
            process.exit(0);
            //});
        });
    }
    DeborahDriverStdIO.prototype.reply = function (replyTo, message) {
        this.readline.write(message);
    };
    return DeborahDriverStdIO;
}());
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
var Deborah = (function () {
    function Deborah() {
        this.driverList = [];
        this.fixedResponseList = [
            [":fish_cake:", "やっぱなるとだよね！ :fish_cake:"],
            ["むり", "まあまあ。:zabuton: 一休みですよ！ :sleeping:"],
            ["死", "まだ死ぬには早いですよ！ :iconv:"],
        ];
        console.log("Initializing deborah...");
        var fs = require("fs");
        this.settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
        console.log(JSON.stringify(this.settings, null, 1));
        var MeCab = require('mecab-lite');
        this.mecab = new MeCab();
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
            if (iset.type == "stdio") {
                this.driverList.push(new DeborahDriverStdIO(this, iset));
            }
        }
    };
    Deborah.prototype.receive = function (data) {
        // メッセージが空なら帰る
        console.log("Deborah.receive: [" + data.text + "]");
        // 特定の文字列〔例：:fish_cake:（なるとの絵文字）〕を含むメッセージに反応する
        for (var k in this.fixedResponseList) {
            if (data.text.match(this.fixedResponseList[k][0])) {
                data.driver.reply(data, "@" + data.senderName + " " + this.fixedResponseList[k][1]);
                break;
            }
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
            case 'hello':
                // %hello
                // 挨拶します
                data.driver.reply(data, 'Oh, hello @' + data.senderName + ' !');
                break;
            case 'say':
                // %say str
                // 指定の文字列を喋ります
                var str = data.text.split('%say ')[1];
                data.driver.reply(data, str);
                break;
            case 'mecab':
                // %mecab str
                // mecabに指定の文字列を渡して分かち書きの結果を返します
                var str = data.text.split('%mecab ')[1];
                var that = this;
                this.mecab.parse(str, function (err, result) {
                    var ans = "@" + data.senderName + " ";
                    for (var i = 0; i < result.length - 1; i++) {
                        ans += result[i][0] + "/";
                    }
                    data.driver.reply(data, ans);
                });
                break;
            case 'debug':
                // %debug
                // デバッグ用コマンド。
                switch (command[1]) {
                    case 'slackData':
                        console.log(data.rawData);
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
