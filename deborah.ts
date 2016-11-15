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

// 標準入力を受け取る準備
var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// 標準入力を受け取ったら
reader.on('line', function(line) {
    // コマンド実行
    for(var i of settings.channels){
        doCommands(line,settings.name,i);
    }
});

// c-C（EOF）が入力されたら
reader.on('close', function() {
    // 別れの挨拶
    sendAsBot(settings.channels[0],"Bye!",function (){
        process.exit(0);
    });
});

// helloイベント（自分の起動）が発生したとき
slack.on('hello', function (data){
    // settings.channelsをユニークなIDに変換する
    for (var i = 0; i<settings.channels.length; i++){
        switch (settings.channels[i].charAt(0)){
            // 指定先がChannel(public)の場合
            case "#":
                settings.channels[i] = slack.getChannel(settings.channels[i].substr(1, settings.channels[i].length-1)).id;
                break;
            
            // 指定先がUserの場合
            case "@":
                settings.channels[i] = slack.getIM(settings.channels[i].substr(1, settings.channels[i].length-1)).id
                break;

            // 指定先がGroup(private)の場合
            case "%":
                settings.channels[i] = slack.getGroup(settings.channels[i].substr(1, settings.channels[i].length-1)).id
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

// messageイベントが発生したとき呼ばれる
slack.on('message', function (data) {
    
    // メッセージが空なら帰る
    if (typeof data.text === 'undefined') return;
    
    // 自分のメッセージなら帰る
    if (getUsername(data) === settings.name) return;

    // メッセージが投稿された先がsettings.jsonで指定されたところでなければ帰る
    var exit_flag = true;
    for (var i of settings.channels){
        if(i === data.channel){
            exit_flag = false;
            break;
        }
    }
    if (exit_flag) return;

    // 特定の文字列〔例：:fish_cake:（なるとの絵文字）〕を含むメッセージに反応する
    if (data.text.match(/:fish_cake:/)) sendAsBot(data.channel, '@' + getUsername(data) + ' やっぱなるとだよね！ :fish_cake:');

    doCommands(data.text,getUsername(data),data.channel);
});

// 引数に与えた名前・アイコンで送信します
interface SlackSendData {
    text: string;
    channel: string;
    icon_emoji: string;
    username: string
}
function sendAs(channel, text, name, icon, callback = null){
    var data: SlackSendData = {
        text: text,
        channel: channel,
        icon_emoji:icon,
        username: name
    }
    slack.reqAPI("chat.postMessage",data,callback);
}

// settingsで設定した名前・アイコンで送信します
function sendAsBot(channel,text, callback = null){
    sendAs(channel,text,settings.name,settings.icon,callback);
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

function doCommands(instr,name,channel){
    // %から始まる文字列をコマンドとして認識する
    if (instr.charAt(0) === '%') {
        var command = instr.substring(1).split(' ');

        // コマンドの種類により異なる動作を選択
        switch (command[0].toLowerCase()) {
            // %hello
            // 挨拶します
            case 'hello':
                sendAsBot(channel, 'Oh, hello @' + name + ' !');
                break;
            
            // %say str
            // 指定の文字列を喋ります
            case 'say':
                var str = instr.split('%say ')[1];
                sendAsBot(channel, str);
                break;

            // %mecab str
            // mecabに指定の文字列を渡して分かち書きの結果を返します
            case 'mecab':
                var str = instr.split('%mecab ')[1];
                mecab.parse(str, function(err, result) {
                    var ans = "@"+name+" ";
                    for(var i=0;i<result.length-1;i++){
                        ans += result[i][0] + "/";
                    }
                    sendAsBot(channel, ans);
                });
                break;

            // %debug
            // デバッグ用コマンド。
            case 'debug':
                switch (command[1]){
                case 'slackData':
                    if(command[2] === undefined) console.log(slack.slackData);
                    else console.log(slack.slackData[command[2]]);
                    break;
                case 'cur':
                    console.log("instr  :"+instr);
                    console.log("name   :"+name);
                    console.log("channel:"+channel);
                    break;
                }
                break;
        }
    }
}