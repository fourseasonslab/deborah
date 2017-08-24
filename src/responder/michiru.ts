function promiseCabocha(bot: Deborah, text: string) : Promise<{ result: any }>
{
	return new Promise((resolve) => {
		bot.cabochaf1.parse(text, resolve);	
	});
}

namespace MichiruCodingTemplate
{
	export const C = [
		"#include <stdio.h>",
		"",
		"int main(int argc, char *argv[]){",
		"\t// HERE!!!!",
		"\treturn 0;",
		"}",
	];
}

enum MichiruCodingOperationType
{
	Init,
	End,
	InsertRow,
	OverwriteRow,
	DeleteRow,
}

class MichiruCodingOperation
{
	op: MichiruCodingOperationType;
	line: number = -1;
	constructor(op: MichiruCodingOperationType)
	{
		this.op = op;
	}
}

class MichiruCoding
{
	context: string;
	instr: MichiruCodingOperation[] = [];
	constructor(context: string)
	{
		this.context = context;
	}
}

class DeborahResponderMichiru extends DeborahResponder
{
	name = "michiru";
	currentCode: string[];
	currentLine: number;
	constructor(bot: Deborah){
		super(bot);
	}

	generateResponse(req: DeborahMessage){
		var recentMessageList = 
			this.bot.memory.getRecentConversationInContext(req.context);
		console.log(JSON.stringify(req.analytics.words, null, " "));
		var match;
		if(match = req.wordMatch(["C", "言語", "*", "書き", "たい", "*"])){
			if(this.currentCode === undefined){
				this.currentCode = MichiruCodingTemplate.C.concat();
				this.currentLine = 4;
			} else{
				req.driver.reply(req, "今やってる途中だよ？覚えてる？");
			}
			this.uploadCode(req, this.currentCode);
			req.driver.reply(req, "ここからどうすればいい？");
		} else if(match = req.wordMatch([".", "を", "挿入", "*"])){
			var elemName = match[0][0];
			if(elemName === "puts"){
				this.currentCode.splice(this.currentLine - 1, 0, "puts(\"\");");
				this.uploadCode(req, this.currentCode);
			} else{
				req.driver.reply(req, "`" + elemName + "` " + "？まだ習ってない…。");
			}
		} else{
			req.driver.reply(req, "ちょっとわからない :pray:");
		}
	}
	uploadCode(replyTo: DeborahMessage, codeArray: string[])
	{
		if(replyTo.driver instanceof DeborahDriverSlack){
			var sd: DeborahDriverSlack = replyTo.driver;
			sd.uploadSnippet(
				replyTo.context, "test.c", codeArray.join("\n"), "c");
		} else{
			console.error("Driver is not Slack.");
		}
	}
}
