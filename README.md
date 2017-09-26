# deborah

[![CircleCI](https://circleci.com/gh/fourseasonslab/deborah.svg?style=svg)](https://circleci.com/gh/fourseasonslab/deborah)

「deborah」は、以下の複数環境で動作する、オープンソースのチャットbotです。
- Slack
- Twitter
- LINE
- Web (HTML5/CSS3/Javascript)
- stdIO（標準入出力）

## 必要環境
* Node.js
* npm（必要なグローバルモジュールは以下。これ以外の依存パッケージについては、``npm install``コマンドを実行すると、一括で入れることができる。）
	+ typescript
	+ forever

## 開発者向け
```bash
# set up
sudo npm install -g typescript forever
npm install
git checkout develop
git branch some_graceful_name

# minimal setting (using stdin/stdout)
echo "{ \"interfaces\": [ { \"type\": \"stdio\" } ], \"profile\": { \"name\": \"botname\", \"slack-icon\": \":innocent:\" } }" > settings.json

# ... edit some code ...

# compile *.ts to *.js
tsc

# run server on localhost
node .

```

## settings.jsonについて
動作させる前に、設定ファイルとして、以下のような`settings.json`ファイルを作成し、同ディレクトリ内に置いてください。 

```JSON
{
	"interfaces": [
		{
			"type": "stdio"
		},
		{
			"type": "slack-connection",
			"team": "????.slack.com",
			"token": "?????"
		},
		{
			"type": "slack-channel",
			"team": "????.slack.com",
			"channelName": "@hikalium"
		},
		{
			"type": "twitter",
			"screen_name": "michiru4s",
            "consumer_key": "???",
            "consumer_secret": "???",
            "access_token_key": "???",
            "access_token_secret": "???"
		},
		{
			"type": "line",
			"accessToken": "???",
			"channelSecret": "???"
		},
		{
			"type": "webapi"
		}
	],
	"profile": {
		"name": "botname",
		"slack-icon": ":innocent:"
	},
	"lib": {
		"word2vec":{
			"vectorPath": "???"
		}
	}
}
```

### 設定パラメータの意味
#### interfaces : any[]
* この配列中に、接続先各デバイスの情報を格納します
* type: "stdio"
	+ 標準入出力。特別に設定すべきパラメータはありません
* type: "slack-connection"
	+ チームへのアクセスに必要な情報を格納します
	+ team : string
		- 対象となるチーム `チーム名.slack.com`
	+ token : string
		- APIトークン（ https://api.slack.com/bot-users で取得できる）
		- トークン取得後は、クライアントのAppsよりボットを追加した上で、必要なチャンネルに招待すること。
	+ output : boolean
		- このドライバを出力に使用するか否か（falseの場合、返答は送信されず標準出力に表示される。）
* type: "slack-channel"
	+ botが動くチャンネルを制限する情報を格納します（未実装）
	+ team : string
		- 対象となるチーム `チーム名.slack.com`
	+ channel : string
		- 対象となるチャンネル `@hikalium` `#general`
* type: "twitter"
	+ screen_name : string
		- botのTwitterIDの@を取ったもの `michiru4s`
	+ consumer_key : string
	+ consumer_secret : string
	+ access\_token\_key : string
	+ access\_token\_secret : string
		- APIトークン（いずれもhttps://apps.twitter.com/ で取得できる）
* type: "line"
	+ accessToken : string
	+ channelSecret : string
* type: "webapi"
	+ Web用。特別に設定すべきパラメータはありません
	+ 起動中、localhostのポート3000にアクセスすると、Deborah Webの画面が表示される

#### profile : any
* name : string
	+ 発言する際の名前
* slack-icon : string
	+ slackで発言する際のアイコン（Slack上の絵文字の記法で書く）
 
#### lib
 * vectorpath : string
 * word2vecで使う辞書のパスを指定する

## 起動方法

### テスト用にforegroundで起動する場合

リポジトリ直下で下記コマンドを実行
```Shell
node deborah.js
```

### 継続的にデーモン化して動作させる場合

まず`forever`パッケージをnpmでグローバルにインストールする。
```Shell
sudo npm install -g forever
```

起動コマンドは下記の通り。
```Shell
forever start deborah.js
```

動作状況の確認コマンドは下記の通り。
```Shell
forever list
```

停止コマンドは下記の通り。
```Shell
forever stop deborah.js
```

## 注意点
- Slackに関する制約
 - このBOTはAPIを取得したUserが所属していないGroupへは反応・発言できない。

## このプロジェクトについて
Deborahは [Tier IV, Inc.](http://tier4.jp/) の支援を受けて開発されています。

<a href="http://tier4.jp/"><img src="./docs/imgs/Tier_IV_logo_2.png" width="25%"></a>

## License
MIT License
