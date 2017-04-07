class DeborahDriver {
    //
    constructor(bot, settings) {
        this.bot = bot;
        this.settings = settings;
    }
    reply(replyTo, message) {
        console.log("DeborahDriver: Default: " + message);
    }
    tryRequire(path) {
        try {
            return require(path);
        }
        catch (e) {
            console.log("DeborahDriver needs '" + path + "'.\n Please run 'sudo npm install -g " + path + "'");
        }
        return null;
    }
}
class DeborahMessage {
}
class DeborahDriverLineApp extends DeborahDriver {
    constructor(bot, settings) {
        super(bot, settings);
        this.stat = 0;
        this.replyTo = null;
        this.message = null;
        this.line = this.tryRequire('node-line-bot-api');
        this.express = this.tryRequire('express');
        this.bodyParser = this.tryRequire('body-parser');
        this.lineClient = this.line.client;
        this.lineValidator = this.line.validator;
        this.app = this.express();
        this.app.use(this.bodyParser.json({
            verify: function (req, res, buf) {
                req.rawBody = buf;
            }
        }));
        this.line.init({
            accessToken: process.env.LINE_TOKEN || this.settings.accessToken,
            channelSecret: process.env.LINE_SECRET || this.settings.channelSecret
        });
        let that = this;
        this.app.post('/webhook/', this.line.validator.validateSignature(), function (req, res, next) {
            const promises = [];
            let errorCount = 0;
            req.body.events.map(function (event) {
                console.log(event.source.userId);
                if (!event.message.text)
                    return;
                that.line.client.getProfile(event.source.userId).then((profile) => {
                    var m = new DeborahMessage();
                    m.text = event.message.text;
                    m.senderName = profile.displayName;
                    m.context = "main";
                    m.driver = that;
                    m.rawData = null;
                    that.stat = 1;
                    that.message = "";
                    that.bot.receive(m);
                    if (that.stat == 2) {
                        // promises.push(that.line.client.replyMessage({
                        that.line.client.replyMessage({
                            replyToken: event.replyToken,
                            messages: [
                                {
                                    type: 'text',
                                    text: that.message
                                }
                            ]
                        }).catch(() => { errorCount++; });
                    }
                    that.stat = 0;
                }, () => { errorCount++; });
            });
            // Promise.all(promises).then(function(){res.json({success: true})});
            if (!errorCount)
                res.json({ success: true });
        });
        this.connect();
    }
    connect() {
        let port = process.env.PORT || 3000;
        this.app.listen(port, function () {
            console.log('Example app listening on port ' + port + '!');
        });
    }
    reply(replyTo, message) {
        if (this.stat == 1) {
            // Send as reply
            this.replyTo = replyTo;
            this.message += (this.message ? "\n" : "") + message;
            this.stat = 2;
        }
    }
}
class DeborahDriverSlack extends DeborahDriver {
    constructor(bot, settings) {
        super(bot, settings);
        console.log("Driver initialized: Slack (" + settings.team + ")");
        this.connectionSettings = settings;
        var slackAPI = require('slackbotapi');
        this.connection = new slackAPI({
            'token': this.connectionSettings.token,
            'logging': false,
            'autoReconnect': true
        });
        this.connect();
    }
    connect() {
        var that = this;
        this.connection.on('message', function (data) {
            // receive
            console.log(JSON.stringify(data, null, " "));
            if (!data || !data.text)
                return;
            if ("subtype" in data && data.subtype === "bot_message")
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
    }
    reply(replyTo, message) {
        if (this.settings.output === false) {
            console.log("Disabled output:");
            console.log(replyTo);
            console.log(message);
            return;
        }
        this.sendAs(replyTo.context, "@" + replyTo.senderName + " " + message, this.bot.settings.profile.name, this.bot.settings.profile["slack-icon"]);
    }
    sendAs(channel, text, name, icon) {
        var data = new Object();
        data.text = text;
        data.channel = channel;
        data.icon_emoji = icon;
        data.username = name;
        this.connection.reqAPI("chat.postMessage", data);
    }
    getUsername(data) {
        // botの場合
        if (data.user === undefined) {
            return data.username;
        }
        else {
            return this.connection.getUser(data.user).name;
        }
    }
}
class DeborahDriverStdIO extends DeborahDriver {
    constructor(bot, settings) {
        super(bot, settings);
        console.log("Driver initialized: StdIO");
        //
        var OpenJTalk = this.tryRequire('openjtalk');
        if (OpenJTalk) {
            this.openjtalk = new OpenJTalk();
            this.openjtalk.talk('音声合成が有効です');
        }
        else {
            this.openjtalk = null;
        }
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
    reply(replyTo, message) {
        this.readline.write(message);
        if (this.openjtalk) {
            this.openjtalk.talk(message);
        }
    }
}
class DeborahDriverTwitter extends DeborahDriver {
    constructor(bot, settings) {
        super(bot, settings);
        console.log("Driver initialized: Twitter");
        var Twitter = require('twitter');
        this.client = new Twitter({
            consumer_key: settings.consumer_key,
            consumer_secret: settings.consumer_secret,
            access_token_key: settings.access_token_key,
            access_token_secret: settings.access_token_secret
        });
        var that = this;
        this.client.stream('user', function (stream) {
            stream.on('data', function (data) {
                var id = ('user' in data && 'screen_name' in data.user) ? data.user.screen_name : null;
                var text = ('text' in data) ? data.text.replace(new RegExp('^@' + that.settings.screen_name + ' '), '') : '';
                var ifMention = ('in_reply_to_user_id' in data) ? (data.in_reply_to_user_id !== null) : false;
                var ifMentionToMe = ifMention && (data.in_reply_to_screen_name === that.settings.screen_name);
                console.log(data);
                if (!ifMentionToMe || id == that.settings.screen_name)
                    return;
                var m = new DeborahMessage();
                m.text = text;
                m.senderName = id;
                m.context = "Twitter";
                m.driver = that;
                m.rawData = data;
                that.bot.receive(m);
            });
        });
    }
    reply(replyTo, message) {
        var msg = {
            "status": "@" + replyTo.senderName + " " + message,
            "in_reply_to_status_id": replyTo.rawData.id_str,
        };
        this.client.post('statuses/update', msg, function (error, tweet, response) {
            if (error)
                throw error;
            console.log(tweet); // Tweet body.
            //console.log(response);  // Raw response object.
        });
    }
}
class DeborahDriverWebAPI extends DeborahDriver {
    constructor(bot, settings) {
        super(bot, settings);
        console.log("Driver initialized: WebAPI");
        //
        this.fs = require('fs');
        this.dataurl = require('dataurl');
        var port = 3000;
        var Sock = require('socket.io');
        var http = require('http');
        var that = this;
        var OpenJTalk = this.tryRequire('openjtalk');
        if (OpenJTalk) {
            this.openjtalk = new OpenJTalk();
        }
        else {
            this.openjtalk = null;
        }
        //
        this.httpServer = http.createServer();
        this.httpServer.on('request', function (req, res) {
            var stream = that.fs.createReadStream('index.html');
            res.writeHead(200, { 'Content-Type': 'text/html' });
            stream.pipe(res);
        });
        this.io = Sock.listen(this.httpServer);
        this.io.on('connection', function (socket) {
            console.log("connection established");
            //console.log(client);
            socket.on('input', function (data) {
                console.log("recv input:");
                console.log(data);
                //
                var m = new DeborahMessage();
                m.text = data.text;
                m.senderName = "unknown";
                m.context = socket;
                m.driver = that;
                m.rawData = socket;
                //
                that.bot.receive(m);
            });
        });
        console.log("Listen on port " + port);
        this.httpServer.listen(port);
    }
    reply(replyTo, message) {
        this.createVoiceURL(message, function (url) {
            console.log("webapi: reply: " + message);
            var m = {
                text: message,
                voiceURL: url,
            };
            replyTo.rawData.emit("reply", m);
        });
    }
    createVoiceURL(text, f) {
        var that = this;
        this.openjtalk._makeWav(text, this.openjtalk.pitch, function (err, res) {
            console.log(res);
            that.fs.readFile(res.wav, function (err, data) {
                var url = that.dataurl.convert({
                    data: data,
                    mimetype: 'audio/wav'
                });
                //console.log(url);
                f(url);
                that.fs.unlink(res.wav, function (err) {
                    if (err)
                        console.log('unlink failed');
                });
            });
        });
    }
}
class DeborahResponder {
    constructor(bot) {
        this.bot = bot;
        this.name = "Echo";
    }
    generateResponse(req) {
        // echo
        req.driver.reply(req, req.text);
    }
    reply(req, text) {
        req.driver.reply(req, text);
    }
}
class DeborahResponderCabocha extends DeborahResponder {
    constructor(bot) {
        super(bot);
        this.name = "Cabocha";
    }
    generateResponse(req) {
        var that = this;
        this.bot.cabochaf1.parse(req.text, function (result) {
            console.log(JSON.stringify(result, null, " "));
            var depres = result.depRels;
            var num;
            var importantWords = [];
            for (var i = 0; i < depres.length; i++) {
                if (depres[i][0] === -1) {
                    num = i;
                    importantWords.push(result.depRels[num][2][0]);
                    break;
                }
            }
            //console.log(JSON.stringify(result, null, " "));
            for (var i = 0; i < num; i++) {
                if (depres[i][0] === num) {
                    // req.driver.reply(req, "Cabocha  " + "そうか、君は" + depres[i][1] + depres[num][1] + "フレンズなんだね！");
                    importantWords.push(result.depRels[i][2][0]);
                }
            }
            var max = Math.max.apply(null, result.scores);
            var min = Math.max.apply(null, result.scores);
            var normScores = [];
            for (var i = 0; i < result.scores.length; i++) {
                normScores[i] = (result.scores[i] - min) / (max - min);
            }
            result.normScores = normScores;
            if (result.scores.indexOf(Math.max.apply(null, result.scores)) !== -1) {
                var maxScore = result.scores.indexOf(Math.max.apply(null, result.scores));
                console.log("へえ，" + result.words[maxScore][0] + "ね");
            }
            var types = [];
            for (var i = 0; i < result.words.length; i++) {
                //this.w2v = new W2V();
                if (result.words[i][0] === "昨日") {
                    types.push("time");
                }
                else if (result.words[i][0] === "宇宙") {
                    types.push("place");
                }
                else if (result.words[i][0] === "うどん") {
                    types.push("food");
                }
                else if (result.words[i][0] === "佳乃") {
                    types.push("person");
                }
                else {
                    types.push(null);
                }
            }
            result.types = types;
            for (var i = 0; i < result.types.length; i++) {
                if (result.types[i] === "food") {
                    req.driver.reply(req, "type: " + result.words[i][0] + "美味しかったですか？");
                }
            }
            var count = [];
            for (var i = 0; i < result.depRels.length; i++) {
                count[i] = 0;
            }
            for (var i = 0; i < result.depRels.length; i++) {
                if (result.depRels[i][0] !== -1) {
                    count[result.depRels[i][0]]++;
                }
            }
            result.counts = count;
            var rankWords = [];
            for (var i = 0; i < result.counts.length; i++) {
                rankWords.push([result.counts[i], result.depRels[i][1], result.depRels[i][2][0]]);
            }
            rankWords.sort(function (a, b) {
                return b[0] - a[0];
            });
            result.rankWords = rankWords;
            console.log(JSON.stringify(result.rankWords));
            for (var i = 0; i < 4; i++) {
                if (i < result.rankWords.length) {
                    importantWords.push(result.rankWords[i][2]);
                }
            }
            result.importantWords = importantWords;
            var rnd = Math.floor(Math.random() * result.importantWords.length);
            console.log(result.importantWords);
            if (result.words[result.importantWords[rnd]][1] === "名詞") {
                that.reply(req, result.words[result.importantWords[rnd]][0] + "について聞かせてよ！");
            }
            else if (result.words[result.importantWords[rnd]][1] === "動詞") {
                that.reply(req, "どうして" + result.words[result.importantWords[rnd]][7] + "の？");
            }
            else if (result.words[result.importantWords[rnd]][1] === "形容詞" || result.words[result.importantWords[rnd]][1] === "形容動詞") {
                that.reply(req, result.words[result.importantWords[rnd]][7] + "よね〜");
            }
            else {
                that.reply(req, result.words[result.importantWords[rnd]][0] + "ってこと！？");
            }
            /*
            var w2v = require('word2vec');
            //w2v.loadModel('data/wakati_jawiki_20170215_all.txt.vectors.bin', function( err, model ){
            //大きすぎてMacbookが音を上げた
            w2v.loadModel('data/vectors.bin', function( err, model ){
                //console.log("がおがお" + model.analogy("ひまわり", ["犬", "動物"], 5));
                console.log("がおがお");
                //console.log(JSON.stringify(model.getVector("ひまわり")));
                //console.log("がおがお" + model.analogy("ひまわり", ["犬", "動物"], 5));
                console.log(model.getNearestWords( model.getVector( 'コンピュータ' ), 3 ));
            });
            */
        });
    }
}
class DeborahResponderMeCab extends DeborahResponder {
    constructor(bot) {
        super(bot);
        this.name = "MeCab";
    }
    generateResponse(req) {
        this.bot.mecab.parse(req.text, function (err, result) {
            console.log(JSON.stringify(result, null, 2));
            var s = "";
            for (var i = 0; i < result.length - 1; i++) {
                if (result[i][1] === "動詞") {
                    s = result[i][0];
                    if (result[i][6] !== "基本形") {
                        for (i++; i < result.length - 1; i++) {
                            s += result[i][0];
                            if (result[i][6] === "基本形")
                                break;
                        }
                    }
                }
            }
            if (s.length > 0) {
                req.driver.reply(req, "そうか、君は" + s + "フレンズなんだね！");
            }
        });
    }
}
class Deborah {
    constructor() {
        this.driverList = [];
        this.initialIgnorePeriod = 5000; // ms
        this.fixedResponseList = [
            [":fish_cake:", "やっぱなるとだよね！ :fish_cake:"],
            ["むり", "まあまあ。:zabuton: 一休みですよ！ :sleeping:"],
            ["死", "まだ死ぬには早いですよ！ :iconv:"],
            ["test", "test"]
        ];
        this.responderList = [];
        console.log("Initializing deborah...");
        this.launchDate = new Date();
        var fs = require("fs");
        let fval, fname = "settings.json";
        try {
            fval = fs.readFileSync('settings.json');
        }
        catch (e) {
            console.log("settings.json not found.\nimporting settings from environmental variable...");
            fval = process.env.DEBORAH_CONFIG;
        }
        if (!fval) {
            console.log("Error: cannot load settings.");
            process.exit(1);
        }
        this.settings = JSON.parse(fval);
        console.log(JSON.stringify(this.settings, null, 1));
        var MeCab = require('mecab-lite');
        this.mecab = new MeCab();
        var Cabocha = require('node-cabocha');
        this.cabochaf1 = new Cabocha();
        //this.responderList.push(new DeborahResponder(this));
        this.responderList.push(new DeborahResponderCabocha(this));
        //this.responderList.push(new DeborahResponderMeCab(this));
    }
    start() {
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
            else if (iset.type == "stdio") {
                this.driverList.push(new DeborahDriverStdIO(this, iset));
            }
            if (iset.type == "twitter") {
                this.driverList.push(new DeborahDriverTwitter(this, iset));
            }
            else if (iset.type == "line") {
                this.driverList.push(new DeborahDriverLineApp(this, iset));
            }
            else if (iset.type == "webapi") {
                this.driverList.push(new DeborahDriverWebAPI(this, iset));
            }
        }
    }
    receive(data) {
        try {
            // メッセージが空なら帰る
            console.log("Deborah.receive: [" + data.text + "] in " + data.context);
            // 最初の無視期間は反応せず帰る
            if ((Date.now() - this.launchDate.getTime()) < this.initialIgnorePeriod) {
                console.log("initial ignore period. ignore.");
                return 0;
            }
            // ランダムにresponderを選択して、それに処理を引き渡す。
            var idx = Math.floor(Math.random() * this.responderList.length);
            console.log("Responder: " + this.responderList[idx].name);
            this.responderList[idx].generateResponse(data);
            // %から始まる文字列をコマンドとして認識する
            this.doCommand(data);
        }
        catch (e) {
            data.driver.reply(data, "内部エラーが発生しました。\nメッセージ: " + e);
        }
    }
    doCommand(data) {
        // %から始まる文字列をコマンドとして認識する
        if (data.text.charAt(0) !== '%')
            return;
        var command = data.text.substring(1).split(' ');
        // コマンドの種類により異なる動作を選択
        switch (command[0].toLowerCase()) {
            case 'date':
                // %date
                // 起動時刻を返します
                data.driver.reply(data, "起動時刻は" + this.launchDate + "です。");
                break;
            case 'uptime':
                // %uptime
                // 起動からの経過時間[ms]を返します。
                data.driver.reply(data, "起動してから" + (Date.now() - this.launchDate.getTime()) + "ms経過しました。");
                break;
            case 'hello':
                // %hello
                // 挨拶します
                data.driver.reply(data, 'Oh, hello ' + data.senderName + ' !');
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
                    var ans = "";
                    if (result) {
                        for (var i = 0; i < result.length - 1; i++) {
                            ans += result[i][0] + "/";
                        }
                    }
                    else {
                        ans = "ごめんなさい、このサーバーはmecabには対応していません";
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
    }
}
var deborah = new Deborah();
deborah.start();
