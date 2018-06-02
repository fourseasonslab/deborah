
import {Deborah} from "../deborah";
import {DeborahDriver} from "../driver";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";
import {DeborahDriverSlack} from "../driver/slack";

const fs = require("fs");
const https = require('https');
const http = require('http');
const Iconv = require('iconv').Iconv;

function promiseCabocha(bot: Deborah, text: string) : Promise<{ result: any }>
{
	return new Promise((resolve) => {
		bot.cabochaf1.parse(text, resolve);	
	});
}

async function getWords(bot: Deborah, text: string){
	return await promiseCabocha(bot, text);
}

function isJapaneseText(text)
{
		// http://61degc.seesaa.net/article/33618150.html
		const jp_chars = ["い", "う", "ん", "し", "か", "と", "の", "た", "て", "な", "、", "に", "。"];
		for(var c of jp_chars){
					if(text.indexOf(c) >= 0){
									return true;
								}
				}
		return false;
}

function extractJapaneseLinesFromHTMLText(text): string[]
{
	return text
		.replace(/<[a-zA-Z\/][^>]*>/g, "")
		.replace(/<!--[^>]*-->/g, "")
		.split("\n")
		.filter((s) => {return isJapaneseText(s);})
		.filter((s) => {return s.trim().length > 0;})
		.filter((s) => {return s.charCodeAt(0) > 0xff;});
}

function scrapeURL(url: URL, callback: Function)
{
	console.log(`Scraping ${url}`);
	var protocol = http;
	if(url.protocol === "https:"){
		protocol = https;
	}
	try{
		var req = protocol.get(url.href, (res) => {
			var bufs = [];
			var totalLength = 0;
			res.on('data', (chunk) => {
				bufs.push(chunk);
				totalLength += chunk.length;
			});
			res.on('end', (res) => {
				var data = Buffer.concat(bufs, totalLength);
				var body = data.toString();
				callback(body);
			});
		}).on('error', (e) => {
			console.log(e.message);
		}).on('socket', (socket) => {
			socket.setTimeout(3000);
			socket.on('timeout', function() {
				req.abort();
			});
		});
	} catch(e){
		console.log(e);
	}

}

function extractURLs(text: string): URL[]
{
	// for slack
	const re_braced = /<(.*?)>/g;
	var m;
	var list: URL[] = [];
	do {
		m = re_braced.exec(text);
		if (m) {
			try{
				list.push(new URL(m[1]))
			} catch(e){
				console.log(e);
			}
		}
	} while (m);
	return list;
}

export class DeborahResponderMichiru extends DeborahResponder
{
	name = "michiru";
	constructor(bot: Deborah){
		super(bot);
	}
	generateResponse(req: DeborahMessage){
		//console.log(req);
		var url_list = extractURLs(req.text);
		if(url_list.length){
			scrapeURL(url_list[0], (result: string) => {
				var text_readable = extractJapaneseLinesFromHTMLText(result);
				req.driver.reply(req, '```\n' + text_readable.splice(0, 3).join("\n") + '\n```\nらしいよ！');

			});
		}
	}
}
