# deborah
slack上で動き、postに反応するbotを作成します

### 必要環境
* Node.js
* npm（必要なグローバルモジュールは以下。これ以外の依存パッケージについては、``npm install``コマンドを実行すると、一括で入れることができる。）
 * typescript
 * forever


## 設定
rootにsettings.jsonとして

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
		}
	],
	"profile": {
		"name": "botname",
		"slack-icon": ":innocent:"
	}
}
```

のように書く。

### 設定パラメータの意味
* token : string
 * APIトークン（https://api.slack.com/docs/oauth-test-tokens で取得できる）
* botname : string
 * BOTとして発言する際の名前
* icon : string
 * BOTとして発言する際のアイコン（Slack上の絵文字の記法で書く）
* channels : string[]
 * BOTの発言を許可するチャンネル
  * #から始まるものはChannel(public)
  * @から始まるものはUserへのDirect Message
  * %から始まるものはChannel(private) ← これをAPIではGroupとして扱う
  * それ以外はChannelIDとみなされる

## 起動方法

### テスト用にforegroundで起動する場合

リポジトリのルートディレクトリ内で下記コマンドを実行
```Shell
node deborah.js
```

## 継続的にデーモン化して動作させる場合

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
このBOTはAPIを取得したUserが所属していないGroupへは反応・発言できない。

## License
MIT License
