# deborah

# slack-nikobot
slack上で動き、postに反応するbotを作成します

## 設定
rootにsettings.jsonとして

```JSON
{
    "token" : "APIトークン",
    "name" : "nikobot",
    "icon" : ":smile:",
    "channels" : ["#general","@nikosai"]
}
```

のように書く。

### 設定パラメータの意味
* token : APIトークン（https://api.slack.com/docs/oauth-test-tokens で取得できる）
* name : BOTとして発言する際の名前
* icon : BOTとして発言する際のアイコン（Slack上の絵文字の記法で書く）
* channels : BOTの発言を許可するチャンネル（#から始まるものはGroup、@から始まるものはUserへのDirect Message）

## 使い方
* slack-nikobot.js : 本体
* settings.json : 設定ファイル。上記参照。
の2つを同ディレクトリ内に置き、そのディレクトリに``cd``したうえで、
```Shell
node slack-nikobot.js
```

### 必要環境
* Node.js
* npm（必要モジュールは以下）
    * slackbotapi
    * fs
    * mecab-lite

## 注意点
このBOTはAPIを取得したUserが所属していないGroupへは反応・発言できない。
