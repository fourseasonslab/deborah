var DeborahMessage = (function () {
    function DeborahMessage() {
    }
    return DeborahMessage;
}());
var DeborahDriverSlack = (function () {
    function DeborahDriverSlack(bot) {
        this.bot = bot;
        var slackAPI = require('slackbotapi');
        this.connection = new slackAPI({
            'token': bot.settings.token,
            'logging': true,
            'autoReconnect': true
        });
    }
    DeborahDriverSlack.prototype.connect = function () {
        var that = this;
        this.connection.on('message', function (data) {
            // receive
            if (!data || !data.text)
                return;
            var m = new DeborahMessage();
            m.text = data.text;
            m.senderName = that.getUsername(data);
            m.context = data.channel;
            m.driver = that;
            //
            if (m.senderName == that.bot.settings.name)
                return;
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
        var fs = require("fs");
        this.settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
        var MeCab = require('mecab-lite');
        this.mecab = new MeCab();
    }
    Deborah.prototype.startWithDriver = function (driver) {
        this.driver = driver;
        driver.connect();
    };
    Deborah.prototype.receive = function (data) {
        // メッセージが空なら帰る
        /*
                if (typeof data.text === 'undefined') return;
        
                // 自分のメッセージなら帰る
                if (this.driver.getUsername(data) === this.settings.name) return;
        
                // メッセージが投稿された先がsettings.jsonで指定されたところでなければ帰る
                var exit_flag = true;
                for (var i in this.settings.channels){
                    switch (i.charAt(0)){
                        // 指定先がgroupの場合
                        case "#":
                            if(this.driver.getGroup(i.substr(1, i.length-1)).id === data.channel) exit_flag = false;
                            break;
                        
                        // 指定先がUserの場合
                        case "@":
                            if(this.driver.getIM(i.substr(1, i.length-1)).id === data.channel) exit_flag = false;
                            break;
        
                        case "G":
                            if(i === data.channel) exit_flag = false;
                            break;
                    }
                    if (!exit_flag) break;
                }
                if (exit_flag) return;
        */
        // 特定の文字列〔例：:fish_cake:（なるとの絵文字）〕を含むメッセージに反応する
        if (data.text.match(/:fish_cake:/)) {
            this.driver.replyAsBot(data, '@' + data.senderName + ' やっぱなるとだよね！ :fish_cake:');
        }
        // %から始まる文字列をコマンドとして認識する
        if (data.text.charAt(0) === '%') {
            var command = data.text.substring(1).split(' ');
            // 2個以上の引数は取らないので、一つに結合する
            for (var i = 2; i < command.length; i++) {
                command[1] = command[1] + ' ' + command[i];
            }
            // コマンドの種類により異なる動作を選択
            switch (command[0].toLowerCase()) {
                // %hello
                // 挨拶します
                case 'hello':
                    this.driver.replyAsBot(data, 'Oh, hello @' + data.senderName + ' !');
                    break;
                // %say str
                // 指定の文字列を喋ります
                case 'say':
                    var str = data.text.split('%say ')[1];
                    this.driver.replyAsBot(data, str);
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
                        that.driver.replyAsBot(data, ans);
                    });
                    break;
            }
        }
    };
    return Deborah;
}());
var deborah = new Deborah();
var slackDriver = new DeborahDriverSlack(deborah);
deborah.startWithDriver(slackDriver);
