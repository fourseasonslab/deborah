class DeborahResponderWeather extends DeborahResponder
{
	name: string;
	bot: Deborah;
	constructor(bot: Deborah){
		super(bot);
		this.bot = bot;
		this.name = "Weather";
		var YQL = require('yql');
		//var query = new YQL('SHOW TABLES');
		/*
		 query.exec(function (error, response) {
			 // Do something with results (response.query.results)
			 //console.log(response.query.results);
			 });
		 */

		var query = new YQL('select * from weather.forecast where woeid=2502265');

		query.exec(function(err, data) {
			var location = data.query.results.channel.location;
			var condition = data.query.results.channel.item.condition;

			console.log('The current weather in ' + location.city + ', ' + location.region + ' is ' + condition.text + ", "+ condition.temp + ' degrees.');
			//console.log(JSON.stringify(data.query, null, 1));
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
