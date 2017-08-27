import {Deborah} from "../deborah";
import {DeborahDriver} from "../driver";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";

import { Word2Vec } from "node-word2vec";

export class DeborahResponderWord2Vec extends DeborahResponder
{
	bot: Deborah;
	name: string;
	//
	w2v = null;
	constructor(bot: Deborah){
		super(bot);
		this.name ="Word2Vec";
		this.w2v = new Word2Vec(this.bot.settings.lib.word2vec.vectorPath);
	};
	generateResponse(req: DeborahMessage){
		this.w2v.getVector(req.text, function(v1){
			console.log(req.text + 'のべくとるは' + JSON.stringify(v1) + 'なんだって！');
		});
	}
}

