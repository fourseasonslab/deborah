import {Deborah} from "../deborah";
import {DeborahDriver} from "../driver";
import {DeborahMessage} from "../message";
import {DeborahResponder} from "../responder";
import {probot_keywords} from "./probotdata";
export class DeborahResponderProton extends DeborahResponder
{
	constructor(bot: Deborah){
		super(bot);
		this.name = "Proton";
		//	var eliza = new Elizabot();
	};
	generateResponse(req: DeborahMessage){

		var result = req.analytics;
		var that = this;
		var key_num = 0;
		var subkey_num = 0;
		//console.log(result);
		//まず、入力文の中の単語のうち一番優先度(keylist)が高いものを探す
		for(var i=0; i<result.words.length; i++){
			//if(key_num>0) break;
			for(var j=1; j<probot_keywords.length; j++){//j=0は例外なので1から
				if(result.words[i][7] == probot_keywords[j][0]){

						//優先度をみる
						if(probot_keywords[key_num][1]<=probot_keywords[j][1]){
							key_num = j;
						}

					//console.log(probot_keywords[j][2][0][1][0]);
					//var rnd = Math.floor(Math.random() * probot_keywords[j][2][0][1].length);
					//req.driver.reply(req, probot_keywords[j][2][0][1][rnd]);
				}
			}
			//console.log(result.words[i][7]);//終止形またはそのまま
		}
		if(key_num == 0){
			req.driver.reply(req, probot_keywords[0][2][0][1][0]);
		}else{
			//サブキーが設定されてる場合
			/*			if(probot_keywords[key_num][2].length > 0){
				//probot_keywords[key_num][2][!!!][1][rnd]を返す。!!!の数字を判定する。
				for(var i=0; i<result.words.length; i++){
					for(var j=1; j<probot_keywords[key_num][2].length; j++){//最初のひとつは例外
						if(result.words[i][7] == probot_keywords[key_num][2][j][0]){
							subkey_num = j;
						}
					}
				}
			}
			 */
			//そうでないならsubkey_numは0のまま
			//ランダムに選択
			var rnd = Math.floor(Math.random() * probot_keywords[key_num][2][subkey_num][1].length);
			req.driver.reply(req, probot_keywords[key_num][2][subkey_num][1][rnd]);
			
		}
		//みつけた単語の返答からランダムで返答を選択する

		//ほんとはこんなかんじにしたいけど
		//req.driver.reply(req, eliza.transform(result));
	
	}
}
