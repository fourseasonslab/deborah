class Cabocha
{
	p: any;  
	f: Function;
	constructor(opt?: string){
		var childprocess = require("child_process");
		this.p = childprocess.spawn('cabocha', ["-" + (opt == undefined ? "f1" : opt), "-d", "/usr/local/lib/mecab/dic/mecab-ipadic-neologd"], {});
		var that = this;
		this.p.stdout.on('data', function(data){
			//console.log('stdout: ' + data);
			//console.log(that);
			if(that.f instanceof Function){
				var parseCabochaResult = function (inp) {
					inp = inp.replace(/ /g, ",");
					inp = inp.replace(/\r/g, "");
					inp = inp.replace(/\s+$/, "");
					var lines = inp.split("\n");
					var res = lines.map(function(line) {
						return line.replace('\t', ',').split(',');
					});
					return res;
				};
				var res = parseCabochaResult("" + data);
				//console.log(res);

				var depres = [];    //dependency relationsのresultって書きたかった
				var item = [0, "", []];	// [relID, "chunk", [[mecab results]]]o
				var mecabList = [];
				var mecabs = [];
				var scores = [];
				var score;
				//var types = [];
				for(var i = 0; i < res.length; i++){
					var row = res[i];
					if(i != 0 && (row[0] === "EOS" || row[0] === "*")){
						item[2] = mecabList;
						depres.push(item);
						item = [0, "", []];
						mecabList = [];
					}
					if(row[0] === "EOS") break;
					if(row[0] === "*"){
						item[0] = parseInt(
							row[2].substring(0, row[2].length - 1));
						score = row[4];
					} else{
						item[1] += row[0];
						mecabs.push(row);
						mecabList.push(mecabs.length - 1);
						var scr = Number(score);

						//scores.push(row[0]);
						scores.push(scr);
					}
				}
				var normScores = [];
				var scrmin = Math.min.apply(null, scores);
				var scrmax = Math.max.apply(null, scores);
				for(var i=0; i < scores.length; i++){
					normScores[i] = (scores[i] - scrmin) / (scrmax - scrmin);
				}
				for(var i = 0; i< mecabs.length; i++){
					if(mecabs[i][0] === "動詞" || mecabs[i] === "形容詞" || mecabs[i] === "形容動詞" || mecabs[i] === "名詞"){
						normScores[i] *= 2;
					}
				}
				var ret = {
					depRels: depres,
					words: mecabs,
					scores: normScores,
					//types: types
				};
				that.f(ret);
			}
		});
		this.p.on('exit', function (code) {
			console.log('child process exited.');
		});
		this.p.on('error', function (err) {
			console.error(err);
			process.exit(1);
		});
	}

	parse(s: string, f: Function){
		this.f = f;
		this.p.stdin.write(s + "\n");
	}

}


