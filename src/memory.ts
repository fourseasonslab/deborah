class DeborahMemoryIOEntry
{
	id: string;
	text: string;
	sender: string;
	date: Date;
	action: string;
	context: string;
	driver: string;
	constructor(data: any)
	{
		const uuidv4 = require('uuid/v4');
		//
		this.id = (data.id === undefined ? uuidv4() : data.id);
		this.text = data.text;
		this.sender = data.sender;
		this.date = new Date(data.date);
		this.action = data.action;
		this.context = data.context;
		this.driver = data.driver;
	}
	static createFromReceivedMesssage(data: DeborahMessage)
	{
		return new DeborahMemoryIOEntry({
			action: "receive",
			text: data.text,
			sender: data.senderName,
			date: new Date(),
			context: data.context,
			driver: data.driver.constructor.name,
		});
	}
}

class DeborahMemory
{
	filename: string;
	journal: DeborahMemoryIOEntry[];
	constructor(filename: string){
		this.filename = filename;
		try{
			var fs = require("fs");
			var data = JSON.parse(fs.readFileSync(filename));
			this.journal = data.journal;
			console.log("Memory file loaded: " + this.filename);
			this.logLatestEntries();
		} catch(e){
			console.log("Memory file load failed: " + e);
		}
		if(this.journal === undefined) this.journal = [];
	}
	appendReceiveHistory(data: DeborahMessage){
		this.journal.push(DeborahMemoryIOEntry.createFromReceivedMesssage(data));
		this.logLatestEntries();
		this.saveToFile();
	}
	saveToFile(filename: string = this.filename)
	{
		var fs = require("fs");
		fs.writeFileSync(filename, JSON.stringify({
			journal: this.journal
		}));
		console.log("Memory saved to:" + this.filename);
		this.logLatestEntries();
	}
	getRecentConversation(count: number, sender: string)
	{
		var list = [];
		for(var i = 0; i < this.journal.length, list.length < count; i++){
			if(this.journal[i].sender === sender){
				list.push(this.journal[i]);
			}
		}
		return list;
	}
	logLatestEntries(count: number = 3)
	{
		console.log("Latest " + count + " journal entries:");
		console.log(JSON.stringify(this.journal.slice(-count), null, " "));
	}
}
