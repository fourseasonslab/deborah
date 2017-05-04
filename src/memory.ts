class DeborahMemoryIOEntry
{
	text: string;
	sender: string;
	date: Date;
	action: string;
	context: string;
	driver: string;
	constructor(data: any)
	{
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
	journal: DeborahMemoryIOEntry[] = [];
	constructor(){
	
	}
	appendReceiveHistory(data: DeborahMessage){
		this.journal.push(DeborahMemoryIOEntry.createFromReceivedMesssage(data));
		console.log(JSON.stringify(this.journal, null, " "));
	}
}
