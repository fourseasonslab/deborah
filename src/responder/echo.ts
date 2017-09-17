class DeborahResponderEcho
{
	name: string;
	bot: Deborah;
	constructor(bot: Deborah){
		this.bot = bot;
		this.name = "Echo";
	}
	generateResponse(req: DeborahMessage){
		// echo
		req.driver.reply(req, req.text);
	}
	reply(req: DeborahMessage, text: string){
		req.driver.reply(req, text);
	}
}