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
	currentCode: string[];
	currentLine: number;
	context: string;
	instr: MichiruCodingOperation[] = [];
	constructor(context?: string)
	{
		this.context = context;
	}
	process(req: DeborahMessage)
	{
		console.log(JSON.stringify(req.analytics.words, null, " "));
		var match_init = req.wordMatch(["*", "C", "言語", "*", "書き", "たい", "*"])
		var match_indent = req.wordMatch(["*", "インデント", "*", "揃え", "*"]);
		var match_compile = req.wordMatch(["*", "コンパイル", "*"]);
		var match;
		if(match_init){
			if(this.currentCode === undefined){
				this.currentCode = MichiruCodingTemplate.C.concat();
				this.currentLine = 4;
			} else{
				req.driver.reply(req, "今やってる途中だよ？覚えてる？");
			}
			this.uploadCode(req);
			req.driver.reply(req, "ここからどうすればいい？");
		} else if(match_indent){
			if(!this.currentCode){
				req.driver.reply(req, "まだソースコードがないよ!");
				return;
			}
			const uuidv4 = require('uuid/v4');
			var tmpFileName = "./tmp/" + uuidv4() + ".c";
			const fs = require('fs');
			fs.writeFileSync(tmpFileName, this.getCurrentCodeStr());
			const { exec } = require('child_process');
			exec('clang-format ' + tmpFileName, (error, stdout, stderr) => {
				if(error){
					return;
				}
				this.currentCode = stdout.split('\n');
				this.uploadCode(req);
				req.driver.reply(req, "インデントしたよ〜");
			});
		} else if(match_compile){
			if(!this.currentCode){
				req.driver.reply(req, "まだソースコードがないよ!");
				return;
			}
			const uuidv4 = require('uuid/v4');
			var tmpFileName = "./tmp/" + uuidv4() + ".c";
			const fs = require('fs');
			fs.writeFileSync(tmpFileName, this.getCurrentCodeStr());
			const { exec } = require('child_process');
			exec('gcc -Wall -Wpedantic -fsyntax-only ' + tmpFileName, (error, stdout, stderr) => {
				if(error){
					return;
				}
				this.currentCode = stdout.split('\n');
				req.driver.reply(req, "こんな感じ\n```\n" + stderr + "\n```");
			});
		} else if(match = req.wordMatch([".", "を", "挿入", "*"])){
			if(!this.currentCode){
				req.driver.reply(req, "まだソースコードがないよ!");
				return;
			}
			var elemName = match[0][0];
			if(elemName === "puts"){
				this.currentCode.splice(this.currentLine - 1, 0, "puts(\"\");");
				this.uploadCode(req);
			} else{
				req.driver.reply(req, "`" + elemName + "` " + "？まだ習ってない…。");
			}
		} else{
			req.driver.reply(req, "ちょっとわからない :pray:");
		}
	}
	uploadCode(replyTo: DeborahMessage)
	{
		if(replyTo.driver instanceof DeborahDriverSlack){
			var sd: DeborahDriverSlack = replyTo.driver;
			sd.uploadSnippet(
				replyTo.context, "test.c", this.getCurrentCodeStr(), "c");
		} else{
			console.error("Driver is not Slack.");
		}
	}
	getCurrentCodeStr()
	{
		return this.currentCode.join("\n");
	}
}

class DeborahResponderMichiru extends DeborahResponder
{
	name = "michiru";
	codingManager: MichiruCoding;
	constructor(bot: Deborah){
		super(bot);
		this.codingManager = new MichiruCoding();
	}
	generateResponse(req: DeborahMessage){
		this.codingManager.process(req);
	}
}
