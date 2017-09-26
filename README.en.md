# deborah

[![CircleCI](https://circleci.com/gh/fourseasonslab/deborah.svg?style=svg)](https://circleci.com/gh/fourseasonslab/deborah)

deborah is an open source implemention of chat bot.

This bot supports some communication platforms shown below:

- Slack
- Twitter
- LINE
- Web (HTML5/CSS3/Javascript)
- standard Input & Output

## Requirements
* Node.js
* npm（required global packages are shown below. All other required packages are automatically installed by the command: ``npm install``.）
	+ typescript
	+ forever

## For developing
```bash
# set up
sudo npm install -g typescript forever typedoc
npm install
git checkout develop
git branch some_graceful_name

# minimal setting (using stdin/stdout)
echo "{ \"interfaces\": [ { \"type\": \"stdio\" } ], \"profile\": { \"name\": \"botname\", \"slack-icon\": \":innocent:\" } }" > settings.json

# ... edit some code ...

# compile & server on localhost
make run

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
### Parameters
#### interfaces : any[] 
* settings about devices
* type: "stdio"
	+ standard input & output. No parameters to set.
* type: "slack"
	+ team : string
		- name of your team `TEAMNAME.slack.com`
	+ token : string
		- API Token (Available: https://api.slack.com/bot-users)
		- After you get token, you should add bot in slack>Apps, and then invite the bot to teams.
	+ output : boolean
		- whether this driver is used to output(if false, replies are displayed on stdout, instead of sending to slack)
	+ channels : string[]
		- the bot is available only in these channels.
* type: "twitter"
	+ screen_name : string
		- bot's twitter ID (without '@') `michiru4s`
	+ consumer_key : string
	+ consumer_secret : string
	+ access\_token\_key : string
	+ access\_token\_secret : string
		- API Tokens (All available: https://apps.twitter.com/)
* type: "line"
	+ accessToken : string
	+ channelSecret : string
* type: "webapi"
	+ for web interface. No parameters to set.
	+ while the bot is running, you can try it in `localhost:3000`.

#### profile : any
* name : string
	+ The screen-name of bot.
* slack-icon : string
	+ The icon of bot (slack emoticons are available).
 
#### lib
* vectorpath : string
	+ the path of dictionary used by word2vec.

## How to run

### Running in foreground (for testing)

Execute this command in the root of repository.
```Shell
node deborah.js
```

### Running continually as a daemon process 

Install `forever` package in global by npm
```Shell
sudo npm install -g forever
```

Launch:
```Shell
forever start deborah.js
```

Checking state of process:
```Shell
forever list
```

Stop:
```Shell
forever stop deborah.js
```

## About
This project "Deborah" is sponsored by [Tier IV, Inc.](http://tier4.jp/).

<a href="http://tier4.jp/"><img src="./docs/imgs/Tier_IV_logo_2.png" width="25%"></a>

## License
MIT License