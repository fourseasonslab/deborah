var fs = require('fs');

var text;
var segs;
var make_sentence = [];
var dim;
var firstIndex;
var endmark = /。$|．$/;

dim = 2;

text = fs.readFileSync('segs_souseki.txt', 'utf-8');
var parseText = function (inp) {
	/*
	 inp = inp.replace(/ /g, ",");
	 inp = inp.replace(/\r/g, "");
	 inp = inp.replace(/\s+$/, "");
	 */
	var segs = inp.split(" ");
	return segs;
};
segs = parseText("" + text);

do{
	firstIndex = Math.floor(Math.random() * (segs.length - dim));
}while(/、|が|を|に|の|と|は|も/.test(segs[firstIndex]));

for(var i=0; i<dim; i++){
	make_sentence.push(segs[firstIndex + i]);
}

while(true){
	var words = [];

	/* wordsにdim個の同じ形態素が連続した後の単語候補を入れる */
	for(var i=0; i<(segs.length - dim); i++){
		//console.log(segs[i] + segs[i+1] + "の後に続く単語: ");
		for(var k=0; k<dim; k++){
			if(!(make_sentence[make_sentence.length - dim + k] === segs[i+k])) break;
			if(k === dim - 1) words.push(segs[i+k+1]);
		}
		//console.log(words);
	}

	if(words.length > 0){
		r = Math.floor(Math.random() * words.length);
		make_sentence.push(words[r]);

		//console.log("生成中の文章: " + make_sentence.join(""));

		if(endmark.test(words[r])){
			console.log("生成した文章: " + make_sentence.join(""));
			break;
		}
	}else{
		break;
	}
}
