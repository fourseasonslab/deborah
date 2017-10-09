import {Deborah} from "../deborah";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";
import {markov} from "../markov";

export class DeborahResponderMarkov extends DeborahResponder
{
	markov: any;
	constructor(bot: Deborah){
		super(bot);
		this.name ="Markov";
		this.markov = new markov();
	}
	generateResponse(req: DeborahMessage){
		var result = req.analytics;
		var rnd = Math.floor(Math.random() * result.importantWords.length);
		this.markov.makeSentence(result.words[result.importantWords[rnd]][0], function(sentence){
			req.driver.reply(req, sentence);
		});
	}
}
