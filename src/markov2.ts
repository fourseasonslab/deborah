export class DeborahMarkovDictionary
{
	nextWordFile: string;
	prevWordFile: string;
	nextWordDic = {};
	prevWordDic = {};
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
			this.nextWordDic = JSON.parse(this.fs.readFileSync(nextWordFile));
			this.prevWordDic = JSON.parse(this.fs.readFileSync(prevWordFile));
		} catch(e){
			console.log("Dictionary file load failed: " + e);
		}
		if(this.nextWordDic === undefined){
			console.log(this.nextWordFile + "読めなかったんですけど...");
			this.nextWordDic = {};
		}
		if(this.prevWordDic === undefined) this.prevWordDic = {};
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
			if(!this.nextWordDic[this.segs[i]]) this.nextWordDic[this.segs[i]] = [];
			var candidates = this.nextWordDic[this.segs[i]];
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
		return this.nextWordDic;
	}

	addPrevWords(prevWordDic: Object = this.prevWordDic, segs: any[] = this.segs) {
		for(var i=segs.length -1; i>0; i--){
			if(!prevWordDic[segs[i]]) prevWordDic[segs[i]] = [];
			var candidates = prevWordDic[segs[i]];
			if(candidates == undefined){
				candidates = [];
				candidates.push([segs[i-1], 1]);
			}else{
				var f = () => {
					for(var k=0; k<candidates.length; k++){
						if(candidates[k][0] == segs[i-1]){
							candidates[k][1]++;
							return candidates[k];
						}
					}
					return null;
				}
				var func = f();
				if(func == null){
					candidates.push([segs[i-1], 1]);
				}
			}
		}
		return prevWordDic;
	}

	saveToFile(nextWordFile: string = this.nextWordFile, prevWordFile: string = this.prevWordFile) {
		var keys = Object.keys(this.nextWordDic);
		for(var i=0; i<keys.length; i++){
			this.nextWordDic[keys[i]].sort((a, b) => {
				return (b[1] - a[1]);
			});
		}
		keys = Object.keys(this.prevWordDic);
		for(var i=0; i<keys.length; i++){
			this.prevWordDic[keys[i]].sort((a, b) => {
				return (b[1] - a[1]);
			});
		}
		this.fs.writeFileSync(nextWordFile, JSON.stringify(this.nextWordDic), null, " ");
		this.fs.writeFileSync(prevWordFile, JSON.stringify(this.prevWordDic), null, " ");
		console.log("Dictionary saved to: " + this.nextWordFile + ", " + this.prevWordFile);
	}
}
