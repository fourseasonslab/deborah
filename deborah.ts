// setting.jsonを読み込む
var fs = require("fs");
var settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

// モジュールslackbotapiの準備
var slackAPI = require('slackbotapi');
var slack = new slackAPI({
    'token': settings.token,
    'logging': true,
    'autoReconnect': true
});

// モジュールmecab-liteの準備
var MeCab = require('mecab-lite');
var mecab = new MeCab();

//// helloイベント（自分の起動）が発生したとき
//slack.on('hello',function(data){
//    
//});

// messageイベントが発生したとき呼ばれる
slack.on('message', function (data) {
    
    // メッセージが空なら帰る
    if (typeof data.text === 'undefined') return;
    
    // 自分のメッセージなら帰る
    if (getUsername(data) === settings.name) return;

    // メッセージが投稿された先がsettings.jsonで指定されたところでなければ帰る
    var exit_flag = true;
    for (var i of settings.channels){
        switch (i.charAt(0)){
            // 指定先がChannel(public)の場合
            case "#":
                if(slack.getChannel(i.substr(1, i.length-1)).id === data.channel) exit_flag = false;
                break;
            
            // 指定先がUserの場合
            case "@":
                if(slack.getIM(i.substr(1, i.length-1)).id === data.channel) exit_flag = false;
                break;

            // 指定先がGroup(private)の場合
            case "%":
                if(slack.getGroup(i.substr(1, i.length-1)).id === data.channel) exit_flag = false;
                break;

            // その他
            default:
                if(i === data.channel) exit_flag = false;
                break;
        }
        if (!exit_flag) break;
    }
    if (exit_flag) return;

    // 特定の文字列〔例：:fish_cake:（なるとの絵文字）〕を含むメッセージに反応する
    if (data.text.match(/:fish_cake:/)) sendAsBot(data.channel, '@' + getUsername(data) + ' やっぱなるとだよね！ :fish_cake:');

    // %から始まる文字列をコマンドとして認識する
    if (data.text.charAt(0) === '%') {
        var command = data.text.substring(1).split(' ');

        // 2個以上の引数は取らないので、一つに結合する
        for (var _i = 2; i < command.length; _i++) {
            command[1] = command[1] + ' ' + command[_i];
        }
        // コマンドの種類により異なる動作を選択
        switch (command[0].toLowerCase()) {
            // %hello
            // 挨拶します
            case 'hello':
                sendAsBot(data.channel, 'Oh, hello @' + getUsername(data) + ' !');
                break;
            
            // %say str
            // 指定の文字列を喋ります
            case 'say':
                var str = data.text.split('%say ')[1];
                sendAsBot(data.channel, str);
                break;

            // %mecab str
            // mecabに指定の文字列を渡して分かち書きの結果を返します
            case 'mecab':
                var str = data.text.split('%mecab ')[1];
                mecab.parse(str, function(err, result) {
                    var ans = "@"+getUsername(data)+" ";
                    for(var i=0;i<result.length-1;i++){
                        ans += result[i][0] + "/";
                    }
                    sendAsBot(data.channel, ans);
                });
                break;
        }
    }
});

// 引数に与えた名前・アイコンで送信します
interface SlackSendData {
    text: string;
    channel: string;
    icon_emoji: string;
    username: string
}
function sendAs(channel, text, name, icon){
    var data: SlackSendData = {
        text: text,
        channel: channel,
        icon_emoji:icon,
        username: name
    }
    slack.reqAPI("chat.postMessage",data);
}

// settingsで設定した名前・アイコンで送信します
function sendAsBot(channel,text){
    sendAs(channel,text,settings.name,settings.icon);
}

// messageデータからusernameを割り出す
function getUsername(data){
    // botの場合
    if(data.user === undefined) {
        return data.username;
    }
    else {
        return slack.getUser(data.user).name;
    }
}
