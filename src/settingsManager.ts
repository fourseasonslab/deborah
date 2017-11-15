const Ajv = require('ajv');

const settingsSchema = {
	"description": "Deborah settings file",
	"type": "object",
	"properties": {
		"interfaces":{
			"type": "array",
			"items": {
				"type": "object",
				"properties": {
					"type": {
						"type": "string"
					},
					"team": {
						"type": "string"
					},
					"token": {
						"type": "string"
					},
					"channel": {
						"type": "array",
						"items":{
							"type": "string"
						}
					},
				},
				"additionalProperties": false,
			}
		},
		"responders":{
			"type": "array",
			"items": {
				"type": "string"
			}
		},
		"profile":{
			"type": "object",
			"properties": {
				"name":{
					"type": "string"
				},
				"slack-icon":{
					"type": "string"
				}
			},
			"additionalProperties": false,
			"required": [
				"name", "slack-icon"
			],
		},
		"lib":{
			"type": "object",
			"properties": {
				"word2vec": {
					"type": "object",
					"properties": {
						"vectorPath": {"type": "string"},
					},
				},
			},
		},
	},
	"required":[
		"interfaces",
		"responders",
		"profile",
		"lib",
	],
	"additionalProperties": false,
};

export class DeborahSettingsManager
{
	settings: any;
	interfaces: any;
	responders: any;
	profile: any;
	lib: any;

	constructor(){

	}
	load(){
		// =============== Load Settings ===============
		var fs = require("fs");
		let fval, fname = "settings.json";
		try {
			fval = fs.readFileSync('settings.json');
		} catch(e) {
			console.log("settings.json not found.\nimporting settings from environmental variable...");
			fval = process.env.DEBORAH_CONFIG;
		}
		if (!fval) {
			console.log("Error: cannot load settings.");
			process.exit(1);
		}
		this.settings = JSON.parse(fval);
		var ajv = new Ajv();
		var validate = ajv.compile(settingsSchema);
		var valid = validate(this.settings);
		if (!valid){
			console.log(validate.errors);
			process.exit(1);
		}
		this.interfaces = this.settings.interfaces;
		this.responders = this.settings.responders;
		this.profile = this.settings.profile;
		this.lib = this.settings.lib;	
	}
}
