abstract class DeborahDriver
{
	bot: Deborah;
	settings: any;
	//
	constructor(bot: Deborah, settings: any){
		this.bot = bot;
		this.settings = settings;
	}
	reply(replyTo: DeborahMessage, message: string){
		console.log("DeborahDriver: Default: " + message);
	}
	protected tryRequire(path: string) : any {
		try {
			return require(path);
		} catch(e) {
			console.log("DeborahDriver needs '" + path + "'.\n Please run 'sudo npm install -g " + path + "'");
		}
		return null;
	}
}