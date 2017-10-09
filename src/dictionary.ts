export class DeborahMarkovDictionary
{
	nextWordFile: string;
	prevWordFile: string;
	static nextWordDic = {};
	static prevWordDic = {};
	segs: any[];
	mecab;
	fs = require('fs');

	constructor(nextWordFile: string, prevWordFile: string)
	{
		var MeCab = require('mecab-lite');
		this.mecab = new MeCab;
		this.nextWordFile = nextWordFile;
		this.prevWordFile = prevWordFile;
		try{
			//var this.fs = require('this.fs');
			DeborahMarkovDictionary.nextWordDic = JSON.parse(this.fs.readFileSync(nextWordFile));
			DeborahMarkovDictionary.prevWordDic = JSON.parse(this.fs.readFileSync(prevWordFile));
		} catch(e){
			console.log("Dictionary file load failed: " + e);
		}
		if(DeborahMarkovDictionary.nextWordDic === undefined){
			console.log(this.nextWordFile + "読めなかったんですけど...");
			DeborahMarkovDictionary.nextWordDic = {};
		}
		if(DeborahMarkovDictionary.prevWordDic === undefined) DeborahMarkovDictionary.prevWordDic = {};
	}

	static getNextWordsDic(){
		return DeborahMarkovDictionary.nextWordDic;
	}

	static getPrevWordsDic(){
		return DeborahMarkovDictionary.prevWordDic;
	}

	addWordsToDic(data: string){
		this.mecab.parse(data, (err, result) => {
			if(this.segs === undefined) this.segs = [];
			if(result){
				for(var i=0; i<result.length-1; i++){
					//ans += result[i][0] + " ";
					this.segs.push(result[i][0]);
				}
			}
			this.addNextWords();
			this.addPrevWords();
		});
	}

	addNextWords() {
		if(this.segs === undefined){
			console.log("segsが空っぽじゃない？");
			this.segs = [];
		}
		for(var i=0; i<this.segs.length; i++){
			if(!DeborahMarkovDictionary.nextWordDic[this.segs[i]]) DeborahMarkovDictionary.nextWordDic[this.segs[i]] = [];
			var candidates = DeborahMarkovDictionary.nextWordDic[this.segs[i]];
			if(candidates == undefined){
				candidates = [];
				candidates.push([this.segs[i+1], 1]);
			}else{
				var f = () => {
					for(var k=0; k<candidates.length; k++){
						if(candidates[k][0] == this.segs[i+1]){
							candidates[k][1]++;
							return candidates[k];
						}
					}
					return null;
				}
				var func = f();
				if(func == null){
					candidates.push([this.segs[i+1], 1]);
				}
			}
		}
		return DeborahMarkovDictionary.nextWordDic;
	}

	addPrevWords() {
		for(var i=this.segs.length -1; i>0; i--){
			if(!DeborahMarkovDictionary.prevWordDic[this.segs[i]]) DeborahMarkovDictionary.prevWordDic[this.segs[i]] = [];
			var candidates = DeborahMarkovDictionary.prevWordDic[this.segs[i]];
			if(candidates == undefined){
				candidates = [];
				candidates.push([this.segs[i-1], 1]);
			}else{
				var f = () => {
					for(var k=0; k<candidates.length; k++){
						if(candidates[k][0] == this.segs[i-1]){
							candidates[k][1]++;
							return candidates[k];
						}
					}
					return null;
				}
				var func = f();
				if(func == null){
					candidates.push([this.segs[i-1], 1]);
				}
			}
		}
		return DeborahMarkovDictionary.prevWordDic;
	}

	saveToFile(nextWordFile: string = this.nextWordFile, prevWordFile: string = this.prevWordFile) {
		var keys = Object.keys(DeborahMarkovDictionary.nextWordDic);
		for(var i=0; i<keys.length; i++){
			DeborahMarkovDictionary.nextWordDic[keys[i]].sort((a, b) => {
				return (b[1] - a[1]);
			});
		}
		keys = Object.keys(DeborahMarkovDictionary.prevWordDic);
		for(var i=0; i<keys.length; i++){
			DeborahMarkovDictionary.prevWordDic[keys[i]].sort((a, b) => {
				return (b[1] - a[1]);
			});
		}
		this.fs.writeFileSync(nextWordFile, JSON.stringify(DeborahMarkovDictionary.nextWordDic), null, " ");
		this.fs.writeFileSync(prevWordFile, JSON.stringify(DeborahMarkovDictionary.prevWordDic), null, " ");
		console.log("Dictionary saved to: " + this.nextWordFile + ", " + this.prevWordFile);
	}
}
