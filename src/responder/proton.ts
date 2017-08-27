class DeborahResponderProton extends DeborahResponder
{

	

	constructor(bot: Deborah){
		super(bot);
		this.name ="Word2Vec";
		console.log("計算できたよ！");
	};
	generateResponse(req: DeborahMessage){

			var result = req.analytics;
		//	var that = this;

	}
}
