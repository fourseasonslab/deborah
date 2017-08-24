function promiseCabocha(bot: Deborah, text: string) : Promise<{ result: any }>
{
	return new Promise((resolve) => {
		bot.cabochaf1.parse(text, resolve);	
	});
}

namespace MichiruCodingTemplate
{
	export const C = `#include <stdio.h>

int main(int argc, char *argv[]){
	// HERE!!!!
	return 0;
}
`;
}

class DeborahResponderMichiru extends DeborahResponder
{
	name = "michiru";
	constructor(bot: Deborah){
		super(bot);
	}
	generateResponse(req: DeborahMessage){
		var recentMessageList = 
			this.bot.memory.getRecentConversationInContext(req.context);
		var match = req.wordMatch(["C", "言語", "*", "書き", "たい", "*"]);
		if(match){
			if(req.driver instanceof DeborahDriverSlack){
				var sd: DeborahDriverSlack = req.driver;
				sd.uploadSnippet(req.context, "test.c", MichiruCodingTemplate.C, "c");
			}
			req.driver.reply(req, "ここからどうすればいい？");
		} else{
			req.driver.reply(req, "んー難しい…");
			req.driver.reply(req,
				"```" + JSON.stringify(recentMessageList, null, " ") +"```");
		}
	}
}
