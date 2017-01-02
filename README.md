# deborah
slack上で動き、postに反応するbotを作成します

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

## 使い方
* deborah.ts : Typescriptにより記述された本体
* deborah.js : tscによるコンパイル後の本体
* settings.json : 設定ファイル（上記参照）
の2つを同ディレクトリ内に置き、そのディレクトリに``cd``したうえで、
```Shell
node deborah.js
```

### 必要環境
* Node.js
* npm（必要モジュールは以下。``npm install``コマンドを実行すると一括で入れることができる。）
    * slackbotapi
    * fs
    * mecab-lite

## 注意点
このBOTはAPIを取得したUserが所属していないGroupへは反応・発言できない。

## License
MIT License
