import {Deborah} from "../deborah";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";

export class DeborahResponderKano extends DeborahResponder
{
	scraperjs;
	constructor(bot: Deborah){
		super(bot);
		this.name ="Kano";
		this.scraperjs = require('scraperjs');
	}
	generateResponse(req: DeborahMessage){
		var result = req.analytics;
		var rnd;
		var word;
		var num;
		//if(result.words[result.importantWords[rnd]][1] === "名詞"){
		if(req.wordMatch(['*', 'について', '*'])){
			//word = encodeURIComponent(result.words[result.importantWords[rnd]][0]);
			rnd = Math.floor(Math.random() * req.wordMatch(['*', 'について', '*'])[0].length);
			word = encodeURIComponent(result.words[result.importantWords[rnd]][0]);
		}
		if(word !== undefined){
			this.scraperjs.StaticScraper.create('https://ja.wikipedia.org/wiki/' + word)
				.scrape(function($) {
					return $("b").parent("p").eq(0).map(function() {
						return $(this).text();
					}).get();
				})
					.then(function(news) {
						news = (news + '').split('\n\n').join('').split('\t').join('').replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').replace(/\[.*?\]/g, '');
						if(news.indexOf('。') !== -1){
							news.slice(0, (news.indexOf('。') + 1));
						}
						req.driver.reply(req, news);
					})
		}else{
			//req.driver.reply(req, 'わっかんなかったよ...');
			console.log('ignored.');
		}
	}
}
