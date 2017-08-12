class DeborahResponderWeather extends DeborahResponder
{
	name: string;
	bot: Deborah;
	weather: any;
	text: string;
	temp: number;
	constructor(bot: Deborah){
		super(bot);
		this.bot = bot;
		this.name = "Weather";
		var YQL = require('yql');
		var woeidQuery = new YQL('SELECT woeid FROM geo.places WHERE text = ' + "'" + "池袋" + "'");
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
			var query = new YQL('select * from weather.forecast where woeid=' + woeid);

			query.exec(function(err, data) {
				var location = data.query.results.channel.location;
				var condition = data.query.results.channel.item.condition;

				that.text = condition.text;
				console.log(that.text);

				if(condition.text === "Cloudy") that.text = ":cloud:";
				else if(condition.text === "Sunny") that.text = ":sunny:";
				else that.text = condition.text;

				that.temp = (condition.temp - 32) / 1.8;

				console.log(location.city + 'の天気は' + that.text + ", "+ "気温は" + that.temp.toFixed(1) + '度だよ');
				//console.log(JSON.stringify(data.query, null, 1));
			});
		});
	}
	generateResponse(req: DeborahMessage){
		// echo
		//req.driver.reply(req, req.text);
	}
	reply(req: DeborahMessage, text: string){
		req.driver.reply(req, text);
	}
}
