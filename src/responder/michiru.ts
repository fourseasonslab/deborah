function promiseCabocha(bot: Deborah, text: string) : Promise<{ result: any }>
{
	return new Promise((resolve) => {
		bot.cabochaf1.parse(text, resolve);	
	});
}

class DeborahResponderMichiru extends DeborahResponder
{
	name = "michiru";
	constructor(bot: Deborah){
		super(bot);
	}
	async generateResponse(req: DeborahMessage){
		var result = await promiseCabocha(this.bot, req.text);
		req.driver.reply(req, JSON.stringify(result));
	}
}
