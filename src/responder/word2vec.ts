class DeborahResponderWord2Vec extends DeborahResponder
{

	w2v = null;

	constructor(bot: Deborah){
		super(bot);
		this.name ="Word2Vec";
		var W2V = require("node-word2vec");
		this.w2v = new W2V(this.bot.settings.lib.word2vec.vectorPath);
		
	};
	generateResponse(req: DeborahMessage){
		this.w2v.getVector(req.text, function(v1){
			console.log(req.text + 'のべくとるは' + JSON.stringify(v1) + 'なんだって！');
		});
	}
}
