import {Deborah} from "../deborah";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";
//import {markov} from "../markov";
import {markov_3gram} from "../markov_3gram";

export class DeborahResponderMarkov extends DeborahResponder
{
	markov: any;
	constructor(bot: Deborah){
		super(bot);
		this.name ="Markov";
		//this.markov = new markov();
		this.markov = new markov_3gram();
	}
	generateResponse(req: DeborahMessage){
		var result = req.analytics;
		var rnd = Math.floor(Math.random() * result.importantWords.length);
		if(result.words[result.importantWords[rnd] + 1] === undefined || result.words[result.importantWords[rnd] + 1][1] === "助詞"){
			this.markov.makeSentence(result.words[result.importantWords[rnd]][0], "random word", function(sentence){
				req.driver.reply(req, sentence);
			});
		}else{
			this.markov.makeSentence(result.words[result.importantWords[rnd]][0], result.words[result.importantWords[rnd] + 1][0], function(sentence){
				req.driver.reply(req, sentence);
			});
		}
	}
}
