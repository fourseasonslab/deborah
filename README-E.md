# deborah

deborah is an open source implemention of chat bot.

It supports some communication platforms shown below:

- Slack
- Twitter
- LINE

## Requirements
* Node.js
* npm（必要なグローバルモジュールは以下。これ以外の依存パッケージについては、``npm install``コマンドを実行すると、一括で入れることができる。）
 * typescript
 * forever

## For developing
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

## Example settings.json
`settings.json` should be placed in the root directory of the project.

Example:
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
* token : string
 * APIトークン（https://api.slack.com/docs/oauth-test-tokens で取得できる）
* name : string
 * BOTとして発言する際の名前
* slack-icon : string
 * BOTとして発言する際のアイコン（Slack上の絵文字の記法で書く）
* channels : string[]
 * BOTの発言を許可するチャンネル
  * #から始まるものはChannel(public)
  * @から始まるものはUserへのDirect Message
  * %から始まるものはChannel(private) ← これをAPIではGroupとして扱う
  * それ以外はChannelIDとみなされる

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
