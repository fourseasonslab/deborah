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
		console.log(JSON.stringify(result, null, " "));
		var match = req.wordMatch(["C", "言語", "*", "書き", "たい"]);
		if(match){
			if(req.driver instanceof DeborahDriverSlack){
				var sd: DeborahDriverSlack = req.driver;
				sd.uploadSnippet("test.c", req.context, "// Hello, world", "c");
			}
			req.driver.reply(req, "```\nそうだね〜〜〜\n```");
		} else{
			req.driver.reply(req, JSON.stringify(result));
		}
	}
}
