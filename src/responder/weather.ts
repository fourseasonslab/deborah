class DeborahResponderWeather extends DeborahResponder
{
	name: string;
	bot: Deborah;
	YQL: any;
	text: string;
	temp: number;
	constructor(bot: Deborah){
		super(bot);
		this.bot = bot;
		this.name = "Weather";
		this.YQL = require('yql');
	}
	generateResponse(req: DeborahMessage){
		//req.driver.reply(req, req.text);
		var result = req.analytics;
		var place;
		for(var i = 0; i < result.words.length; i++){
			if(result.words[i][3] === "地域" && result.words[i][2] === "固有名詞"){
				place = result.words[i][7];
				var woeidQuery = new this.YQL('SELECT woeid FROM geo.places WHERE text = ' + "'" + place + "'");
				var woeid;
				var that = this;
				woeidQuery.exec(function(err, data) {
					if(data.query.count === 1){
						woeid = data.query.results.place.woeid;
					}else{
						//入力した地名に対してwoeidが複数割り当てられている場合．
						//天気予報に関してはどのwoeidを使っても基本的に同じ地点の結果が返って来るようだ
						//woeid = data.query.results.place[data.query.count-1].woeid;
						woeid = data.query.results.place[0].woeid;
					}
					var query = new that.YQL('select * from weather.forecast where woeid=' + woeid);

					query.exec(function(err, data) {
						var location = data.query.results.channel.location;
						var condition = data.query.results.channel.item.condition;

						that.text = condition.text;
						//console.log(that.text);

						if(condition.text === "Cloudy") that.text = "曇";
						else if(condition.text === "Partly Cloudy") that.text = "晴時々曇";
						else if(condition.text === "Mostly Cloudy") that.text = "曇のち晴";
						else if(condition.text === "Sunny") that.text = "晴";
						else if(condition.text === "Clear") that.text = "快晴";
						else if(condition.text === "Rainy") that.text = "雨";
						else if(condition.text === "Showers") that.text = "にわか雨";
						else that.text = condition.text;

						that.temp = (condition.temp - 32) / 1.8;

						//英語の地名になってしまう(どこの天気の情報を表示しているのか知りたいときはこっちをみるとわかる)
						//that.reply(req, location.city + 'の天気は' + that.text + ", "+ "気温は" + that.temp.toFixed(1) + '度だよ');
						that.reply(req, place + 'の天気は' + that.text + ", "+ "気温は" + that.temp.toFixed(1) + '度だよ');
						//console.log(JSON.stringify(data.query, null, 1));
					});
				});
			}
		}
	}
	reply(req: DeborahMessage, text: string){
		req.driver.reply(req, text);
	}
}
