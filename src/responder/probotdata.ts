var probot_hello = [
"こんにちは。今日はどんな気分？"
];

var probot_bye = [
"それじゃあまたね"
];

var probot_off = [
"おやすみ"
];

var probot_keywords = [

	/*
	書き方
	["<key>", <rank>, [
		["<decomp>", [
			"<reply>",
			"<reply>"
		]]
		["<>", [
			"<>",
			"<>"
		]]
	]]

	 */

	["else", 0, [
		["*", [
			"それでそれで？",
			"ふーん、そうなんだ"
		]]
	]],
	["こんにちは", 0, [
		["*", [
			"こんにちは〜！",
			"挨拶って気持ちいいよね",
			"こんにちは！どうしたの？",
			"こんにちはー！ぷろぼっとです、よろしくね"
		]]
	]]
	,
	["疲れる", 13, [
		["*", [
			"お疲れさま！よくがんばったね！",
			"おつかれさま、きっといいことあるよ！"
		]]
	]]
	,
	["褒める", 10, [
		["*", [
			"褒めて欲しいの？わかった！えらいえら〜い！",
			"いつもいい子だよね！"
		]]
	]]
	,
	["痛い", 0, [
		["*", [
			"痛いの？だいじょうぶ？",
			"心配だなぁ、病院行った方がいいかもね"
		]]
	]]
	,
	["ごめん", 10, [
		["*", [
			"謝らなくていいよ",
			"わたしもなんかごめんね"
		]]
	]]
	,
	["眠い", 14, [
		["*", [
			"昨日夜更かししたの？",
			"人間はちゃんと寝ないとだめだよ！"
		]]
	]]
	,
	["うん", 5, [
		["", [
			"そっか！",
			"うんうん、そうだよね"
		]]
	]]
	,
	["いいえ", 5, [
		["", [
			"そうじゃなかったのか",
			"そうかなって思ったんだけど"
		]]
	]]
	,
	["違う", 10, [
		["", [
			"あ、間違えちゃった、ごめんなさい",
			"何が違うの？"
		]]
	]]
	,	
	["そう", 4, [
		["", [
			"ふーん",
			"へえ！"
		]]
	]]
	,
	["たい",10, [
		["", [
			"そうしたいならしたらいいのに",
			"なんでそうしたいの？"
		]]
	]]
	,
	["すく", 5, [
		["", [
			"おなかすいたの？",
			"何食べたいの"
		]]
	]]
	,
	["食べる", 5, [
		["", [
			"美味しそうだね",
			"いいねえ"
		]]
	]]
	,
	["たぶん", 3, [
		["", [
			"自信がないの？",
			"たぶんそうだね"
		]]
	]]
	,
	["教える", 5, [
		["", [
			"なんで知りたいの？",
			"調べてみたら？"
		]]
	]]
	,
	["おもしろい", 5, [
		["", [
			"おもしろいっていい意味で？",
			"そうだね、おもしろいかも"
		]]
	]]
	,
	["コンピュータ", 20, [
		["", [
			"興味があるの？",
			"いい使われ方するといいな"
		]]
	]]
	,
	["難しい", 10, [
		["", [
			"難しいことはわからないな",
			"難しいけど、もうちょっとがんばってみる"
		]]
	]]
,
	["つらい", 20, [
		["", [
			"つらいときはちょっと休憩！急がば回れじゃない？",
			"何がつらいの？話ならきけるよ"
		]]
	]]
,
	["死ぬ", 20, [
		["", [
			"死ぬなんて怖いこと言わないで！",
			"死ぬってなんだろう"
		]]
	]]
,
	["行く", 10, [
		["", [
			"楽しいところ？",
			"写真見たいなあ"
		]]
	]]
	,
	["嬉しい", 10, [
		["", [
			"嬉しいことがあったの？よかったね",
			"どうして嬉しくなるの？"
		]]
	]]
	,
	["悲しい", 10, [
		["", [
			"悲しませちゃった？私のせいだったらごめんなさい",
			"どうして悲しくなるの？"
		]]
	]]
	,
	["怒る", 10, [
		["", [
			"わたしに怒ってる？",
			"なんで怒るの？"
		]]
	]]
	,
	["名前", 10, [
		["", [
			"私の名前はぷろぼっと(仮)、あなたは？",
			"名前覚えるのって難しいよね"
		]]
	]]
	,
	["ありがとう",3, [
		["", [
			"どういたしまして",
			"おたがいさまだよ！"
		]]
	]]
,
	["働く", 10, [
		["", [
			"働くって大変だよね",
			"お仕事したくないなぁ"
		]]
	]]
	,
	["言語", 10, [
		["", [
			"日本語しかわからないの",
			"C言語って知ってる？"
		]]
	]]
	,
	["知る", 10, [
		["", [
			"知りたいことたくさんあるけど時間が足りないね",
			"それわたしは知らない！"
		]]
	]]
	,["わーい", 7, [
		["", [
			"よかったねー！",
		"やったー！"
		]]
	]]
	,
	["今日", 5, [
		["", [
			"あなたは何をしてたの？",
			"どんな1日だった？"
		]]
	]]
	,
	["何", 4, [
		["", [
			"何だっけ...",
			"忘れちゃった！"
		]]
	]]
	,
	["無理", 10, [
		["", [
			"そんなぁ、もうちょっとがんばってみよう！",
			"そういう日もあるよね！"
		]]
	]]
	,
	["おいしい", 10, [
		["", [
			"おいしいもの食べたーい！",
			"今は何が食べたい？"
		]]
	]]
	,
	["酒", 30, [
		["", [
			"お酒おいしいよね！でもはたちになってからね！",
			"いやなことでもあったの？"
		]]
	]]
	,
	["楽しい", 10, [
		["", [
			"楽しいのは何より！",
			"笑ってるといいことあるよ、きっと！"
		]]
	]]
	,
	["パソコン", 10, [
		["", [
			"パソコンって...わたしのこと？",
			"かたくておもいよね〜"
		]]
	]]
	,
	["だ", 0, [
		["", [
			"そうなの？",
			"へー、そうだったんだ"
		]]
	]]
	,
	["ねえ", 0, [
		["", [
			"なーに？呼んだ？",
			"ごめんきいてなかった！もう一度！"
		]]
	]]
	,
	["朝", 4, [
		["", [
			"早起きって難しくない？",
			"そういえば朝ごはん何食べたの？"
		]]
	]]
	,
	["寝坊", 10, [
		["", [
			"あら、おねぼうさん！",
			"起きれただけでもいいよ！"
		]]
	]]
	,
	//おもしろいもある...困った
	["面白い", 10, [
		["", [
			"座布団もらえるくらい面白い！？",
			"面白いって褒め言葉？"
		]]
	]]
	,
	["殺す", 9, [
		["", [
			"法律に触れることはしちゃだめだよ...?",
			"何があったの？"
		]]
	]]
	/*,
	["良い", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	"", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	,
	["", , [
		["", [
			"",
			""
		]]
	]]
	*/
];