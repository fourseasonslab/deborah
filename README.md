# deborah

「deborah」は、以下の3つの環境で動作する、オープンソースのチャットbotです。
- Slack
- Twitter
- LINE

## 必要環境
* Node.js
* npm（必要なグローバルモジュールは以下。これ以外の依存パッケージについては、``npm install``コマンドを実行すると、一括で入れることができる。）
 * typescript
 * forever

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
			"accessToken": "xxx",
			"channelSecret": "xxx"
		}
	],
	"profile": {
		"name": "botname",
		"slack-icon": ":innocent:"
	}
}
```

### 設定パラメータの意味
#### interfaces : any[]
* この配列中に、接続先各デバイスの情報を格納します
* type: "stdio"
	* 標準入出力。特別に設定すべきパラメータはありません
* type: "slack-connection"
	* チームへのアクセスに必要な情報を格納します
	* team : string
		* 対象となるチーム `チーム名.slack.com`
	* token : string
		* APIトークン（https://api.slack.com/docs/oauth-test-tokens で取得できる）
* type: "slack-channel"
	* botが動くチャンネルを制限する情報を格納します（未実装）
	* team : string
		* 対象となるチーム `チーム名.slack.com`
	* channel : string
		* 対象となるチャンネル `@hikalium` `#general`
* type: "twitter"
	* screen_name : string
		* botのTwitterIDの@を取ったもの `michiru4s`
	* consumer_key : string
	* consumer_secret : string
	* access\_token\_key : string
	* access\_token\_secret : string
		* APIトークン（いずれもhttps://apps.twitter.com/ で取得できる）
* type: "line"
	* accessToken : string
	* channelSecret : string

#### profile : any
* name : string
 * 発言する際の名前
* slack-icon : string
 * slackで発言する際のアイコン（Slack上の絵文字の記法で書く）

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

## License
MIT License
