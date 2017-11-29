
import {Deborah} from "../deborah";
import {DeborahDriver} from "../driver";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";
import {DeborahDriverSlack} from "../driver/slack";

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

declare global {
	interface String {
		isKanjiAt(index: number): boolean;
	}
}

//http://d.hatena.ne.jp/favril/20090514/1242280476
String.prototype.isKanjiAt = function(index){
	var u = this.charCodeAt(index);
	if( (0x4e00  <= u && u <= 0x9fcf) ||	// CJK統合漢字
		(0x3400  <= u && u <= 0x4dbf) ||	// CJK統合漢字拡張A
		(0x20000 <= u && u <= 0x2a6df) ||	// CJK統合漢字拡張B
		(0xf900  <= u && u <= 0xfadf) ||	// CJK互換漢字
		(0x2f800 <= u && u <= 0x2fa1f)){ 	// CJK互換漢字補助
		return true;
	}
	return false;
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
		/*
			sample conversation:
			C言語書きたいなあ
			とりあえずputsを挿入して
			コンパイルして
			コンパイルして
			インデントくらい揃えてよ
			putsの第一引数を `"Hello, world"` にして
		 */
		//console.log(JSON.stringify(req.analytics.words, null, " "));
		var match_init = req.wordMatch(["*", "C", "言語", "*", "書き", "たい", "*"])
		var match_indent = req.wordMatch(["*", "インデント", "*", "揃え", "*"]);
		var match_compile = req.wordMatch(["*", "コンパイル", "*"]);
		var match_insert = req.wordMatch(["*", ".", "挿入", "*"]);
		var match_replace_args = req.wordMatch(
			["*", "の", "*", "引数", "*", "に", "し", "て", "*"]);
		var match_codeblock = req.text.match(/`.*?`/g);
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
				req.driver.reply(req, "こんな感じ\n```\n" + stderr + "\n```");
			});
		} else if(match_insert){
			if(!this.currentCode){
				req.driver.reply(req, "まだソースコードがないよ!");
				return;
			}
			var elemName = match_insert[0].slice(-1)[0][0];
			if(elemName === "puts"){
				this.currentCode.splice(this.currentLine - 1, 0, "puts(\"\");");
				this.uploadCode(req);
			} else{
				req.driver.reply(req, "よくわからない…。");
			}
		} else if(match_replace_args){
			console.log(JSON.stringify(this.currentCode, null, " "));
			var target = match_replace_args[0].slice(-1)[0][0];
			var info = {
				target: target,
				line: parseInt(this.findTargetLineListInCode(target)[0]),
				argIndex: this.getIndexFromWords(match_replace_args[2]),
				replace: match_codeblock,
			};
			req.driver.reply(req, "replace: " + JSON.stringify(info, null, " "));
			var err: string;
			if(err = this.replaceArgument(
				info.line, info.argIndex, info.replace[0])){
				req.driver.reply(req, err);
			} else{
				this.uploadCode(req);
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
	setCurrentCode(str: string)
	{
		this.currentCode = str.split("\n");
	}
	getIndexFromWords(words: string[][])
	{
		var index = -1;
		for(var k of words){
			console.log(k.join("\t"));
			if(k[2] === "数"){
				if(k[0].isKanjiAt(0)){
					index = this.getNumberInKanji(k[0]);
					console.log("kanji num: " + index);
				} else{
					index = parseInt(k[0]);
					console.log("alphabet num: " + index);
				}
			}
		}
		return index;
	}
	getNumberInKanji(kanjiStr: string)
	{
		var table = ['', '一', '二', '三', '四', '五'];
		return table.indexOf(kanjiStr[0]);
	}
	findTargetLineListInCode(target: string)
	{
		var list = [];
		for(var i in this.currentCode){
			if(this.currentCode[i].indexOf(target) !== -1){
				list.push(parseInt(i) + 1);
			}
		}
		console.log("findTargetLineListInCode: " + list);
		return list;
	}
	convertLineToAST(lineStr: string)
	{
		var line = lineStr.split("").reverse();
		var inStrLiteral = function(){
			var list = ['"'];
			var part = "";
			var c;
			while((c = line.pop()) !== undefined){
				if(c === '"'){
					list.push(part);
					break;
				}
				part += c;
			}
			return list;
		}
		var inArg = function(){
			var list: any = ['('];
			var part = "";
			var c;
			while((c = line.pop()) !== undefined){
				if(c === '"'){
					if(part.length) list.push(part);
					list.push(inStrLiteral())
					part = "";
					continue;
				}
				if(c === ')' || c === ','){
					list.push(part);
					list.push(c);
					part = "";
					if(c === ')') break;
					continue;
				}
				part += c;
			}
			return list;
		}

		var f = function(){
			var list = [];
			var part = "";
			var c;
			while((c = line.pop()) !== undefined){
				if(c === '('){
					list.push(part);
					list.push(inArg())
					part = "";
					continue;
				}
				part += c;
			}
			list.push(part);
			return list;
		}
		var ast = f();
		console.log(JSON.stringify(ast, null, " "));
		return ast;
	}
	replaceArgument(line: number, index: number, replace: string): string
	{
		var lineIndex = line - 1;
		if(lineIndex < 0 || this.currentCode.length <= lineIndex){
			return line + "行目なんてありません！";
		}
		var ast = this.convertLineToAST(this.currentCode[lineIndex]);
		console.log(JSON.stringify(ast, null, " "));
		var args = ast[1];
		if(index < 1 || args.length - 1 < index){
			return index + "個目の引数なんてありません！";
		}
		args[index] = replace.substring(1, replace.length - 1);
		const flatten = require('flatten');
		this.currentCode[lineIndex] = flatten(ast).join("");
		return undefined;
	}
}

export class DeborahResponderMichiru extends DeborahResponder
{
	name = "michiru";
	codingManager: MichiruCoding;
	yomiDict = [
		"リンゴ",
		"ゴリラ",
		"ラッパ",
		"パイナップル",
		"ルーマニア",
		"アフリカ",
		"カナダ",
		"ダルマ",
		"ラクダ",
		"サクラ"
	];
	constructor(bot: Deborah){
		super(bot);
		this.codingManager = new MichiruCoding();
	}
	procerssTrainTransferRoute(req: DeborahMessage, fromStr: string, toStr: string){
		var scraperjs = require('scraperjs');
		var from = encodeURIComponent(fromStr);
		var to = encodeURIComponent(toStr);
		var url = `https://www.jorudan.co.jp/norikae/cgi/nori.cgi?
			eki1=${from}&
			eki2=${to}&
			eki3=&via_on=1&Dym=201711&Ddd=29&Dhh=17&Dmn1=2&Dmn2=2&
			Cway=0&Cfp=1&Czu=2&C7=1&C2=0&C3=0&C1=0&C4=0&C6=2&
			S.x=80&S.y=18&
			S=%E6%A4%9C%E7%B4%A2&
			Cmap1=&rf=nr&pg=0&eok1=&eok2=&eok3=&Csg=1`
			.split("\n").join("").split("\t").join("");

		console.log(url)

		scraperjs.StaticScraper.create(url)
			.scrape(function($) {
				return $(".data_total-time dd").eq(0).map(function() {
					return $(this).text();
				}).get();
			})
			.then(function(news) {
				var timeText = news.join("").split("\t").join("").split("\n\n").join("");
				req.driver.reply(req, timeText + "くらいらしいよー！");
			})
	}
	generateResponse(req: DeborahMessage){
		var locWords = req.analytics.words.filter(
			(v) => {
				return v[3] == "地域" && v[0] != "駅";
			}
		).map(
			(v) => {
				return v[0];
			}
		);
		console.log(locWords);
		if(locWords.length == 2){
			this.procerssTrainTransferRoute(req, locWords[0], locWords[1]);
		}
		//this.codingManager.process(req);
		/*
		if(req.analytics.words.length !== 1){
			req.driver.reply(req, "それは単語じゃないよー");
			return 0;
		}
		var yomi = req.analytics.words[0][8];
		var first = yomi[yomi.length - 1];
		req.driver.reply(req,"次は" + this.getNextYomiWord(first));
		 */
	}
	processRouteSearch(from: string, to: string){
	
	}
	getNextYomiWord(first: string)
	{
		for(var i = 0; i < this.yomiDict.length; i++){
			if(this.yomiDict[i][0] === first) return this.yomiDict[i];
		}
		return null;
	}
}
