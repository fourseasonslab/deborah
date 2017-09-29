class DeborahResponderMarkov extends DeborahResponder
{
	markov: any;
	constructor(bot: Deborah){
		super(bot);
		this.name ="Markov";
			this.markov = new markov();
		this.markov.loadText();
	}
	generateResponse(req: DeborahMessage){
		var result = req.analytics;
		var rnd = Math.floor(Math.random() * result.importantWords.length);
		this.markov.makeSentence(result.words[result.importantWords[rnd]][0], function(sentence){
			req.driver.reply(req, sentence);
		});
	}
}
